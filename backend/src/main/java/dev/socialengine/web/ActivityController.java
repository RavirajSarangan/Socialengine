package dev.socialengine.web;

import dev.socialengine.repo.ActivityRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.ActivityDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityRepository activities;

    public ActivityController(ActivityRepository activities) {
        this.activities = activities;
    }

    @GetMapping
    public List<ActivityDto> list(@CurrentUserId String userId) {
        return activities.findByUserIdOrderByCreatedAtDesc(userId).stream().map(Mappers::activity).toList();
    }
}
