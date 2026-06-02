package dev.socialengine.web;

import dev.socialengine.config.PlatformMedia;
import dev.socialengine.domain.MediaItem;
import dev.socialengine.domain.Post;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.PostRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.service.ActivityService;
import dev.socialengine.service.PublishService;
import dev.socialengine.web.dto.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository posts;
    private final ActivityService activityService;
    private final RealtimePublisher realtime;
    private final PublishService publishService;

    public PostController(PostRepository posts, ActivityService activityService, RealtimePublisher realtime, PublishService publishService) {
        this.posts = posts;
        this.activityService = activityService;
        this.realtime = realtime;
        this.publishService = publishService;
    }

    @GetMapping
    public List<PostDto> list(@CurrentUserId String userId) {
        return posts.findByUserIdOrderByScheduledForDesc(userId).stream().map(Mappers::post).toList();
    }

    @GetMapping("/{id}")
    public PostDto get(@CurrentUserId String userId, @PathVariable String id) {
        return Mappers.post(owned(userId, id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostDto create(@CurrentUserId String userId, @RequestBody CreatePostRequest req) {
        Post p = new Post();
        p.setUserId(userId);
        p.setContent(req.content());
        p.setPlatforms(req.platforms());
        applyMedia(p, req);
        p.setScheduledFor(parse(req.scheduledFor()));
        p.setStatus(req.status() == null ? "scheduled" : req.status());
        validateMediaForPublish(p);
        if ("published".equals(p.getStatus())) {
            p.setPublishedAt(Instant.now());
        }
        p = posts.save(p);

        String verb = "published".equals(p.getStatus()) ? "Published" : "Scheduled";
        activityService.log(userId, "POST_" + p.getStatus().toUpperCase(),
                verb + " post to " + String.join(", ", p.getPlatforms() == null ? List.of() : p.getPlatforms()), p);
        realtime.postsChanged(userId);
        return Mappers.post(p);
    }

    @PatchMapping("/{id}")
    public PostDto update(@CurrentUserId String userId, @PathVariable String id, @RequestBody CreatePostRequest req) {
        Post p = owned(userId, id);
        if (req.content() != null) p.setContent(req.content());
        if (req.platforms() != null) p.setPlatforms(req.platforms());
        applyMedia(p, req);
        if (req.scheduledFor() != null) p.setScheduledFor(parse(req.scheduledFor()));
        if (req.status() != null) p.setStatus(req.status());
        p.setUpdatedAt(Instant.now());
        p = posts.save(p);
        realtime.postsChanged(userId);
        return Mappers.post(p);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId String userId, @PathVariable String id) {
        posts.delete(owned(userId, id));
        realtime.postsChanged(userId);
    }

    @PostMapping("/{id}/publish")
    public PostDto publish(@CurrentUserId String userId, @PathVariable String id) {
        Post p = owned(userId, id);
        p.setStatus("published");
        validateMediaForPublish(p);
        return Mappers.post(publishService.publish(p));
    }

    @PostMapping("/{id}/duplicate")
    @ResponseStatus(HttpStatus.CREATED)
    public PostDto duplicate(@CurrentUserId String userId, @PathVariable String id) {
        Post src = owned(userId, id);
        Post copy = new Post();
        copy.setUserId(userId);
        copy.setContent(src.getContent());
        copy.setPlatforms(src.getPlatforms());
        copy.setMediaUrl(src.getMediaUrl());
        copy.setMediaType(src.getMediaType());
        copy.setMedia(src.getMedia());
        copy.setScheduledFor(src.getScheduledFor());
        copy.setStatus("draft");
        copy = posts.save(copy);
        realtime.postsChanged(userId);
        return Mappers.post(copy);
    }

    /** Blocks publishing/scheduling a post whose media violates a selected platform's spec (drafts are exempt). */
    private void validateMediaForPublish(Post p) {
        if ("draft".equals(p.getStatus()) || p.getMedia() == null || p.getMedia().isEmpty()) return;
        List<MediaItemDto> media = p.getMedia().stream()
                .map(m -> new MediaItemDto(m.getUrl(), m.getType(), m.getPosterUrl(), m.getSize())).toList();
        List<String> violations = PlatformMedia.validate(p.getPlatforms(), media);
        if (!violations.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, String.join(" ", violations));
        }
    }

    /** Applies media[] (and keeps the legacy single-media fields in sync from media[0]). */
    private void applyMedia(Post p, CreatePostRequest req) {
        if (req.media() != null) {
            List<MediaItem> items = req.media().stream()
                    .map(m -> new MediaItem(m.url(), m.type(), m.posterUrl(), m.size())).toList();
            p.setMedia(items);
            if (!items.isEmpty()) {
                p.setMediaUrl(items.get(0).getUrl());
                p.setMediaType(items.get(0).getType());
            }
        }
        if (req.mediaUrl() != null) p.setMediaUrl(req.mediaUrl());
        if (req.mediaType() != null) p.setMediaType(req.mediaType());
    }

    private Post owned(String userId, String id) {
        Post p = posts.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (!p.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        return p;
    }

    private Instant parse(String iso) {
        if (iso == null || iso.isBlank()) return Instant.now();
        try {
            return Instant.parse(iso);
        } catch (Exception e) {
            // accept datetime-local format (yyyy-MM-ddTHH:mm) by treating it as UTC
            return Instant.parse(iso.length() == 16 ? iso + ":00Z" : iso);
        }
    }
}
