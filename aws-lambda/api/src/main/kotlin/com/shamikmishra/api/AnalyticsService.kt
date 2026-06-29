package com.shamikmishra.api

import kotlinx.serialization.Serializable
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.QueryRequest
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Serializable
data class TrackEvent(
    val page: String,
    val command: String? = null,
    val referrer: String? = null
)

@Serializable
data class DailyStats(val date: String, val views: Long)

@Serializable
data class ItemCount(val name: String, val count: Long)

@Serializable
data class StatsResponse(
    val totalViews: Long,
    val todayViews: Long,
    val dailyStats: List<DailyStats>,
    val topCommands: List<ItemCount>,
    val countries: List<ItemCount>,
    val devices: List<ItemCount>,
    val browsers: List<ItemCount>,
    val os: List<ItemCount>,
    val referrers: List<ItemCount>
)

data class VisitorInfo(
    val country: String?,
    val device: String?,
    val browser: String?,
    val os: String?,
    val referrer: String?
)

object AnalyticsService {
    private val tableName = System.getenv("ANALYTICS_TABLE") ?: "shamikmishra.com-analytics"
    private val client: DynamoDbClient by lazy { DynamoDbClient.create() }

    fun track(event: TrackEvent, info: VisitorInfo) {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val isPageView = event.command == null

        if (isPageView) {
            incrementCounter("PAGE#${event.page}", "DATE#$today", "views")
            incrementCounter("TOTAL", "VIEWS", "views")

            info.country?.takeIf { it.isNotBlank() && it.length == 2 }?.let {
                incrementCounter("COUNTRY", it.uppercase(), "count")
            }
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
                if (domain != null) incrementCounter("REFERRER", domain, "count")
            }
        } else {
            incrementCounter("CMD", event.command!!, "count")
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

        return StatsResponse(
            totalViews = getTotalViews(),
            todayViews = getDayViews("terminal", today) + getDayViews("gui", today),
            dailyStats = getLast7DaysStats(),
            topCommands = getTopItems("CMD"),
            countries = getTopItems("COUNTRY"),
            devices = getTopItems("DEVICE"),
            browsers = getTopItems("BROWSER"),
            os = getTopItems("OS"),
            referrers = getTopItems("REFERRER")
        )
    }

    private fun getTotalViews(): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("TOTAL"), "sk" to attr("VIEWS")))
        }
        return response.item()?.get("views")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getDayViews(page: String, date: String): Long {
        val response = client.getItem { req ->
            req.tableName(tableName)
                .key(mapOf("pk" to attr("PAGE#$page"), "sk" to attr("DATE#$date")))
        }
        return response.item()?.get("views")?.n()?.toLongOrNull() ?: 0L
    }

    private fun getLast7DaysStats(): List<DailyStats> {
        val dates = (0..6).map { LocalDate.now().minusDays(it.toLong()) }
        return dates.map { date ->
            val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val views = getDayViews("terminal", dateStr) + getDayViews("gui", dateStr)
            DailyStats(date = dateStr, views = views)
        }.reversed()
    }

    private fun getTopItems(pk: String): List<ItemCount> {
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
            .take(10)
    }

    private fun attr(value: String) = AttributeValue.builder().s(value).build()
}
