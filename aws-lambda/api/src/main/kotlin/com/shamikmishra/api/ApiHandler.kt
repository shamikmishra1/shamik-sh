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

    override fun handleRequest(input: APIGatewayV2HTTPEvent, context: Context): APIGatewayV2HTTPResponse {
        val traceId = RequestContext.newTrace()
        val path = input.rawPath ?: input.requestContext?.http?.path ?: "/"
        val method = input.requestContext?.http?.method ?: "GET"

        logger.info { "[$traceId] $method $path" }

        return try {
            route(path, method, input)
        } catch (e: ApiException) {
            e.logMessage?.let { logger.error { "[$traceId] ${e.logMessage}" } }
            errorResponse(e.status.value, e.message, traceId)
        } catch (e: Exception) {
            logger.error(e) { "[$traceId] Unexpected error" }
            errorResponse(500, "Internal error", traceId)
        } finally {
            RequestContext.clear()
        }
    }

    private fun route(path: String, method: String, input: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        return when {
            path == "/health" -> health()
            path == "/music" || path == "/now-playing" -> music()
            path == "/reading" -> reading()
            path == "/track" && method == "POST" -> track(input)
            path == "/stats" -> stats()
            path == "/billing" -> billing()
            path == "/auth" && method == "POST" -> auth(input)
            else -> throw ApiException.NotFound("Not found: $path")
        }
    }

    private fun health() = ok(mapOf("status" to "healthy", "timestamp" to java.time.Instant.now().toString()))

    private fun music() = runBlocking { ok(LastFmService.getNowPlaying()) }

    private fun reading(): APIGatewayV2HTTPResponse {
        return try {
            okRaw(getReadingResponse())
        } catch (e: Exception) {
            logger.error(e) { "[${RequestContext.get()}] Failed to get reading data" }
            okRaw("""{"currentlyReading":[],"recentlyRead":[]}""")
        }
    }

    private fun track(input: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        val body = input.body ?: throw ApiException.BadRequest("Missing body")
        val event = try {
            json.decodeFromString<TrackEvent>(body)
        } catch (e: Exception) {
            throw ApiException.BadRequest("Invalid JSON", e.message)
        }
        AnalyticsService.track(event, extractVisitorInfo(input))
        return ok(mapOf("status" to "tracked"))
    }

    private fun stats(): APIGatewayV2HTTPResponse {
        return try {
            ok(AnalyticsService.getStats())
        } catch (e: Exception) {
            throw ApiException.InternalError("Failed to get stats", e.message)
        }
    }

    private fun billing(): APIGatewayV2HTTPResponse {
        return try {
            ok(BillingService.getBilling())
        } catch (e: Exception) {
            throw ApiException.InternalError("Failed to get billing", e.message)
        }
    }

    private fun auth(input: APIGatewayV2HTTPEvent): APIGatewayV2HTTPResponse {
        val body = input.body ?: throw ApiException.BadRequest("Missing body")
        val request = try {
            json.decodeFromString<AuthRequest>(body)
        } catch (e: Exception) {
            throw ApiException.BadRequest("Invalid JSON")
        }

        val adminPassword = Secrets.get("ADMIN_PASSWORD")
            ?: throw ApiException.InternalError("Auth not configured", "ADMIN_PASSWORD not set")

        if (request.password != adminPassword) {
            throw ApiException.Unauthorized("Invalid password")
        }

        return ok(mapOf("authenticated" to true))
    }

    private fun extractVisitorInfo(input: APIGatewayV2HTTPEvent): VisitorInfo {
        val headers = input.headers ?: emptyMap()
        val userAgent = headers["user-agent"] ?: headers["User-Agent"] ?: ""
        val ip = headers["x-forwarded-for"]?.split(",")?.firstOrNull()?.trim()
            ?: input.requestContext?.http?.sourceIp

        val cloudFrontCountry = headers["cloudfront-viewer-country"] ?: headers["CloudFront-Viewer-Country"]
        val cloudFrontCity = headers["cloudfront-viewer-city"] ?: headers["CloudFront-Viewer-City"]
        val geoLocation = if (cloudFrontCountry == null) GeoIpService.lookup(ip) else null

        return VisitorInfo(
            country = cloudFrontCountry ?: geoLocation?.countryCode,
            region = headers["cloudfront-viewer-country-region-name"]
                ?: headers["CloudFront-Viewer-Country-Region-Name"]
                ?: geoLocation?.region,
            city = cloudFrontCity ?: geoLocation?.city,
            postalCode = headers["cloudfront-viewer-postal-code"] ?: headers["CloudFront-Viewer-Postal-Code"],
            timezone = headers["cloudfront-viewer-time-zone"]
                ?: headers["CloudFront-Viewer-Time-Zone"]
                ?: geoLocation?.timezone,
            latitude = headers["cloudfront-viewer-latitude"] ?: headers["CloudFront-Viewer-Latitude"],
            longitude = headers["cloudfront-viewer-longitude"] ?: headers["CloudFront-Viewer-Longitude"],
            device = parseDevice(userAgent),
            browser = parseBrowser(userAgent),
            os = parseOS(userAgent),
            referrer = headers["referer"] ?: headers["Referer"],
            ipHash = AnalyticsService.hashIp(ip),
            isp = geoLocation?.isp,
            isMobile = geoLocation?.isMobile,
            isProxy = geoLocation?.isProxy,
            isHosting = geoLocation?.isHosting
        )
    }

    private fun parseDevice(ua: String) = when {
        ua.contains("Mobile", true) || ua.contains("Android", true) && !ua.contains("Tablet", true) -> "mobile"
        ua.contains("Tablet", true) || ua.contains("iPad", true) -> "tablet"
        else -> "desktop"
    }

    private fun parseBrowser(ua: String) = when {
        ua.contains("Edg/", true) -> "Edge"
        ua.contains("Chrome/", true) && !ua.contains("Edg/", true) -> "Chrome"
        ua.contains("Safari/", true) && !ua.contains("Chrome/", true) -> "Safari"
        ua.contains("Firefox/", true) -> "Firefox"
        ua.contains("Opera", true) || ua.contains("OPR/", true) -> "Opera"
        else -> "Other"
    }

    private fun parseOS(ua: String) = when {
        ua.contains("Windows", true) -> "Windows"
        ua.contains("Mac OS X", true) || ua.contains("Macintosh", true) -> "macOS"
        ua.contains("iPhone", true) || ua.contains("iPad", true) -> "iOS"
        ua.contains("Android", true) -> "Android"
        ua.contains("Linux", true) -> "Linux"
        else -> "Other"
    }

    private inline fun <reified T> ok(body: T) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(200)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(body))
        .build()

    private fun okRaw(body: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(200)
        .withHeaders(corsHeaders())
        .withBody(body)
        .build()

    private fun errorResponse(status: Int, message: String, traceId: String) = APIGatewayV2HTTPResponse.builder()
        .withStatusCode(status)
        .withHeaders(corsHeaders())
        .withBody(json.encodeToString(mapOf("error" to message, "traceId" to traceId)))
        .build()

    private fun corsHeaders() = mapOf(
        "Content-Type" to "application/json",
        "Access-Control-Allow-Origin" to "*",
        "Access-Control-Allow-Methods" to "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers" to "Content-Type, Authorization",
        "Cache-Control" to "no-cache, no-store, must-revalidate"
    )
}

@kotlinx.serialization.Serializable
data class AuthRequest(val password: String)
