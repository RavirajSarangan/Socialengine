package dev.socialengine.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/** All API DTOs. Field names/casing mirror the frontend's types in frontend/src/lib/types.ts. */
public final class Dtos {
    private Dtos() {}

    // ---- Auth ----
    public record RegisterRequest(@NotBlank String name, @Email String email, @NotBlank String password) {}
    public record LoginRequest(@Email String email, @NotBlank String password) {}
    public record AuthResponse(String token, UserDto user) {}
    public record UserDto(@JsonProperty("_id") String id, String name, String email,
                          String plan, int aiCredits, int aiCreditsTotal) {}

    // ---- Posts ----
    public record CreatePostRequest(String content, List<String> platforms, String mediaUrl,
                                    String mediaType, List<MediaItemDto> media, String scheduledFor, String status) {}
    public record PostDto(@JsonProperty("_id") String id, String user, String content,
                          List<String> platforms, String mediaUrl, String mediaType, List<MediaItemDto> media,
                          String scheduledFor, String status, String publishedAt,
                          String createdAt, String updatedAt) {}

    // ---- Accounts ----
    public record ConnectAccountRequest(String platform, String handle) {}
    public record AccountDto(@JsonProperty("_id") String id, String user, String handle,
                             String platform, String status, String providerAccountId,
                             String createdAt, String updatedAt) {}

    // ---- Generations ----
    public record GenerationDto(@JsonProperty("_id") String id, String user, String prompt,
                                String content, String mediaUrl, String mediaType, String tone,
                                String type, String createdAt, String updatedAt) {}

    // ---- AI generation ----
    public record CaptionRequest(@NotBlank String prompt, String tone, List<String> platforms) {}
    public record ImageRequest(@NotBlank String prompt) {}
    public record VoiceRequest(@NotBlank String text, String voiceId) {}
    public record AiResultDto(GenerationDto generation, int remainingCredits) {}

    // ---- Media library ----
    public record MediaAssetDto(@JsonProperty("_id") String id, String user, String url, String type,
                                String posterUrl, String name, long size, String source, String createdAt) {}
    public record UpdatePosterRequest(String posterUrl) {}
    public record MediaItemDto(String url, String type, String posterUrl) {}

    // ---- Activity ----
    public record RelatedPostDto(@JsonProperty("_id") String id, String content) {}
    public record ActivityDto(@JsonProperty("_id") String id, String user, String actionType,
                              String description, RelatedPostDto relatedPost,
                              String createdAt, String updatedAt) {}

    // ---- Auto-reply ----
    public record AutoReplyDto(@JsonProperty("_id") String id, String user, String platform,
                               String trigger, String tone, String instructions, boolean enabled) {}
    public record CreateAutoReplyRuleRequest(String platform, String trigger, String tone, String instructions,
                                             Boolean enabled) {}
    public record ToggleRuleRequest(boolean enabled) {}

    // ---- Analytics ----
    public record AnalyticsSummary(int scheduled, int published, int accounts, int aiRules,
                                   long totalReach, long engagements) {}
}
