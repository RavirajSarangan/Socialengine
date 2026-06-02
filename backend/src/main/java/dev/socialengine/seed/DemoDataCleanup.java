package dev.socialengine.seed;

import dev.socialengine.repo.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Removes the legacy demo account created by older builds.
 * New installs now start with an empty database.
 */
@Component
public class DemoDataCleanup implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataCleanup.class);
    private static final String LEGACY_DEMO_EMAIL = "demo@socialengine.app";

    private final UserRepository users;
    private final PostRepository posts;
    private final SocialAccountRepository accounts;
    private final ActivityRepository activities;
    private final GenerationRepository generations;
    private final AutoReplyRuleRepository rules;

    public DemoDataCleanup(UserRepository users, PostRepository posts, SocialAccountRepository accounts,
                           ActivityRepository activities, GenerationRepository generations,
                           AutoReplyRuleRepository rules) {
        this.users = users;
        this.posts = posts;
        this.accounts = accounts;
        this.activities = activities;
        this.generations = generations;
        this.rules = rules;
    }

    @Override
    public void run(String... args) {
        users.findByEmail(LEGACY_DEMO_EMAIL).ifPresent(demo -> {
            String userId = demo.getId();
            posts.deleteByUserId(userId);
            accounts.deleteByUserId(userId);
            activities.deleteByUserId(userId);
            generations.deleteByUserId(userId);
            rules.deleteByUserId(userId);
            users.delete(demo);
            log.info("Removed legacy demo account and related data for {}", LEGACY_DEMO_EMAIL);
        });
    }
}
