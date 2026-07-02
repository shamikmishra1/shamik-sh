package com.shamikmishra.api

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

private val logger = KotlinLogging.logger {}

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
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun getNowPlaying(): NowPlayingResponse {
        val apiKey = Secrets.lastfmApiKey ?: return NowPlayingResponse(playing = false)
        val username = Secrets.lastfmUsername ?: return NowPlayingResponse(playing = false)

        return try {
            val url = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=$username&api_key=$apiKey&format=json&limit=1"

            val client = HttpClient.newHttpClient()
            val request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build()

            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            logger.info { "Last.fm raw response: ${response.body()}" }

            val parsed = json.decodeFromString<LastFmResponse>(response.body())

            val track = parsed.recenttracks?.track?.firstOrNull()
                ?: return NowPlayingResponse(playing = false)

            logger.info { "Track: ${track.name}, nowplaying attr: ${track.attr?.nowplaying}" }

            NowPlayingResponse(
                playing = track.attr?.nowplaying == "true",
                track = track.name,
                artist = track.artist.name,
                album = track.album?.name
            )
        } catch (e: Exception) {
            logger.error(e) { "Failed to get now playing" }
            NowPlayingResponse(playing = false)
        }
    }
}
