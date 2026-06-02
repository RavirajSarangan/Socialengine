package dev.socialengine.repo;

import dev.socialengine.domain.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserIdOrderByScheduledForDesc(String userId);
    List<Post> findByStatusAndScheduledForBefore(String status, Instant before);
    void deleteByUserId(String userId);
}
