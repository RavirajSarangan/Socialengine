package dev.socialengine.jobs;

import dev.socialengine.domain.Post;
import dev.socialengine.repo.PostRepository;
import dev.socialengine.service.PublishService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/** Publishes scheduled posts whose time has arrived. Runs every minute (@EnableScheduling is on the app). */
@Component
public class PublishScheduler {

    private static final Logger log = LoggerFactory.getLogger(PublishScheduler.class);

    private final PostRepository posts;
    private final PublishService publishService;

    public PublishScheduler(PostRepository posts, PublishService publishService) {
        this.posts = posts;
        this.publishService = publishService;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 10_000)
    public void publishDuePosts() {
        List<Post> due = posts.findByStatusAndScheduledForBefore("scheduled", Instant.now());
        if (due.isEmpty()) return;
        for (Post p : due) {
            try {
                publishService.publish(p);
            } catch (Exception e) {
                p.setStatus("failed");
                p.setUpdatedAt(Instant.now());
                posts.save(p);
                log.warn("Failed to publish post {}: {}", p.getId(), e.getMessage());
            }
        }
        log.info("Published {} due post(s)", due.size());
    }
}
