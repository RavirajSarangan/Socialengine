package dev.socialengine.realtime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Pushes change events to STOMP topics so all connected dashboards update live. */
@Component
public class RealtimePublisher {

    private final SimpMessagingTemplate messaging;

    public RealtimePublisher(SimpMessagingTemplate messaging) {
        this.messaging = messaging;
    }

    /** Tell clients the posts collection changed (they re-fetch posts + stats). */
    public void postsChanged(String userId) {
        messaging.convertAndSend("/topic/posts", Map.of("type", "posts:changed", "userId", userId));
    }

    /** Push a new activity entry to the live feed. */
    public void activityChanged(String userId, Object activity) {
        messaging.convertAndSend("/topic/activity",
                Map.of("type", "activity:created", "userId", userId, "activity", activity));
    }
}
