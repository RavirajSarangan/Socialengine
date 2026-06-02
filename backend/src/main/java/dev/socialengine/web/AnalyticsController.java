package dev.socialengine.web;

import dev.socialengine.repo.AutoReplyRuleRepository;
import dev.socialengine.repo.PostRepository;
import dev.socialengine.repo.SocialAccountRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.AnalyticsSummary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final PostRepository posts;
    private final SocialAccountRepository accounts;
    private final AutoReplyRuleRepository rules;

    public AnalyticsController(PostRepository posts, SocialAccountRepository accounts, AutoReplyRuleRepository rules) {
        this.posts = posts;
        this.accounts = accounts;
        this.rules = rules;
    }

    @GetMapping("/summary")
    public AnalyticsSummary summary(@CurrentUserId String userId) {
        var userPosts = posts.findByUserIdOrderByScheduledForDesc(userId);
        int scheduled = (int) userPosts.stream().filter(p -> "scheduled".equals(p.getStatus())).count();
        int published = (int) userPosts.stream().filter(p -> "published".equals(p.getStatus())).count();
        int connected = (int) accounts.findByUserId(userId).stream().filter(a -> "connected".equals(a.getStatus())).count();
        int activeRules = (int) rules.findByUserId(userId).stream().filter(r -> r.isEnabled()).count();
        // Derived sample engagement metrics (real metrics arrive with the publishing API).
        long reach = published * 520L + scheduled * 80L;
        long engagements = published * 47L;
        return new AnalyticsSummary(scheduled, published, connected, activeRules, reach, engagements);
    }
}
