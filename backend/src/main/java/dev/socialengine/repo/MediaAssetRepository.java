package dev.socialengine.repo;

import dev.socialengine.domain.MediaAsset;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MediaAssetRepository extends MongoRepository<MediaAsset, String> {
    List<MediaAsset> findByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
}
