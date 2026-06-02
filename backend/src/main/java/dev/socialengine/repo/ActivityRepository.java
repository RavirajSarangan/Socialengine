package dev.socialengine.repo;

import dev.socialengine.domain.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(String userId);
}
