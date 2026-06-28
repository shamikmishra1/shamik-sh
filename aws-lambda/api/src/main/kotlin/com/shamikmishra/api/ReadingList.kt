package com.shamikmishra.api

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class Book(
    val title: String,
    val author: String,
    val status: String // "reading", "finished", "want-to-read"
)

object ReadingList {
    private val books = listOf(
        Book("Designing Data-Intensive Applications", "Martin Kleppmann", "reading"),
        Book("The Pragmatic Programmer", "David Thomas & Andrew Hunt", "finished"),
        Book("System Design Interview", "Alex Xu", "finished")
    )

    fun getReading(): List<Book> = books.filter { it.status == "reading" }
    fun getFinished(): List<Book> = books.filter { it.status == "finished" }
    fun getAll(): List<Book> = books
}

@Serializable
data class ReadingResponse(
    val currentlyReading: List<Book>,
    val finished: List<Book>
)

fun getReadingResponse(): String {
    val response = ReadingResponse(
        currentlyReading = ReadingList.getReading(),
        finished = ReadingList.getFinished()
    )
    return Json.encodeToString(response)
}
