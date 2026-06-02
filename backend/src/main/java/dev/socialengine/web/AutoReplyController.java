package dev.socialengine.web;

import dev.socialengine.domain.AutoReplyRule;
import dev.socialengine.repo.AutoReplyRuleRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.AutoReplyDto;
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

    public AutoReplyController(AutoReplyRuleRepository rules) {
        this.rules = rules;
    }

    @GetMapping
    public List<AutoReplyDto> list(@CurrentUserId String userId) {
        return rules.findByUserId(userId).stream().map(Mappers::autoReply).toList();
    }

    @PatchMapping("/{id}")
    public AutoReplyDto toggle(@CurrentUserId String userId, @PathVariable String id, @RequestBody ToggleRuleRequest req) {
        AutoReplyRule r = rules.findById(id)
                .filter(rule -> rule.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found"));
        r.setEnabled(req.enabled());
        r.setUpdatedAt(Instant.now());
        return Mappers.autoReply(rules.save(r));
    }
}
