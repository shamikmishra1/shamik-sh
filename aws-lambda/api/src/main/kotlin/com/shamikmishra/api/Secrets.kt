package com.shamikmishra.api

import kotlinx.serialization.json.Json
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest

object Secrets {
    private val client: SecretsManagerClient by lazy {
        SecretsManagerClient.builder().build()
    }

    private val json = Json { ignoreUnknownKeys = true }

    private var cachedSecrets: Map<String, String>? = null

    fun get(key: String): String? {
        if (cachedSecrets == null) {
            val secretId = System.getenv("SECRETS_ARN") ?: return null
            val response = client.getSecretValue(
                GetSecretValueRequest.builder().secretId(secretId).build()
            )
            cachedSecrets = json.decodeFromString<Map<String, String>>(response.secretString())
        }
        return cachedSecrets?.get(key)
    }

    val lastfmApiKey: String? get() = get("LASTFM_API_KEY")
    val lastfmUsername: String? get() = get("LASTFM_USERNAME")
}
