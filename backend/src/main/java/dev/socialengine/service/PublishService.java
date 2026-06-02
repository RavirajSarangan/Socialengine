package dev.socialengine.service;

import dev.socialengine.domain.Post;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.PostRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    public PublishService(PostRepository posts, ActivityService activityService, RealtimePublisher realtime) {
        this.posts = posts;
        this.activityService = activityService;
        this.realtime = realtime;
    }

    public Post publish(Post p) {
        // TODO(provider): call the configured publishing provider here (Ayrshare/LinkedIn/Zernio).
        Instant now = Instant.now();
        p.setStatus("published");
        p.setPublishedAt(now);
        p.setUpdatedAt(now);
        p = posts.save(p);

        String platforms = String.join(", ", p.getPlatforms() == null ? List.of() : p.getPlatforms());
        activityService.log(p.getUserId(), "POST_PUBLISHED",
                "Published post" + (platforms.isBlank() ? "" : " to " + platforms), p);
        realtime.postsChanged(p.getUserId());
        return p;
    }
}
