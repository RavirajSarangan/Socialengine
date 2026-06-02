package dev.socialengine.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/** Thin OpenAI client (caption via chat completions, image via images API). Uses Spring's RestClient. */
@Service
public class OpenAiService {

    private final RestClient client;
    private final boolean enabled;

    public OpenAiService(@Value("${app.openai.api-key:}") String apiKey) {
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.client = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + (apiKey == null ? "" : apiKey))
                .build();
    }

    public String generateCaption(String prompt, String tone, List<String> platforms) {
        requireEnabled();
        String audience = (platforms == null || platforms.isEmpty()) ? "" : " for " + String.join(", ", platforms);
        String system = "You are an expert social media copywriter. Write a single "
                + (tone == null || tone.isBlank() ? "professional" : tone.toLowerCase())
                + " social media caption" + audience
                + ". Keep it engaging and add a few relevant hashtags at the end. Return only the caption text.";
        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "temperature", 0.8,
                "messages", List.of(
                        Map.of("role", "system", "content", system),
                        Map.of("role", "user", "content", prompt)));
        JsonNode resp = post("/chat/completions", body, JsonNode.class);
        String text = resp.path("choices").path(0).path("message").path("content").asText(null);
        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OpenAI returned no caption");
        }
        return text.trim();
    }

    /** Returns raw PNG bytes for the generated image. */
    public byte[] generateImage(String prompt) {
        requireEnabled();
        Map<String, Object> body = Map.of(
                "model", "gpt-image-1",
                "prompt", prompt,
                "size", "1024x1024",
                "n", 1);
        JsonNode resp = post("/images/generations", body, JsonNode.class);
        String b64 = resp.path("data").path(0).path("b64_json").asText(null);
        if (b64 == null || b64.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OpenAI returned no image");
        }
        return Base64.getDecoder().decode(b64);
    }

    private <T> T post(String uri, Object body, Class<T> type) {
        try {
            return client.post().uri(uri).contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(type);
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OpenAI error: " + extractMessage(e.getResponseBodyAsString()));
        }
    }

    private void requireEnabled() {
        if (!enabled) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OpenAI is not configured (set OPENAI_API_KEY)");
        }
    }

    private String extractMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) return "request failed";
        int i = responseBody.indexOf("\"message\"");
        return i < 0 ? responseBody : responseBody.substring(i, Math.min(responseBody.length(), i + 200));
    }
}
