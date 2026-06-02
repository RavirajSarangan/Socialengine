package dev.socialengine.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("activities")
public class Activity {
    @Id
    private String id;
    private String userId;
    private String actionType;           // e.g. POST_PUBLISHED, POST_SCHEDULED, POST_CREATED
    private String description;
    private String relatedPostId;        // nullable
    private String relatedPostContent;   // denormalized snapshot for the activity feed
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRelatedPostId() { return relatedPostId; }
    public void setRelatedPostId(String relatedPostId) { this.relatedPostId = relatedPostId; }
    public String getRelatedPostContent() { return relatedPostContent; }
    public void setRelatedPostContent(String relatedPostContent) { this.relatedPostContent = relatedPostContent; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
