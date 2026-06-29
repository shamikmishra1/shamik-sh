package com.shamikmishra.api

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val logger = KotlinLogging.logger {}

class ApiHandler : RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private val json = Json { prettyPrint = true; ignoreUnknownKeys = true }

    override fun handleRequest(
        input: APIGatewayV2HTTPEvent,
        context: Context
    ): APIGatewayV2HTTPResponse {
        val path = input.rawPath ?: input.requestContext?.http?.path ?: "/"
        val method = input.requestContext?.http?.method ?: "GET"
        logger.info { "Request: $method $path" }

        return when {
            path == "/health" -> healthResponse()
            path == "/music" || path == "/now-playing" -> musicResponse()
            path == "/reading" -> readingResponse()
            path == "/track" && method == "POST" -> trackResponse(input)
            path == "/stats" -> statsResponse(input)
            path == "/auth" && method == "POST" -> authResponse(input)
            else -> notFoundResponse(path)
        }
    }

    private fun healthResponse() = jsonResponse(
        mapOf(
            "status" to "healthy",
            "timestamp" to java.time.Instant.now().toString()
        )
    )

    private fun musicResponse() = runBlocking {
        val nowPlaying = LastFmService.getNowPlaying()
        jsonResponse(nowPlaying)
    }

    private fun readingResponse(): APIGatewayV2HTTPResponse {
        val response = ReadingResponse(
            currentlyReading = ReadingList.getReading(),
            finished = ReadingList.getFinished()
        )
        return jsonResponse(response)
    }

    private fun trackResponse(input: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        return try {
            val body = input.body ?: return badRequestResponse("Missing body")
            val event = json.decodeFromString<TrackEvent>(body)

            val country = extractCountry(input)
            val device = extractDevice(input)

            AnalyticsService.track(event, country, device)
            jsonResponse(mapOf("status" to "tracked"))
        } catch (e: Exception) {
            logger.error(e) { "Failed to track event" }
            badRequestResponse("Invalid request: ${e.message}")
        }
    }

    private fun extractCountry(input: APIGatewayV2HTTPEvent): String? {
        val headers = input.headers ?: return null
        return headers["cloudfront-viewer-country"]
            ?: headers["CloudFront-Viewer-Country"]
            ?: headers["x-country"]
    }

    private fun extractDevice(input: APIGatewayV2HTTPEvent): String? {
        val headers = input.headers ?: return null
        val userAgent = headers["user-agent"] ?: headers["User-Agent"] ?: return null

        return when {
            userAgent.contains("Mobile", ignoreCase = true) -> "mobile"
            userAgent.contains("Tablet", ignoreCase = true) -> "tablet"
            userAgent.contains("iPad", ignoreCase = true) -> "tablet"
            else -> "desktop"
        }
    }

    private fun authResponse(input: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        return try {
            val body = input.body ?: return badRequestResponse("Missing body")
            val request = json.decodeFromString<AuthRequest>(body)

            val adminPassword = Secrets.get("ADMIN_PASSWORD")
            if (adminPassword == null) {
                logger.error { "ADMIN_PASSWORD not configured" }
                return errorResponse("Auth not configured")
            }

            if (request.password == adminPassword) {
                jsonResponse(mapOf("authenticated" to true))
            } else {
                unauthorizedResponse("Invalid password")
            }
        } catch (e: Exception) {
            logger.error(e) { "Auth failed" }
            badRequestResponse("Invalid request")
        }
    }

    private fun statsResponse(input: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        return try {
            val stats = AnalyticsService.getStats()
            jsonResponse(stats)
        } catch (e: Exception) {
            logger.error(e) { "Failed to get stats" }
            errorResponse("Failed to get stats: ${e.message}")
        }
    }

    private fun notFoundResponse(path: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(404)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(mapOf("error" to "Not found: $path")))
        .build()

    private fun badRequestResponse(message: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(400)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(mapOf("error" to message)))
        .build()

    private fun unauthorizedResponse(message: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(401)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(mapOf("error" to message)))
        .build()

    private fun errorResponse(message: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(500)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(mapOf("error" to message)))
        .build()

    private inline fun <reified T> jsonResponse(body: T) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(200)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(body))
        .build()

    private fun corsHeaders() = mapOf(
        "Content-Type" to "application/json",
        "Access-Control-Allow-Origin" to "*",
        "Access-Control-Allow-Methods" to "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers" to "Content-Type, Authorization"
    )
}

@kotlinx.serialization.Serializable
data class AuthRequest(val password: String)
