package dev.socialengine.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

/**
 * Ayrshare publishing provider. When AYRSHARE_API_KEY is set, posts are delivered
 * to the real platforms connected in the Ayrshare dashboard; otherwise the app
 * falls back to simulated publishing (see PublishService).
 */
@Service
public class AyrshareClient {

    private final RestClient client;
    private final boolean enabled;

    public AyrshareClient(@Value("${app.ayrshare.api-key:}") String apiKey) {
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.client = RestClient.builder()
                .baseUrl("https://api.ayrshare.com/api")
                .defaultHeader("Authorization", "Bearer " + (apiKey == null ? "" : apiKey))
                .build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public record PublishResult(boolean ok, String detail) {}

    /** Publishes text (+ optional public media URLs) to the given platforms via Ayrshare. */
    public PublishResult publish(String text, List<String> platforms, List<String> mediaUrls) {
        // Ayrshare can only fetch publicly reachable media URLs; drop localhost/relative ones.
        List<String> publicMedia = new ArrayList<>();
        if (mediaUrls != null) {
            for (String u : mediaUrls) {
                if (u != null && u.startsWith("http") && !u.contains("localhost") && !u.contains("127.0.0.1")) {
                    publicMedia.add(u);
                }
            }
        }
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("post", text == null || text.isBlank() ? "(no caption)" : text);
        body.put("platforms", platforms == null ? List.of() : platforms);
        if (!publicMedia.isEmpty()) body.put("mediaUrls", publicMedia);

        try {
            JsonNode resp = client.post().uri("/post")
                    .contentType(MediaType.APPLICATION_JSON).body(body)
                    .retrieve().body(JsonNode.class);
            String status = resp == null ? "" : resp.path("status").asText("");
            if ("success".equalsIgnoreCase(status) || "scheduled".equalsIgnoreCase(status)) {
                return new PublishResult(true, resp.path("id").asText(""));
            }
            return new PublishResult(false, resp == null ? "no response" : resp.toString());
        } catch (RestClientResponseException e) {
            return new PublishResult(false, "Ayrshare " + e.getStatusCode().value() + ": " + truncate(e.getResponseBodyAsString()));
        } catch (Exception e) {
            return new PublishResult(false, e.getMessage());
        }
    }

    /** Returns the platform ids currently connected to the Ayrshare account (e.g. linkedin, twitter). */
    public Set<String> connectedPlatforms() {
        if (!enabled) return Set.of();
        try {
            JsonNode resp = client.get().uri("/user").retrieve().body(JsonNode.class);
            Set<String> out = new HashSet<>();
            if (resp != null && resp.has("activeSocialAccounts")) {
                resp.get("activeSocialAccounts").forEach(n -> out.add(n.asText().toLowerCase()));
            }
            return out;
        } catch (Exception e) {
            return Set.of();
        }
    }

    /** Returns connected platform ids mapped to their usernames/handles from Ayrshare. */
    public Map<String, String> connectedHandles() {
        if (!enabled) return Map.of();
        try {
            JsonNode resp = client.get().uri("/user").retrieve().body(JsonNode.class);
            Map<String, String> out = new java.util.HashMap<>();
            if (resp != null && resp.has("displayNames")) {
                resp.get("displayNames").forEach(n -> {
                    String platform = n.path("platform").asText("").toLowerCase();
                    String username = n.path("username").asText("");
                    if (username.isBlank()) {
                        username = n.path("displayName").asText("");
                    }
                    if (!platform.isBlank() && !username.isBlank()) {
                        out.put(platform, username.replaceFirst("^@", ""));
                    }
                });
            }
            return out;
        } catch (Exception e) {
            return Map.of();
        }
    }

    private String truncate(String s) {
        if (s == null) return "request failed";
        return s.length() > 180 ? s.substring(0, 180) : s;
    }
}
