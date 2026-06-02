package dev.socialengine.web;

import dev.socialengine.domain.Generation;
import dev.socialengine.domain.User;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.GenerationRepository;
import dev.socialengine.repo.UserRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.service.ElevenLabsService;
import dev.socialengine.service.MediaAssetService;
import dev.socialengine.service.MediaStore;
import dev.socialengine.service.OpenAiService;
import dev.socialengine.web.dto.Dtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

/** AI generation endpoints: OpenAI captions + images, ElevenLabs voiceovers. */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final UserRepository users;
    private final GenerationRepository generations;
    private final OpenAiService openai;
    private final ElevenLabsService elevenlabs;
    private final MediaStore media;
    private final MediaAssetService mediaLibrary;
    private final RealtimePublisher realtime;

    public AiController(UserRepository users, GenerationRepository generations, OpenAiService openai,
                        ElevenLabsService elevenlabs, MediaStore media, MediaAssetService mediaLibrary,
                        RealtimePublisher realtime) {
        this.users = users;
        this.generations = generations;
        this.openai = openai;
        this.elevenlabs = elevenlabs;
        this.media = media;
        this.mediaLibrary = mediaLibrary;
        this.realtime = realtime;
    }

    @PostMapping("/caption")
    public AiResultDto caption(@CurrentUserId String userId, @Valid @RequestBody CaptionRequest req) {
        User user = requireCredits(userId);
        String text = openai.generateCaption(req.prompt(), req.tone(), req.platforms());
        Generation g = persist(userId, req.prompt(), text, null, null, req.tone(), "text");
        return finish(user, g);
    }

    @PostMapping("/image")
    public AiResultDto image(@CurrentUserId String userId, @Valid @RequestBody ImageRequest req) {
        User user = requireCredits(userId);
        byte[] bytes = openai.generateImage(req.prompt());
        String url = media.save(bytes, "png");
        mediaLibrary.recordAi(userId, url, "image");
        Generation g = persist(userId, req.prompt(), "", url, "image", null, "image");
        return finish(user, g);
    }

    @PostMapping("/voice")
    public AiResultDto voice(@CurrentUserId String userId, @Valid @RequestBody VoiceRequest req) {
        User user = requireCredits(userId);
        byte[] bytes = elevenlabs.generateVoice(req.text(), req.voiceId());
        String url = media.save(bytes, "mp3");
        mediaLibrary.recordAi(userId, url, "audio");
        Generation g = persist(userId, req.text(), "", url, "audio", null, "voice");
        return finish(user, g);
    }

    @PostMapping("/video")
    public AiResultDto video(@CurrentUserId String userId, @RequestBody ImageRequest req) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED,
                "AI video generation needs a video provider (e.g. Sora/Runway). Add a video API key to enable it — meanwhile you can upload your own video.");
    }

    private User requireCredits(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getAiCredits() <= 0) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Out of AI credits");
        }
        return user;
    }

    private Generation persist(String userId, String prompt, String content, String mediaUrl,
                               String mediaType, String tone, String type) {
        Generation g = new Generation();
        g.setUserId(userId);
        g.setPrompt(prompt);
        g.setContent(content);
        g.setMediaUrl(mediaUrl);
        g.setMediaType(mediaType);
        g.setTone(tone);
        g.setType(type);
        return generations.save(g);
    }

    /** Spend one credit (only after a successful generation) and broadcast the change. */
    private AiResultDto finish(User user, Generation g) {
        user.setAiCredits(user.getAiCredits() - 1);
        user.setUpdatedAt(Instant.now());
        users.save(user);
        realtime.generationsChanged(user.getId());
        return new AiResultDto(Mappers.generation(g), user.getAiCredits());
    }
}
