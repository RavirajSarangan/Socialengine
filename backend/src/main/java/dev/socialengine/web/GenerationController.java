package dev.socialengine.web;

import dev.socialengine.repo.GenerationRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.web.dto.Dtos.GenerationDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/generations")
public class GenerationController {

    private final GenerationRepository generations;

    public GenerationController(GenerationRepository generations) {
        this.generations = generations;
    }

    @GetMapping
    public List<GenerationDto> list(@CurrentUserId String userId) {
        return generations.findByUserIdOrderByCreatedAtDesc(userId).stream().map(Mappers::generation).toList();
    }
}
