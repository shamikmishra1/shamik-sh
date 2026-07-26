package com.shamikmishra.api

import kotlinx.serialization.Serializable
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.QueryRequest
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest
import java.security.MessageDigest
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

@Serializable
data class TrackEvent(
    val page: String,
    val command: String? = null,
    val referrer: String? = null
)

@Serializable
data class DailyStats(val date: String, val views: Long, val uniqueVisitors: Long)

@Serializable
data class DailyBreakdown(val date: String, val items: List<ItemCount>)

@Serializable
data class ItemCount(val name: String, val count: Long)

@Serializable
data class StatsResponse(
    val totalViews: Long,
    val totalUniqueVisitors: Long,
    val todayViews: Long,
    val todayUniqueVisitors: Long,
    val dailyStats: List<DailyStats>,
    val topCommands: List<ItemCount>,
    val countries: List<ItemCount>,
    val countriesByDay: List<DailyBreakdown>,
    val cities: List<ItemCount>,
    val citiesByDay: List<DailyBreakdown>,
    val regions: List<ItemCount>,
    val timezones: List<ItemCount>,
    val hourOfDay: List<ItemCount>,
    val dayOfWeek: List<ItemCount>,
    val devices: List<ItemCount>,
    val browsers: List<ItemCount>,
    val os: List<ItemCount>,
    val referrers: List<ItemCount>,
    val referrersByDay: List<DailyBreakdown>
)

data class VisitorInfo(
    val country: String?,
    val region: String?,
    val city: String?,
    val postalCode: String?,
    val timezone: String?,
    val latitude: String?,
    val longitude: String?,
    val device: String?,
    val browser: String?,
    val os: String?,
    val referrer: String?,
    val ipHash: String?
)

object AnalyticsService {
    private val tableName = System.getenv("ANALYTICS_TABLE") ?: "shamikmishra.com-analytics"
    private val client: DynamoDbClient by lazy { DynamoDbClient.create() }

    fun hashIp(ip: String?): String? {
        if (ip.isNullOrBlank()) return null
        val bytes = MessageDigest.getInstance("SHA-256").digest(ip.toByteArray())
        return bytes.take(8).joinToString("") { "%02x".format(it) }
    }

    fun track(event: TrackEvent, info: VisitorInfo) {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val hour = ZonedDateTime.now(ZoneId.of("UTC")).hour.toString().padStart(2, '0')
        val dayOfWeek = LocalDate.now().dayOfWeek.name
        val isPageView = event.command == null

        if (isPageView) {
            incrementCounter("PAGE#${event.page}", "DATE#$today", "views")
            incrementCounter("TOTAL", "VIEWS", "views")

            info.ipHash?.let { hash ->
                trackUniqueVisitor(hash, today)
            }

            info.country?.takeIf { it.isNotBlank() && it.length == 2 }?.let {
                incrementCounter("COUNTRY", it.uppercase(), "count")
                incrementCounter("COUNTRY#$today", it.uppercase(), "count")
            }
            info.city?.takeIf { it.isNotBlank() }?.let {
                incrementCounter("CITY", it, "count")
                incrementCounter("CITY#$today", it, "count")
            }
            info.region?.takeIf { it.isNotBlank() }?.let {
                incrementCounter("REGION", it, "count")
            }
            info.timezone?.takeIf { it.isNotBlank() }?.let {
                incrementCounter("TIMEZONE", it, "count")
            }
            incrementCounter("HOUR", hour, "count")
            incrementCounter("DAYOFWEEK", dayOfWeek, "count")
            info.device?.takeIf { it.isNotBlank() }?.let {
                incrementCounter("DEVICE", it, "count")
            }
            info.browser?.takeIf { it.isNotBlank() }?.let {
                incrementCounter("BROWSER", it, "count")
            }
            info.os?.takeIf { it.isNotBlank() }?.let {
                incrementCounter("OS", it, "count")
            }
            info.referrer?.takeIf { it.isNotBlank() }?.let { ref ->
                val domain = extractDomain(ref)
                if (domain != null) {
                    incrementCounter("REFERRER", domain, "count")
                    incrementCounter("REFERRER#$today", domain, "count")
                }
            }
        } else {
            incrementCounter("CMD", event.command!!, "count")
        }
    }

    private fun trackUniqueVisitor(ipHash: String, date: String) {
        // Track daily unique visitor
        try {
            client.updateItem(UpdateItemRequest.builder()
                .tableName(tableName)
                .key(mapOf("pk" to attr("VISITOR#$date"), "sk" to attr(ipHash)))
                .updateExpression("SET #v = :v")
                .conditionExpression("attribute_not_exists(pk)")
                .expressionAttributeNames(mapOf("#v" to "visited"))
                .expressionAttributeValues(mapOf(":v" to AttributeValue.builder().bool(true).build()))
                .build())
            incrementCounter("UNIQUE", "DATE#$date", "count")
        } catch (e: Exception) {
            // Visitor already tracked today
        }

        // Track all-time unique visitor (separate from daily)
        try {
            client.updateItem(UpdateItemRequest.builder()
                .tableName(tableName)
                .key(mapOf("pk" to attr("VISITOR#ALL"), "sk" to attr(ipHash)))
                .updateExpression("SET #v = :v")
                .conditionExpression("attribute_not_exists(pk)")
                .expressionAttributeNames(mapOf("#v" to "visited"))
                .expressionAttributeValues(mapOf(":v" to AttributeValue.builder().bool(true).build()))
                .build())
            incrementCounter("TOTAL", "UNIQUE", "count")
        } catch (e: Exception) {
            // Visitor already tracked all-time
        }
    }

    private fun extractDomain(url: String): String? {
        return try {
            val cleaned = url.removePrefix("https://").removePrefix("http://").removePrefix("www.")
            cleaned.substringBefore("/").substringBefore("?").takeIf { it.isNotBlank() }
        } catch (e: Exception) {
            null
        }
    }

    private fun incrementCounter(pk: String, sk: String, field: String) {
        client.updateItem(UpdateItemRequest.builder()
            .tableName(tableName)
            .key(mapOf("pk" to attr(pk), "sk" to attr(sk)))
            .updateExpression("ADD #field :inc")
            .expressionAttributeNames(mapOf("#field" to field))
            .expressionAttributeValues(mapOf(":inc" to AttributeValue.builder().n("1").build()))
            .build())
    }

    fun getStats(): StatsResponse {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val last7Days = (0..6).map { LocalDate.now().minusDays(it.toLong()).format(DateTimeFormatter.ISO_LOCAL_DATE) }

        return StatsResponse(
            totalViews = getTotalViews(),
            totalUniqueVisitors = getTotalUniqueVisitors(),
            todayViews = getDayViews("terminal", today) + getDayViews("gui", today),
            todayUniqueVisitors = getDayUniqueVisitors(today),
            dailyStats = getLast7DaysStats(),
            topCommands = getTopItems("CMD"),
            countries = getTopItems("COUNTRY"),
            countriesByDay = last7Days.map { date -> DailyBreakdown(date, getTopItems("COUNTRY#$date")) },
            cities = getTopItems("CITY"),
            citiesByDay = last7Days.map { date -> DailyBreakdown(date, getTopItems("CITY#$date")) },
            regions = getTopItems("REGION"),
            timezones = getTopItems("TIMEZONE"),
            hourOfDay = getTopItems("HOUR", 24),
            dayOfWeek = getTopItems("DAYOFWEEK", 7),
            devices = getTopItems("DEVICE"),
            browsers = getTopItems("BROWSER"),
            os = getTopItems("OS"),
            referrers = getTopItems("REFERRER"),
            referrersByDay = last7Days.map { date -> DailyBreakdown(date, getTopItems("REFERRER#$date")) }
        )
    }

    private fun getTotalViews(): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("TOTAL"), "sk" to attr("VIEWS")))
        }
        return response.item()?.get("views")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getTotalUniqueVisitors(): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("TOTAL"), "sk" to attr("UNIQUE")))
        }
        return response.item()?.get("count")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getDayViews(page: String, date: String): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("PAGE#$page"), "sk" to attr("DATE#$date")))
        }
        return response.item()?.get("views")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getDayUniqueVisitors(date: String): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("UNIQUE"), "sk" to attr("DATE#$date")))
        }
        return response.item()?.get("count")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getLast7DaysStats(): List<DailyStats> {
        val dates = (0..6).map { LocalDate.now().minusDays(it.toLong()) }
        return dates.map { date ->
            val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val views = getDayViews("terminal", dateStr) + getDayViews("gui", dateStr)
            val unique = getDayUniqueVisitors(dateStr)
            DailyStats(date = dateStr, views = views, uniqueVisitors = unique)
        }.reversed()
    }

    private fun getTopItems(pk: String, limit: Int = 10): List<ItemCount> {
        val response = client.query(QueryRequest.builder()
            .tableName(tableName)
            .keyConditionExpression("pk = :pk")
            .expressionAttributeValues(mapOf(":pk" to attr(pk)))
            .build())

        return response.items()
            .mapNotNull { item ->
                val sk = item["sk"]?.s() ?: return@mapNotNull null
                val count = item["count"]?.n()?.toLongOrNull() ?: 0L
                ItemCount(sk, count)
            }
            .sortedByDescending { it.count }
            .take(limit)
    }

    private fun attr(value: String) = AttributeValue.builder().s(value).build()
}
