package dev.socialengine.web;

import dev.socialengine.domain.SocialAccount;
import dev.socialengine.repo.SocialAccountRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final SocialAccountRepository accounts;

    public AccountController(SocialAccountRepository accounts) {
        this.accounts = accounts;
    }

    @GetMapping
    public List<AccountDto> list(@CurrentUserId String userId) {
        return accounts.findByUserId(userId).stream().map(Mappers::account).toList();
    }

    @PostMapping("/connect")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountDto connect(@CurrentUserId String userId, @RequestBody ConnectAccountRequest req) {
        SocialAccount a = new SocialAccount();
        a.setUserId(userId);
        a.setPlatform(req.platform());
        a.setHandle(req.handle() == null ? "account" : req.handle());
        a.setStatus("connected");
        a.setProviderAccountId("local-" + System.currentTimeMillis());
        return Mappers.account(accounts.save(a));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect(@CurrentUserId String userId, @PathVariable String id) {
        SocialAccount a = accounts.findById(id)
                .filter(acc -> acc.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        accounts.delete(a);
    }
}
