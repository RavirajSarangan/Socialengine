package dev.socialengine.web;

import dev.socialengine.domain.User;
import dev.socialengine.repo.UserRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.security.JwtService;
import dev.socialengine.web.dto.Dtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        User u = new User();
        u.setName(req.name());
        u.setEmail(req.email());
        u.setPasswordHash(encoder.encode(req.password()));
        
        String plan = req.plan();
        if (plan != null && !plan.isBlank()) {
            // Capitalize first letter (Starter, Pro, Agency)
            plan = plan.substring(0, 1).toUpperCase() + plan.substring(1).toLowerCase();
            u.setPlan(plan);
            if ("Starter".equals(plan)) {
                u.setAiCredits(10);
                u.setAiCreditsTotal(10);
            } else if ("Agency".equals(plan)) {
                u.setAiCredits(1000);
                u.setAiCreditsTotal(1000);
            } else {
                u.setPlan("Pro");
                u.setAiCredits(200);
                u.setAiCreditsTotal(200);
            }
        } else {
            u.setPlan("Pro");
            u.setAiCredits(200);
            u.setAiCreditsTotal(200);
        }
        
        u = users.save(u);
        return new AuthResponse(jwt.generateToken(u.getId(), u.getEmail()), Mappers.user(u));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = users.findByEmail(req.email())
                .filter(user -> encoder.matches(req.password(), user.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(jwt.generateToken(u.getId(), u.getEmail()), Mappers.user(u));
    }

    @GetMapping("/me")
    public UserDto me(@CurrentUserId String userId) {
        User u = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        return Mappers.user(u);
    }
}
