package dev.socialengine.web;

import dev.socialengine.domain.*;
import dev.socialengine.web.dto.Dtos.*;

import java.time.Instant;

/** Maps domain documents to API DTOs (null-safe ISO-8601 date strings). */
public final class Mappers {
    private Mappers() {}

    private static String iso(Instant i) {
        return i == null ? null : i.toString();
    }

    public static UserDto user(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getPlan(), u.getAiCredits(), u.getAiCreditsTotal());
    }

    public static PostDto post(Post p) {
        return new PostDto(p.getId(), p.getUserId(), p.getContent(), p.getPlatforms(),
                p.getMediaUrl(), p.getMediaType(), iso(p.getScheduledFor()), p.getStatus(),
                iso(p.getPublishedAt()), iso(p.getCreatedAt()), iso(p.getUpdatedAt()));
    }

    public static AccountDto account(SocialAccount a) {
        return new AccountDto(a.getId(), a.getUserId(), a.getHandle(), a.getPlatform(),
                a.getStatus(), a.getProviderAccountId(), iso(a.getCreatedAt()), iso(a.getUpdatedAt()));
    }

    public static GenerationDto generation(Generation g) {
        return new GenerationDto(g.getId(), g.getUserId(), g.getPrompt(), g.getContent(),
                g.getMediaUrl(), g.getMediaType(), g.getTone(), g.getType(),
                iso(g.getCreatedAt()), iso(g.getUpdatedAt()));
    }

    public static AutoReplyDto autoReply(AutoReplyRule r) {
        return new AutoReplyDto(r.getId(), r.getUserId(), r.getPlatform(), r.getTrigger(),
                r.getTone(), r.getInstructions(), r.isEnabled());
    }

    public static ActivityDto activity(Activity a) {
        RelatedPostDto related = a.getRelatedPostId() == null ? null
                : new RelatedPostDto(a.getRelatedPostId(), a.getRelatedPostContent());
        return new ActivityDto(a.getId(), a.getUserId(), a.getActionType(), a.getDescription(),
                related, iso(a.getCreatedAt()), iso(a.getUpdatedAt()));
    }
}
