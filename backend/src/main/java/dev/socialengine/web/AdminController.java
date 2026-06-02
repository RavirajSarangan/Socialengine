package dev.socialengine.web;

import dev.socialengine.domain.User;
import dev.socialengine.repo.*;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.AdminStatsDto;
import dev.socialengine.web.dto.Dtos.AdminUpdateUserRequest;
import dev.socialengine.web.dto.Dtos.AdminUserDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** System administration — guarded so only users with role "admin" can access. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository users;
    private final PostRepository posts;
    private final SocialAccountRepository accounts;
    private final ActivityRepository activities;
    private final GenerationRepository generations;
    private final MediaAssetRepository media;
    private final AutoReplyRuleRepository rules;

    public AdminController(UserRepository users, PostRepository posts, SocialAccountRepository accounts,
                          ActivityRepository activities, GenerationRepository generations,
                          MediaAssetRepository media, AutoReplyRuleRepository rules) {
        this.users = users;
        this.posts = posts;
        this.accounts = accounts;
        this.activities = activities;
        this.generations = generations;
        this.media = media;
        this.rules = rules;
    }

    @GetMapping("/stats")
    public AdminStatsDto stats(@CurrentUserId String userId) {
        requireAdmin(userId);
        Map<String, Long> byPlan = new LinkedHashMap<>();
        for (User u : users.findAll()) {
            byPlan.merge(u.getPlan() == null ? "—" : u.getPlan(), 1L, Long::sum);
        }
        return new AdminStatsDto(users.count(), users.countByRole("admin"), posts.count(),
                accounts.count(), generations.count(), media.count(), byPlan);
    }

    @GetMapping("/users")
    public List<AdminUserDto> listUsers(@CurrentUserId String userId) {
        requireAdmin(userId);
        return users.findAllByOrderByCreatedAtDesc().stream().map(Mappers::adminUser).toList();
    }

    @PatchMapping("/users/{id}")
    public AdminUserDto updateUser(@CurrentUserId String userId, @PathVariable String id,
                                   @RequestBody AdminUpdateUserRequest req) {
        requireAdmin(userId);
        User target = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (req.role() != null && (req.role().equals("admin") || req.role().equals("user"))) {
            if (id.equals(userId) && req.role().equals("user") && users.countByRole("admin") <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the last admin");
            }
            target.setRole(req.role());
        }
        if (req.plan() != null) target.setPlan(req.plan());
        if (req.aiCredits() != null) target.setAiCredits(req.aiCredits());
        if (req.aiCreditsTotal() != null) target.setAiCreditsTotal(req.aiCreditsTotal());
        target.setUpdatedAt(Instant.now());
        return Mappers.adminUser(users.save(target));
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@CurrentUserId String userId, @PathVariable String id) {
        requireAdmin(userId);
        if (id.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account here");
        }
        User target = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        posts.deleteByUserId(id);
        accounts.deleteByUserId(id);
        activities.deleteByUserId(id);
        generations.deleteByUserId(id);
        media.deleteByUserId(id);
        rules.deleteByUserId(id);
        users.delete(target);
    }

    private void requireAdmin(String userId) {
        User u = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        if (!"admin".equals(u.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
