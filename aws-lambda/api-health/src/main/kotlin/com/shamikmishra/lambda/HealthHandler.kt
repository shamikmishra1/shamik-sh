package com.shamikmishra.lambda

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val logger = KotlinLogging.logger {}

@Serializable
data class HealthResponse(
    val status: String,
    val message: String,
    val timestamp: String = java.time.Instant.now().toString(),
    val version: String = "1.0.0"
)

class HealthHandler : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private val json = Json { prettyPrint = true }

    override fun handleRequest(
        input: APIGatewayProxyRequestEvent,
        context: Context
    ): APIGatewayProxyResponseEvent {
        logger.info { "Health check request from ${input.requestContext?.identity?.sourceIp}" }

        val response = HealthResponse(
            status = "healthy",
            message = "shamikmishra.com API is running"
        )

        return APIGatewayProxyResponseEvent()
            .withStatusCode(200)
            .withHeaders(
                mapOf(
                    "Content-Type" to "application/json",
                    "Access-Control-Allow-Origin" to "*"
                )
            )
            .withBody(json.encodeToString(response))
    }
}
