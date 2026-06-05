package dev.socialengine.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/** ElevenLabs text-to-speech client. Returns MP3 bytes for a script. */
@Service
public class ElevenLabsService {

    /** Friendly UI ids (frontend voiceOptions) -> real ElevenLabs public voice IDs. */
    private static final Map<String, String> VOICE_IDS = Map.of(
            "rachel", "21m00Tcm4TlvDq8ikWAM",
            "adam", "pNInz6obpgDQGcFmaJgB",
            "bella", "EXAVITQu4vr4xnSDxMaL",
            "antoni", "ErXwobaYiN019PkySvjV");
    private static final String DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel

    private final RestClient client;
    private final boolean enabled;

    public ElevenLabsService(@Value("${app.elevenlabs.api-key:}") String apiKey) {
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.client = RestClient.builder()
                .baseUrl("https://api.elevenlabs.io/v1")
                .defaultHeader("xi-api-key", apiKey == null ? "" : apiKey)
                .build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public byte[] generateVoice(String text, String voiceId) {
        if (!enabled) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ElevenLabs is not configured (set ELEVENLABS_API_KEY)");
        }
        String resolved = resolveVoice(voiceId);
        Map<String, Object> body = Map.of(
                "text", text,
                "model_id", "eleven_multilingual_v2");
        try {
            return client.post().uri("/text-to-speech/{id}", resolved)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.valueOf("audio/mpeg"))
                    .body(body)
                    .retrieve()
                    .body(byte[].class);
        } catch (RestClientResponseException e) {
            HttpStatus status = e.getStatusCode().value() == 401 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_GATEWAY;
            throw new ResponseStatusException(status, "ElevenLabs error (" + e.getStatusCode().value() + "): check ELEVENLABS_API_KEY");
        }
    }

    private String resolveVoice(String voiceId) {
        if (voiceId == null || voiceId.isBlank()) return DEFAULT_VOICE;
        return VOICE_IDS.getOrDefault(voiceId.toLowerCase(), voiceId);
    }
}
