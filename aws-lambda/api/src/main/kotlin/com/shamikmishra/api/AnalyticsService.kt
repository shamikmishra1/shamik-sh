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
data class ItemCount(val name: String, val count: Long, val unique: Long? = null, val lastSeen: String? = null, val firstSeen: String? = null)

@Serializable
data class StatsResponse(
    val totalViews: Long,
    val totalUniqueVisitors: Long,
    val todayViews: Long,
    val todayUniqueVisitors: Long,
    val newVisitorsToday: Long,
    val returningVisitorsToday: Long,
    val totalCommands: Long,
    val avgCommandsPerVisitor: Double,
    val weekOverWeekGrowth: Double,
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

            info.country?.takeIf { it.isNotBlank() && it.length == 2 }?.let { country ->
                incrementCounterWithFirstLastSeen("COUNTRY", country.uppercase(), "count", today)
                incrementCounter("COUNTRY#$today", country.uppercase(), "count")
                info.ipHash?.let { hash ->
                    trackUniqueByDimension("COUNTRY", country.uppercase(), hash)
                }
            }
            info.city?.takeIf { it.isNotBlank() }?.let { city ->
                incrementCounterWithFirstLastSeen("CITY", city, "count", today)
                incrementCounter("CITY#$today", city, "count")
                info.ipHash?.let { hash ->
                    trackUniqueByDimension("CITY", city, hash)
                }
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
        var isNewDailyVisitor = false
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
            isNewDailyVisitor = true
        } catch (e: Exception) {
            // Visitor already tracked today
        }

        // Track all-time unique visitor and new vs returning
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
            // This is a brand new visitor
            if (isNewDailyVisitor) {
                incrementCounter("NEWVISITOR", "DATE#$date", "count")
            }
        } catch (e: Exception) {
            // Returning visitor
            if (isNewDailyVisitor) {
                incrementCounter("RETURNING", "DATE#$date", "count")
            }
        }
    }

    private fun trackUniqueByDimension(dimension: String, value: String, ipHash: String) {
        // Track unique visitor per dimension (country/city)
        try {
            client.updateItem(UpdateItemRequest.builder()
                .tableName(tableName)
                .key(mapOf("pk" to attr("UNIQUE#$dimension#$value"), "sk" to attr(ipHash)))
                .updateExpression("SET #v = :v")
                .conditionExpression("attribute_not_exists(pk)")
                .expressionAttributeNames(mapOf("#v" to "visited"))
                .expressionAttributeValues(mapOf(":v" to AttributeValue.builder().bool(true).build()))
                .build())
            incrementCounter(dimension, value, "unique")
        } catch (e: Exception) {
            // Visitor already tracked for this dimension
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

    private fun incrementCounterWithFirstLastSeen(pk: String, sk: String, field: String, date: String) {
        // First, try to set firstSeen (only if it doesn't exist)
        try {
            client.updateItem(UpdateItemRequest.builder()
                .tableName(tableName)
                .key(mapOf("pk" to attr(pk), "sk" to attr(sk)))
                .updateExpression("SET #firstSeen = :date")
                .conditionExpression("attribute_not_exists(#firstSeen)")
                .expressionAttributeNames(mapOf("#firstSeen" to "firstSeen"))
                .expressionAttributeValues(mapOf(":date" to attr(date)))
                .build())
        } catch (e: Exception) {
            // firstSeen already set
        }
        // Always update count and lastSeen
        client.updateItem(UpdateItemRequest.builder()
            .tableName(tableName)
            .key(mapOf("pk" to attr(pk), "sk" to attr(sk)))
            .updateExpression("ADD #field :inc SET #lastSeen = :date")
            .expressionAttributeNames(mapOf("#field" to field, "#lastSeen" to "lastSeen"))
            .expressionAttributeValues(mapOf(
                ":inc" to AttributeValue.builder().n("1").build(),
                ":date" to attr(date)
            ))
            .build())
    }

    private fun incrementCounterWithLastSeen(pk: String, sk: String, field: String, date: String) {
        client.updateItem(UpdateItemRequest.builder()
            .tableName(tableName)
            .key(mapOf("pk" to attr(pk), "sk" to attr(sk)))
            .updateExpression("ADD #field :inc SET #lastSeen = :date")
            .expressionAttributeNames(mapOf("#field" to field, "#lastSeen" to "lastSeen"))
            .expressionAttributeValues(mapOf(
                ":inc" to AttributeValue.builder().n("1").build(),
                ":date" to attr(date)
            ))
            .build())
    }

    fun getStats(): StatsResponse {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val last7Days = (0..6).map { LocalDate.now().minusDays(it.toLong()).format(DateTimeFormatter.ISO_LOCAL_DATE) }

        val dailyStats = getLast7DaysStats()
        val totalCommands = getTotalCommands()
        val totalUniqueVisitors = getTotalUniqueVisitors()

        // Calculate week-over-week growth
        val thisWeekViews = dailyStats.takeLast(7).sumOf { it.views }
        val lastWeekViews = (7..13).map { LocalDate.now().minusDays(it.toLong()).format(DateTimeFormatter.ISO_LOCAL_DATE) }
            .sumOf { getDayViews("terminal", it) + getDayViews("gui", it) }
        val weekOverWeekGrowth = if (lastWeekViews > 0) {
            ((thisWeekViews - lastWeekViews).toDouble() / lastWeekViews * 100)
        } else 0.0

        return StatsResponse(
            totalViews = getTotalViews(),
            totalUniqueVisitors = totalUniqueVisitors,
            todayViews = getDayViews("terminal", today) + getDayViews("gui", today),
            todayUniqueVisitors = getDayUniqueVisitors(today),
            newVisitorsToday = getNewVisitorsToday(today),
            returningVisitorsToday = getReturningVisitorsToday(today),
            totalCommands = totalCommands,
            avgCommandsPerVisitor = if (totalUniqueVisitors > 0) totalCommands.toDouble() / totalUniqueVisitors else 0.0,
            weekOverWeekGrowth = weekOverWeekGrowth,
            dailyStats = dailyStats,
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

    private fun getNewVisitorsToday(date: String): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("NEWVISITOR"), "sk" to attr("DATE#$date")))
        }
        return response.item()?.get("count")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getReturningVisitorsToday(date: String): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("RETURNING"), "sk" to attr("DATE#$date")))
        }
        return response.item()?.get("count")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getTotalCommands(): Long {
        val commands = getTopItems("CMD", 100)
        return commands.sumOf { it.count }
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
                val unique = item["unique"]?.n()?.toLongOrNull()
                val lastSeen = item["lastSeen"]?.s()
                val firstSeen = item["firstSeen"]?.s()
                ItemCount(sk, count, unique, lastSeen, firstSeen)
            }
            .sortedByDescending { it.count }
            .take(limit)
    }

    private fun attr(value: String) = AttributeValue.builder().s(value).build()
}
