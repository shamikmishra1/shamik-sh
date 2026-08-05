package com.shamikmishra.api

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URI
import java.util.concurrent.ConcurrentHashMap

private val logger = KotlinLogging.logger {}

object GeoIpService {

    private val json = Json { ignoreUnknownKeys = true }
    private val cache = ConcurrentHashMap<String, GeoLocation>()
    private const val CACHE_MAX_SIZE = 100
    private const val API_URL = "http://ip-api.com/json"
    private const val TIMEOUT_MS = 2000

    fun lookup(ip: String?): GeoLocation? {
        if (ip.isNullOrBlank()) return null
        if (isPrivateIp(ip)) return null

        cache[ip]?.let { return it }

        return try {
            val url = URI("$API_URL/$ip?fields=status,country,countryCode,regionName,city,timezone,isp,mobile,proxy,hosting").toURL()
            val connection = url.openConnection() as HttpURLConnection
            connection.apply {
                requestMethod = "GET"
                connectTimeout = TIMEOUT_MS
                readTimeout = TIMEOUT_MS
                setRequestProperty("Accept", "application/json")
            }

            if (connection.responseCode != 200) {
                logger.warn { "Geo API returned ${connection.responseCode}" }
                return null
            }

            val response = connection.inputStream.bufferedReader().readText()
            val apiResponse = json.decodeFromString<IpApiResponse>(response)

            if (apiResponse.status != "success") {
                logger.debug { "Geo lookup failed: ${apiResponse.status}" }
                return null
            }

            val location = GeoLocation(
                country = apiResponse.country,
                countryCode = apiResponse.countryCode,
                region = apiResponse.regionName,
                city = apiResponse.city,
                timezone = apiResponse.timezone,
                isp = apiResponse.isp,
                isMobile = apiResponse.mobile ?: false,
                isProxy = apiResponse.proxy ?: false,
                isHosting = apiResponse.hosting ?: false
            )

            if (cache.size >= CACHE_MAX_SIZE) {
                cache.keys.firstOrNull()?.let { cache.remove(it) }
            }
            cache[ip] = location

            logger.debug { "Geo lookup success: ${location.countryCode}/${location.city}" }
            location

        } catch (e: Exception) {
            logger.warn { "Geo lookup failed: ${e.message}" }
            null
        }
    }

    private fun isPrivateIp(ip: String): Boolean {
        return ip.startsWith("10.") ||
               ip.startsWith("172.16.") || ip.startsWith("172.17.") || ip.startsWith("172.18.") ||
               ip.startsWith("172.19.") || ip.startsWith("172.20.") || ip.startsWith("172.21.") ||
               ip.startsWith("172.22.") || ip.startsWith("172.23.") || ip.startsWith("172.24.") ||
               ip.startsWith("172.25.") || ip.startsWith("172.26.") || ip.startsWith("172.27.") ||
               ip.startsWith("172.28.") || ip.startsWith("172.29.") || ip.startsWith("172.30.") ||
               ip.startsWith("172.31.") ||
               ip.startsWith("192.168.") ||
               ip.startsWith("127.") ||
               ip == "::1" ||
               ip.startsWith("fc") || ip.startsWith("fd")
    }
}

data class GeoLocation(
    val country: String?,
    val countryCode: String?,
    val region: String?,
    val city: String?,
    val timezone: String?,
    val isp: String?,
    val isMobile: Boolean,
    val isProxy: Boolean,
    val isHosting: Boolean
)

@Serializable
private data class IpApiResponse(
    val status: String,
    val country: String? = null,
    val countryCode: String? = null,
    val regionName: String? = null,
    val city: String? = null,
    val timezone: String? = null,
    val isp: String? = null,
    val mobile: Boolean? = null,
    val proxy: Boolean? = null,
    val hosting: Boolean? = null
)
