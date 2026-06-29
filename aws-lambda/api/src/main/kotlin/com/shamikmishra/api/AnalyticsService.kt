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
data class DailyStats(
    val date: String,
    val views: Long
)

@Serializable
data class CommandStats(
    val command: String,
    val count: Long
)

@Serializable
data class CountryStats(
    val country: String,
    val count: Long
)

@Serializable
data class DeviceStats(
    val device: String,
    val count: Long
)

@Serializable
data class StatsResponse(
    val totalViews: Long,
    val todayViews: Long,
    val dailyStats: List<DailyStats>,
    val topCommands: List<CommandStats>,
    val topCountries: List<CountryStats>,
    val devices: List<DeviceStats>
)

object AnalyticsService {
    private val tableName = System.getenv("ANALYTICS_TABLE") ?: "shamikmishra.com-analytics"
    private val client: DynamoDbClient by lazy { DynamoDbClient.create() }

    fun track(event: TrackEvent, country: String?, device: String?) {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

        incrementCounter("PAGE#${event.page}", "DATE#$today", "views")
        incrementCounter("TOTAL", "VIEWS", "views")

        event.command?.let { cmd ->
            incrementCounter("CMD", cmd, "count")
        }

        country?.takeIf { it.isNotBlank() && it != "unknown" }?.let { c ->
            incrementCounter("COUNTRY", c.uppercase().take(2), "count")
        }

        device?.takeIf { it.isNotBlank() }?.let { d ->
            incrementCounter("DEVICE", d, "count")
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
            topCommands = getTopItems("CMD", "count"),
            topCountries = getTopItems("COUNTRY", "count").map { CountryStats(it.command, it.count) },
            devices = getTopItems("DEVICE", "count").map { DeviceStats(it.command, it.count) }
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

    private fun getTopItems(pk: String, field: String): List<CommandStats> {
        val response = client.query(QueryRequest.builder()
            .tableName(tableName)
            .keyConditionExpression("pk = :pk")
            .expressionAttributeValues(mapOf(":pk" to attr(pk)))
            .build())

        return response.items()
            .mapNotNull { item ->
                val sk = item["sk"]?.s() ?: return@mapNotNull null
                val count = item[field]?.n()?.toLongOrNull() ?: 0L
                CommandStats(sk, count)
            }
            .sortedByDescending { it.count }
            .take(10)
    }

    private fun attr(value: String) = AttributeValue.builder().s(value).build()
}
