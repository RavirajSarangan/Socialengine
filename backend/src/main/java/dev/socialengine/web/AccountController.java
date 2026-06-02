package dev.socialengine.web;

import dev.socialengine.domain.SocialAccount;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.SocialAccountRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.service.ActivityService;
import dev.socialengine.service.AyrshareClient;
import dev.socialengine.web.dto.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final SocialAccountRepository accounts;
    private final ActivityService activityService;
    private final RealtimePublisher realtime;
    private final AyrshareClient ayrshare;

    public AccountController(SocialAccountRepository accounts, ActivityService activityService,
                            RealtimePublisher realtime, AyrshareClient ayrshare) {
        this.accounts = accounts;
        this.activityService = activityService;
        this.realtime = realtime;
        this.ayrshare = ayrshare;
    }

    @GetMapping
    public List<AccountDto> list(@CurrentUserId String userId) {
        return accounts.findByUserId(userId).stream().map(Mappers::account).toList();
    }

    @PostMapping("/connect")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountDto connect(@CurrentUserId String userId, @RequestBody ConnectAccountRequest req) {
        if (req.platform() == null || req.platform().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Platform is required");
        }
        if (req.handle() == null || req.handle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Handle is required");
        }
        SocialAccount a = new SocialAccount();
        a.setUserId(userId);
        a.setPlatform(req.platform().trim());
        a.setHandle(req.handle().trim().replaceFirst("^@", ""));
        a.setStatus(statusFor(a.getPlatform()));
        a.setProviderAccountId((ayrshare.isEnabled() ? "ayrshare-" : "local-") + System.currentTimeMillis());
        a = accounts.save(a);
        activityService.log(userId, "ACCOUNT_CONNECTED", "Connected " + a.getPlatform() + " account @" + a.getHandle(), null);
        realtime.accountsChanged(userId);
        return Mappers.account(a);
    }

    /** Re-checks each connected account against the publishing provider (Ayrshare) and refreshes its status. */
    @PostMapping("/verify")
    public List<AccountDto> verify(@CurrentUserId String userId) {
        var connected = ayrshare.connectedPlatforms();
        for (SocialAccount a : accounts.findByUserId(userId)) {
            String status = !ayrshare.isEnabled()
                    ? a.getStatus()
                    : (connected.contains(a.getPlatform().toLowerCase()) ? "connected" : "pending");
            a.setStatus(status);
            a.setUpdatedAt(java.time.Instant.now());
            accounts.save(a);
        }
        realtime.accountsChanged(userId);
        return accounts.findByUserId(userId).stream().map(Mappers::account).toList();
    }

    /** "connected" in simulated mode; against Ayrshare, "connected" only if the platform is actually linked. */
    private String statusFor(String platform) {
        if (!ayrshare.isEnabled()) return "connected";
        return ayrshare.connectedPlatforms().contains(platform.toLowerCase()) ? "connected" : "pending";
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect(@CurrentUserId String userId, @PathVariable String id) {
        SocialAccount a = accounts.findById(id)
                .filter(acc -> acc.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        accounts.delete(a);
        activityService.log(userId, "ACCOUNT_DISCONNECTED", "Disconnected " + a.getPlatform() + " account @" + a.getHandle(), null);
        realtime.accountsChanged(userId);
    }
}
