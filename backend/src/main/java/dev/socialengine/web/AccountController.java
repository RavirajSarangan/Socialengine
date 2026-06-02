package dev.socialengine.web;

import dev.socialengine.domain.SocialAccount;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.SocialAccountRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.service.ActivityService;
import dev.socialengine.web.dto.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final SocialAccountRepository accounts;
    private final ActivityService activityService;
    private final RealtimePublisher realtime;

    public AccountController(SocialAccountRepository accounts, ActivityService activityService, RealtimePublisher realtime) {
        this.accounts = accounts;
        this.activityService = activityService;
        this.realtime = realtime;
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
        a.setStatus("connected");
        a.setProviderAccountId("local-" + System.currentTimeMillis());
        a = accounts.save(a);
        activityService.log(userId, "ACCOUNT_CONNECTED", "Connected " + a.getPlatform() + " account @" + a.getHandle(), null);
        realtime.accountsChanged(userId);
        return Mappers.account(a);
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
