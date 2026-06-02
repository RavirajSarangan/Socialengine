package dev.socialengine.repo;

import dev.socialengine.domain.Generation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GenerationRepository extends MongoRepository<Generation, String> {
    List<Generation> findByUserIdOrderByCreatedAtDesc(String userId);
}
