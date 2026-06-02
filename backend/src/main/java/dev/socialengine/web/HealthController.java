package dev.socialengine.web;

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

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
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
                "time", Instant.now().toString()
        );
    }
}
