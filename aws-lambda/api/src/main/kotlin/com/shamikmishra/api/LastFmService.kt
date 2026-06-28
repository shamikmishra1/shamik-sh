package com.shamikmishra.api

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.java.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class LastFmResponse(
    val recenttracks: RecentTracks? = null
)

@Serializable
data class RecentTracks(
    val track: List<Track> = emptyList()
)

@Serializable
data class Track(
    val name: String,
    val artist: Artist,
    val album: Album? = null,
    @SerialName("@attr") val attr: TrackAttr? = null
)

@Serializable
data class Artist(
    @SerialName("#text") val name: String
)

@Serializable
data class Album(
    @SerialName("#text") val name: String
)

@Serializable
data class TrackAttr(
    val nowplaying: String? = null
)

@Serializable
data class NowPlayingResponse(
    val playing: Boolean,
    val track: String? = null,
    val artist: String? = null,
    val album: String? = null
)

object LastFmService {
    private val client = HttpClient(Java) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    suspend fun getNowPlaying(): NowPlayingResponse {
        val apiKey = Secrets.lastfmApiKey ?: return NowPlayingResponse(playing = false)
        val username = Secrets.lastfmUsername ?: return NowPlayingResponse(playing = false)

        return try {
            val response: LastFmResponse = client.get("https://ws.audioscrobbler.com/2.0/") {
                parameter("method", "user.getrecenttracks")
                parameter("user", username)
                parameter("api_key", apiKey)
                parameter("format", "json")
                parameter("limit", "1")
            }.body()

            val track = response.recenttracks?.track?.firstOrNull()
                ?: return NowPlayingResponse(playing = false)

            NowPlayingResponse(
                playing = track.attr?.nowplaying == "true",
                track = track.name,
                artist = track.artist.name,
                album = track.album?.name
            )
        } catch (e: Exception) {
            NowPlayingResponse(playing = false)
        }
    }
}
