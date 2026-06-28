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

    private val json = Json { prettyPrint = true }

    override fun handleRequest(
        input: APIGatewayV2HTTPEvent,
        context: Context
    ): APIGatewayV2HTTPResponse {
        val path = input.rawPath ?: input.requestContext?.http?.path ?: "/"
        logger.info { "Request path: $path" }

        return when {
            path == "/health" -> healthResponse()
            path == "/music" || path == "/now-playing" -> musicResponse()
            path == "/reading" -> readingResponse()
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

    private fun notFoundResponse(path: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(404)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(mapOf("error" to "Not found: $path")))
        .build()

    private inline fun <reified T> jsonResponse(body: T) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(200)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(body))
        .build()

    private fun corsHeaders() = mapOf(
        "Content-Type" to "application/json",
        "Access-Control-Allow-Origin" to "*",
        "Access-Control-Allow-Methods" to "GET, OPTIONS",
        "Access-Control-Allow-Headers" to "Content-Type"
    )
}
