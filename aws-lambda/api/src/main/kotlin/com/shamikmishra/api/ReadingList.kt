package com.shamikmishra.api

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

private val logger = KotlinLogging.logger {}

@Serializable
data class Book(
    val title: String,
    val author: String,
    val coverUrl: String? = null,
    val status: String
)

@Serializable
data class ReadingResponse(
    val currentlyReading: List<Book>,
    val recentlyRead: List<Book>
)

object HardcoverService {
    private val httpClient = HttpClient.newHttpClient()
    private val json = Json { ignoreUnknownKeys = true }
    private val secretsClient: SecretsManagerClient by lazy {
        SecretsManagerClient.builder().build()
    }

    private var cachedToken: String? = null

    private fun getToken(): String {
        if (cachedToken == null) {
            val response = secretsClient.getSecretValue(
                GetSecretValueRequest.builder()
                    .secretId("shamikmishra/hardcover-token")
                    .build()
            )
            val secret = response.secretString()
            cachedToken = if (secret.startsWith("Bearer ")) secret else "Bearer $secret"
        }
        return cachedToken!!
    }

    fun getReading(): String {
        return try {
            logger.info { "Fetching Hardcover token" }
            val token = getToken()
            logger.info { "Got token, fetching currently reading" }
            val currentlyReading = fetchBooks(token, 2)
            logger.info { "Got ${currentlyReading.size} currently reading, fetching read" }
            val recentlyRead = fetchBooks(token, 3).take(5)
            logger.info { "Got ${recentlyRead.size} recently read" }

            val response = ReadingResponse(
                currentlyReading = currentlyReading,
                recentlyRead = recentlyRead
            )
            Json.encodeToString(response)
        } catch (e: Exception) {
            logger.error(e) { "Failed to get reading data" }
            Json.encodeToString(ReadingResponse(emptyList(), emptyList()))
        }
    }

    private fun fetchBooks(token: String, statusId: Int): List<Book> {
        val query = """
            {
              me {
                user_books(where: {status_id: {_eq: $statusId}}, limit: 10, order_by: {updated_at: desc}) {
                  book {
                    title
                    cached_contributors
                  }
                }
              }
            }
        """.trimIndent()

        val requestBody = JsonObject(mapOf("query" to JsonPrimitive(query)))

        val request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.hardcover.app/v1/graphql"))
            .header("Content-Type", "application/json")
            .header("authorization", token)
            .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
            .build()

        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
        return parseBooks(response.body(), statusId)
    }

    private fun parseBooks(responseBody: String, statusId: Int): List<Book> {
        val root = json.parseToJsonElement(responseBody).jsonObject
        val meArray = root["data"]?.jsonObject?.get("me")?.jsonArray ?: return emptyList()
        val me = meArray.firstOrNull()?.jsonObject ?: return emptyList()
        val userBooks = me["user_books"]?.jsonArray ?: return emptyList()

        return userBooks.mapNotNull { userBook ->
            val book = userBook.jsonObject["book"]?.jsonObject ?: return@mapNotNull null
            val title = book["title"]?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null

            val contributors = book["cached_contributors"]?.jsonArray
            val author = contributors?.firstOrNull()?.jsonObject?.get("author")?.jsonObject
                ?.get("name")?.jsonPrimitive?.contentOrNull ?: "Unknown"

            val status = when (statusId) {
                2 -> "reading"
                3 -> "read"
                else -> "unknown"
            }

            Book(title, author, null, status)
        }
    }
}

fun getReadingResponse(): String = HardcoverService.getReading()
