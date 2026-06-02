package dev.socialengine.repo;

import dev.socialengine.domain.AutoReplyRule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AutoReplyRuleRepository extends MongoRepository<AutoReplyRule, String> {
    List<AutoReplyRule> findByUserId(String userId);
}
