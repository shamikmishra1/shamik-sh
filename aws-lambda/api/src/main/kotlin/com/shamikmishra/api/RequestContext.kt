package com.shamikmishra.api

import java.util.UUID

object RequestContext {
    private val traceId = ThreadLocal<String>()

    fun newTrace(): String {
        val id = UUID.randomUUID().toString().take(8)
        traceId.set(id)
        return id
    }

    fun get(): String = traceId.get() ?: "unknown"

    fun clear() = traceId.remove()
}
