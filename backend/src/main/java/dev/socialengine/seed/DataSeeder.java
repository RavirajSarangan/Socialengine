package dev.socialengine.seed;

import dev.socialengine.domain.*;
import dev.socialengine.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/** Seeds a demo user + sample data on first run so the dashboard has live content. */
@Component
public class DataSeeder implements CommandLineRunner {

    static final String DEMO_EMAIL = "demo@socialengine.app";
    static final String DEMO_PASSWORD = "demo1234";

    private final UserRepository users;
    private final PostRepository posts;
    private final SocialAccountRepository accounts;
    private final ActivityRepository activities;
    private final GenerationRepository generations;
    private final AutoReplyRuleRepository rules;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, PostRepository posts, SocialAccountRepository accounts,
                      ActivityRepository activities, GenerationRepository generations,
                      AutoReplyRuleRepository rules, PasswordEncoder encoder) {
        this.users = users;
        this.posts = posts;
        this.accounts = accounts;
        this.activities = activities;
        this.generations = generations;
        this.rules = rules;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.existsByEmail(DEMO_EMAIL)) {
            return; // already seeded
        }

        User demo = new User();
        demo.setName("Socialengine");
        demo.setEmail(DEMO_EMAIL);
        demo.setPasswordHash(encoder.encode(DEMO_PASSWORD));
        demo.setPlan("Pro");
        demo.setAiCredits(168);
        demo.setAiCreditsTotal(200);
        demo = users.save(demo);
        String uid = demo.getId();

        String img1 = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80";
        String img2 = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80";

        Post p1 = post(uid, "Artificial Intelligence is reshaping our world today — from analytics to medicine. What are your thoughts on the future of AI?\n\n#AI #Innovation #FutureOfWork",
                List.of("linkedin"), null, null, "2026-05-12T06:14:00Z", "published");
        Post p2 = post(uid, "Unlock your potential with our comprehensive AI course — from machine learning fundamentals to deep learning. Enroll today!\n\n#AICourse #MachineLearning #TechEducation",
                List.of("linkedin"), null, null, "2026-05-12T06:26:00Z", "published");
        Post p3 = post(uid, "Exciting Opportunity: Data Analyst! We're hiring an analytical pro to turn data into strategy. Apply now.\n\n#DataAnalyst #Hiring #Analytics",
                List.of("linkedin"), img1, "image", "2026-05-13T09:15:00Z", "published");
        Post p4 = post(uid, "Exciting Opportunity: Data Analyst! Join our team and drive data-driven decisions.\n\n#DataAnalyst #NowHiring #DataScience",
                List.of("instagram"), img2, "image", "2026-05-13T09:49:00Z", "published");
        Post p5 = post(uid, "🚀 Announcing our new AI Web Development Course! Build intelligent web experiences and stay ahead of the curve.\n\n#AIWebDev #WebDevelopment #LearnAI",
                List.of("instagram"), img1, "image", "2026-06-08T11:19:00Z", "scheduled");
        Post p6 = post(uid, "Big news dropping soon. Stay tuned. 👀\n\n#ComingSoon #BuildInPublic",
                List.of("facebook", "twitter"), null, null, "2026-06-10T14:09:00Z", "scheduled");
        posts.saveAll(List.of(p1, p2, p3, p4, p5, p6));

        accounts.saveAll(List.of(
                account(uid, "socialengine", "instagram"),
                account(uid, "socialengine", "linkedin")));

        activities.saveAll(List.of(
                activity(uid, "POST_PUBLISHED", "Published post to instagram", p4),
                activity(uid, "POST_PUBLISHED", "Published post to linkedin", p3),
                activity(uid, "POST_PUBLISHED", "Published post to linkedin", p2),
                activity(uid, "POST_SCHEDULED", "Scheduled post for instagram", p5),
                activity(uid, "POST_PUBLISHED", "Published post to linkedin", p1)));

        generations.saveAll(List.of(
                generation(uid, "create a post for Job Hiring for Data Analyst",
                        "Exciting Opportunity: Data Analyst! We're hiring an analytical pro to turn data into strategy. Apply now. #DataAnalyst #Hiring", img1, "image", "Professional"),
                generation(uid, "Post for launching a new AI Web Development Course",
                        "🚀 Announcing our new AI Web Development Course! Build intelligent web experiences. #AIWebDev #LearnAI", img2, "image", "Professional"),
                generation(uid, "Write a post about inflation in India in 2026",
                        "As we approach 2026, India's inflation trajectory remains key for stability. #IndiaEconomy #InflationOutlook", null, null, "Professional")));

        rules.saveAll(List.of(
                rule(uid, "instagram", "New comment", "Friendly", "Thank the commenter and invite them to DM for details.", true),
                rule(uid, "linkedin", "Mention", "Professional", "Acknowledge the mention and offer a relevant resource link.", true),
                rule(uid, "twitter", "Direct message", "Concise", "Answer FAQs about pricing; escalate anything else to a human.", false)));
    }

    private Post post(String uid, String content, List<String> platforms, String mediaUrl,
                      String mediaType, String scheduledFor, String status) {
        Post p = new Post();
        p.setUserId(uid);
        p.setContent(content);
        p.setPlatforms(platforms);
        p.setMediaUrl(mediaUrl);
        p.setMediaType(mediaType);
        p.setScheduledFor(Instant.parse(scheduledFor));
        p.setStatus(status);
        if ("published".equals(status)) p.setPublishedAt(Instant.parse(scheduledFor));
        p.setCreatedAt(Instant.parse(scheduledFor));
        p.setUpdatedAt(Instant.parse(scheduledFor));
        return p;
    }

    private SocialAccount account(String uid, String handle, String platform) {
        SocialAccount a = new SocialAccount();
        a.setUserId(uid);
        a.setHandle(handle);
        a.setPlatform(platform);
        a.setStatus("connected");
        a.setProviderAccountId("seed-" + platform);
        return a;
    }

    private Activity activity(String uid, String actionType, String description, Post related) {
        Activity a = new Activity();
        a.setUserId(uid);
        a.setActionType(actionType);
        a.setDescription(description);
        a.setRelatedPostId(related.getId());
        a.setRelatedPostContent(related.getContent());
        return a;
    }

    private Generation generation(String uid, String prompt, String content, String mediaUrl, String mediaType, String tone) {
        Generation g = new Generation();
        g.setUserId(uid);
        g.setPrompt(prompt);
        g.setContent(content);
        g.setMediaUrl(mediaUrl);
        g.setMediaType(mediaType);
        g.setTone(tone);
        g.setType(mediaUrl != null ? "image" : "text");
        return g;
    }

    private AutoReplyRule rule(String uid, String platform, String trigger, String tone, String instructions, boolean enabled) {
        AutoReplyRule r = new AutoReplyRule();
        r.setUserId(uid);
        r.setPlatform(platform);
        r.setTrigger(trigger);
        r.setTone(tone);
        r.setInstructions(instructions);
        r.setEnabled(enabled);
        return r;
    }
}
