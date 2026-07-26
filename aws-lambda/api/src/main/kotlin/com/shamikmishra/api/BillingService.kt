package com.shamikmishra.api

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import software.amazon.awssdk.services.costexplorer.CostExplorerClient
import software.amazon.awssdk.services.costexplorer.model.DateInterval
import software.amazon.awssdk.services.costexplorer.model.GetCostAndUsageRequest
import software.amazon.awssdk.services.costexplorer.model.Granularity
import software.amazon.awssdk.services.costexplorer.model.GroupDefinition
import software.amazon.awssdk.services.costexplorer.model.GroupDefinitionType
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@Serializable
data class ServiceCost(val service: String, val amount: Double)

@Serializable
data class BillingResponse(
    val currentMonth: String,
    val totalCost: Double,
    val forecastedCost: Double?,
    val serviceBreakdown: List<ServiceCost>,
    val lastUpdated: String
)

object BillingService {
    private val tableName = System.getenv("ANALYTICS_TABLE") ?: "shamikmishra.com-analytics"
    private val dynamoClient: DynamoDbClient by lazy { DynamoDbClient.create() }
    private val costClient: CostExplorerClient by lazy { CostExplorerClient.create() }
    private val json = Json { ignoreUnknownKeys = true }
    private const val CACHE_HOURS = 24

    fun getBilling(): BillingResponse {
        val cached = getCachedBilling()
        if (cached != null) return cached

        val fresh = fetchBillingFromAws()
        cacheBilling(fresh)
        return fresh
    }

    private fun getCachedBilling(): BillingResponse? {
        return try {
            val response = dynamoClient.getItem { req ->
                req.tableName(tableName)
                    .key(mapOf(
                        "pk" to AttributeValue.builder().s("BILLING").build(),
                        "sk" to AttributeValue.builder().s("CURRENT").build()
                    ))
            }
            val item = response.item() ?: return null
            val cachedAt = item["cachedAt"]?.s() ?: return null
            val data = item["data"]?.s() ?: return null

            val cachedTime = LocalDate.parse(cachedAt.substring(0, 10))
            val hoursCached = java.time.Duration.between(
                java.time.LocalDateTime.parse(cachedAt),
                java.time.LocalDateTime.now()
            ).toHours()

            if (hoursCached >= CACHE_HOURS) return null

            json.decodeFromString<BillingResponse>(data)
        } catch (e: Exception) {
            null
        }
    }

    private fun cacheBilling(billing: BillingResponse) {
        try {
            dynamoClient.putItem { req ->
                req.tableName(tableName)
                    .item(mapOf(
                        "pk" to AttributeValue.builder().s("BILLING").build(),
                        "sk" to AttributeValue.builder().s("CURRENT").build(),
                        "data" to AttributeValue.builder().s(json.encodeToString(billing)).build(),
                        "cachedAt" to AttributeValue.builder().s(java.time.LocalDateTime.now().toString()).build()
                    ))
            }
        } catch (e: Exception) {
            // Cache failure is not critical
        }
    }

    private fun fetchBillingFromAws(): BillingResponse {
        val today = LocalDate.now()
        val monthStart = YearMonth.from(today).atDay(1)
        val monthEnd = today.plusDays(1)

        val request = GetCostAndUsageRequest.builder()
            .timePeriod(DateInterval.builder()
                .start(monthStart.format(DateTimeFormatter.ISO_LOCAL_DATE))
                .end(monthEnd.format(DateTimeFormatter.ISO_LOCAL_DATE))
                .build())
            .granularity(Granularity.MONTHLY)
            .metrics(listOf("UnblendedCost"))
            .groupBy(GroupDefinition.builder()
                .type(GroupDefinitionType.DIMENSION)
                .key("SERVICE")
                .build())
            .build()

        val response = costClient.getCostAndUsage(request)

        val serviceBreakdown = mutableListOf<ServiceCost>()
        var totalCost = 0.0

        response.resultsByTime().firstOrNull()?.groups()?.forEach { group ->
            val serviceName = group.keys().firstOrNull() ?: "Unknown"
            val amount = group.metrics()["UnblendedCost"]?.amount()?.toDoubleOrNull() ?: 0.0
            if (amount > 0.01) {
                serviceBreakdown.add(ServiceCost(serviceName, amount))
                totalCost += amount
            }
        }

        val forecasted = try {
            val forecastRequest = software.amazon.awssdk.services.costexplorer.model.GetCostForecastRequest.builder()
                .timePeriod(DateInterval.builder()
                    .start(today.format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .end(YearMonth.from(today).atEndOfMonth().plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .build())
                .metric(software.amazon.awssdk.services.costexplorer.model.Metric.UNBLENDED_COST)
                .granularity(Granularity.MONTHLY)
                .build()
            costClient.getCostForecast(forecastRequest).total()?.amount()?.toDoubleOrNull()
        } catch (e: Exception) {
            null
        }

        return BillingResponse(
            currentMonth = YearMonth.from(today).toString(),
            totalCost = totalCost,
            forecastedCost = forecasted,
            serviceBreakdown = serviceBreakdown.sortedByDescending { it.amount },
            lastUpdated = java.time.LocalDateTime.now().toString()
        )
    }
}
