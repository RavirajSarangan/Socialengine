package dev.socialengine.config;

import dev.socialengine.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Ensures the system always has at least one admin:
 *  - promotes any user whose email is listed in app.admin-emails (ADMIN_EMAILS)
 *  - if still no admin exists, promotes the oldest account
 */
@Component
@Order(20)
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository users;
    private final Set<String> adminEmails;

    public AdminBootstrap(UserRepository users, @Value("${app.admin-emails:}") String adminEmails) {
        this.users = users;
        this.adminEmails = Arrays.stream(adminEmails.split(","))
                .map(String::trim).map(String::toLowerCase).filter(s -> !s.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    public void run(String... args) {
        for (String email : adminEmails) {
            users.findByEmail(email).ifPresent(u -> {
                if (!"admin".equals(u.getRole())) {
                    u.setRole("admin");
                    users.save(u);
                    log.info("Promoted {} to admin (app.admin-emails)", email);
                }
            });
        }

        if (users.countByRole("admin") == 0) {
            users.findFirstByOrderByCreatedAtAsc().ifPresent(u -> {
                u.setRole("admin");
                users.save(u);
                log.info("No admin found — promoted oldest account {} to admin", u.getEmail());
            });
        }
    }
}
