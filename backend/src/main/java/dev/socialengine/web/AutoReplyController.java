package dev.socialengine.web;

import dev.socialengine.domain.AutoReplyRule;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.AutoReplyRuleRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.AutoReplyDto;
import dev.socialengine.web.dto.Dtos.CreateAutoReplyRuleRequest;
import dev.socialengine.web.dto.Dtos.ToggleRuleRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/auto-reply")
public class AutoReplyController {

    private final AutoReplyRuleRepository rules;
    private final RealtimePublisher realtime;

    public AutoReplyController(AutoReplyRuleRepository rules, RealtimePublisher realtime) {
        this.rules = rules;
        this.realtime = realtime;
    }

    @GetMapping
    public List<AutoReplyDto> list(@CurrentUserId String userId) {
        return rules.findByUserId(userId).stream().map(Mappers::autoReply).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AutoReplyDto create(@CurrentUserId String userId, @RequestBody CreateAutoReplyRuleRequest req) {
        if (req.platform() == null || req.platform().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Platform is required");
        }
        if (req.trigger() == null || req.trigger().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trigger is required");
        }
        if (req.instructions() == null || req.instructions().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Instructions are required");
        }
        AutoReplyRule r = new AutoReplyRule();
        r.setUserId(userId);
        r.setPlatform(req.platform().trim());
        r.setTrigger(req.trigger().trim());
        r.setTone(req.tone() == null || req.tone().isBlank() ? "Professional" : req.tone().trim());
        r.setInstructions(req.instructions().trim());
        r.setEnabled(req.enabled() == null || req.enabled());
        r = rules.save(r);
        realtime.autoReplyChanged(userId);
        return Mappers.autoReply(r);
    }

    @PatchMapping("/{id}")
    public AutoReplyDto toggle(@CurrentUserId String userId, @PathVariable String id, @RequestBody ToggleRuleRequest req) {
        AutoReplyRule r = rules.findById(id)
                .filter(rule -> rule.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found"));
        r.setEnabled(req.enabled());
        r.setUpdatedAt(Instant.now());
        r = rules.save(r);
        realtime.autoReplyChanged(userId);
        return Mappers.autoReply(r);
    }
}
