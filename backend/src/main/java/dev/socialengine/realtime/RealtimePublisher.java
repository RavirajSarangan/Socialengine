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

    /** Tell clients the connected accounts collection changed. */
    public void accountsChanged(String userId) {
        messaging.convertAndSend("/topic/accounts", Map.of("type", "accounts:changed", "userId", userId));
    }

    /** Tell clients the auto-reply rule collection changed. */
    public void autoReplyChanged(String userId) {
        messaging.convertAndSend("/topic/auto-reply", Map.of("type", "auto-reply:changed", "userId", userId));
    }

    /** Push a new activity entry to the live feed. */
    public void activityChanged(String userId, Object activity) {
        messaging.convertAndSend("/topic/activity",
                Map.of("type", "activity:created", "userId", userId, "activity", activity));
    }

    /** Tell clients the AI generation history changed (and credits were spent). */
    public void generationsChanged(String userId) {
        messaging.convertAndSend("/topic/generations", Map.of("type", "generations:changed", "userId", userId));
    }

    /** Tell clients the media library changed. */
    public void mediaChanged(String userId) {
        messaging.convertAndSend("/topic/media", Map.of("type", "media:changed", "userId", userId));
    }
}
