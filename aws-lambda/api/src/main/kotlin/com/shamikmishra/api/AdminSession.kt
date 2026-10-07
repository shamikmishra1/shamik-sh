package com.shamikmishra.api

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Instant
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object AdminSession {
    private const val lifetimeSeconds = 60 * 60 * 8L
    private val random = SecureRandom()

    fun create(): String {
        val expiresAt = Instant.now().epochSecond + lifetimeSeconds
        val nonce = ByteArray(16).also(random::nextBytes)
        val payload = "$expiresAt.${Base64.getUrlEncoder().withoutPadding().encodeToString(nonce)}"
        return "$payload.${sign(payload, sessionSecret())}"
    }

    fun verify(authorization: String?): Boolean {
        val token = authorization?.removePrefix("Bearer ") ?: return false
        val parts = token.split('.')
        if (parts.size != 3) return false
        val expiresAt = parts[0].toLongOrNull() ?: return false
        if (expiresAt < Instant.now().epochSecond) return false

        val payload = "${parts[0]}.${parts[1]}"
        val expected = sign(payload, sessionSecret())
        return MessageDigest.isEqual(
            expected.toByteArray(StandardCharsets.US_ASCII),
            parts[2].toByteArray(StandardCharsets.US_ASCII)
        )
    }

    private fun sessionSecret(): String = Secrets.get("ADMIN_SESSION_SECRET")
        ?: throw ApiException.InternalError("Auth not configured", "ADMIN_SESSION_SECRET not set")

    private fun sign(payload: String, secret: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256"))
        return Base64.getUrlEncoder().withoutPadding().encodeToString(
            mac.doFinal(payload.toByteArray(StandardCharsets.UTF_8))
        )
    }
}
