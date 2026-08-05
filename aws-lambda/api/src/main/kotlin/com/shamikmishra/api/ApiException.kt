package com.shamikmishra.api

import io.ktor.http.HttpStatusCode

sealed class ApiException(
    val status: HttpStatusCode,
    override val message: String,
    val logMessage: String? = null
) : Exception(message) {

    class BadRequest(message: String, logMessage: String? = null) :
        ApiException(HttpStatusCode.BadRequest, message, logMessage)

    class Unauthorized(message: String = "Unauthorized") :
        ApiException(HttpStatusCode.Unauthorized, message)

    class NotFound(message: String) :
        ApiException(HttpStatusCode.NotFound, message)

    class InternalError(message: String, logMessage: String? = null) :
        ApiException(HttpStatusCode.InternalServerError, message, logMessage)
}
