package dev.socialengine.repo;

import dev.socialengine.domain.SocialAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SocialAccountRepository extends MongoRepository<SocialAccount, String> {
    List<SocialAccount> findByUserId(String userId);
    void deleteByUserId(String userId);
}
