package dev.socialengine.service;

import dev.socialengine.domain.Activity;
import dev.socialengine.domain.Post;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.ActivityRepository;
import dev.socialengine.web.Mappers;
import org.springframework.stereotype.Service;

@Service
public class ActivityService {

    private final ActivityRepository activities;
    private final RealtimePublisher realtime;

    public ActivityService(ActivityRepository activities, RealtimePublisher realtime) {
        this.activities = activities;
        this.realtime = realtime;
    }

    /** Persist an activity and push it to the live feed. */
    public Activity log(String userId, String actionType, String description, Post relatedPost) {
        Activity a = new Activity();
        a.setUserId(userId);
        a.setActionType(actionType);
        a.setDescription(description);
        if (relatedPost != null) {
            a.setRelatedPostId(relatedPost.getId());
            a.setRelatedPostContent(relatedPost.getContent());
        }
        a = activities.save(a);
        realtime.activityChanged(userId, Mappers.activity(a));
        return a;
    }
}
