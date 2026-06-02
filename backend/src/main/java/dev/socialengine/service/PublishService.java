package dev.socialengine.service;

import dev.socialengine.domain.MediaItem;
import dev.socialengine.domain.Post;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Publishes a post and records it. This is the single seam where real delivery
 * to a provider (Ayrshare / LinkedIn OAuth / Zernio) gets added later — today it
 * marks the post published (simulated delivery), logs activity, and notifies clients.
 */
@Service
public class PublishService {

    private final PostRepository posts;
    private final ActivityService activityService;
    private final RealtimePublisher realtime;
    private final AyrshareClient ayrshare;

    public PublishService(PostRepository posts, ActivityService activityService,
                          RealtimePublisher realtime, AyrshareClient ayrshare) {
        this.posts = posts;
        this.activityService = activityService;
        this.realtime = realtime;
        this.ayrshare = ayrshare;
    }

    /** Publishes a post — via Ayrshare when configured, otherwise simulated. Throws on real-provider failure. */
    public Post publish(Post p) {
        if (ayrshare.isEnabled()) {
            AyrshareClient.PublishResult result = ayrshare.publish(p.getContent(), p.getPlatforms(), mediaUrls(p));
            if (!result.ok()) {
                p.setStatus("failed");
                p.setUpdatedAt(Instant.now());
                posts.save(p);
                realtime.postsChanged(p.getUserId());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Publish failed: " + result.detail());
            }
        }

        Instant now = Instant.now();
        p.setStatus("published");
        p.setPublishedAt(now);
        p.setUpdatedAt(now);
        p = posts.save(p);

        String platforms = String.join(", ", p.getPlatforms() == null ? List.of() : p.getPlatforms());
        String how = ayrshare.isEnabled() ? "" : " (simulated)";
        activityService.log(p.getUserId(), "POST_PUBLISHED",
                "Published post" + (platforms.isBlank() ? "" : " to " + platforms) + how, p);
        realtime.postsChanged(p.getUserId());
        return p;
    }

    private List<String> mediaUrls(Post p) {
        List<String> urls = new ArrayList<>();
        if (p.getMedia() != null) {
            for (MediaItem m : p.getMedia()) if (m.getUrl() != null) urls.add(m.getUrl());
        } else if (p.getMediaUrl() != null) {
            urls.add(p.getMediaUrl());
        }
        return urls;
    }
}
