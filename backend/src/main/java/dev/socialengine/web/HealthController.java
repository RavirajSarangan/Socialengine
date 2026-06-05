package dev.socialengine.web;

import dev.socialengine.service.AyrshareClient;
import dev.socialengine.service.ElevenLabsService;
import dev.socialengine.service.OpenAiService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final OpenAiService openAi;
    private final ElevenLabsService elevenLabs;
    private final AyrshareClient ayrshare;

    public HealthController(MongoTemplate mongoTemplate, OpenAiService openAi,
                            ElevenLabsService elevenLabs, AyrshareClient ayrshare) {
        this.mongoTemplate = mongoTemplate;
        this.openAi = openAi;
        this.elevenLabs = elevenLabs;
        this.ayrshare = ayrshare;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        boolean dbUp;
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            dbUp = true;
        } catch (Exception e) {
            dbUp = false;
        }
        return Map.of(
                "status", "ok",
                "service", "socialengine-backend",
                "database", dbUp ? "connected" : "down",
                "time", Instant.now().toString(),
                "integrations", Map.of(
                        "openai", openAi.isEnabled(),
                        "elevenlabs", elevenLabs.isEnabled(),
                        "ayrshare", ayrshare.isEnabled()
                )
        );
    }
}
