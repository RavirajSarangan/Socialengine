package dev.socialengine.web;

import dev.socialengine.domain.MediaAsset;
import dev.socialengine.repo.MediaAssetRepository;
import dev.socialengine.security.CurrentUserId;
import dev.socialengine.service.MediaAssetService;
import dev.socialengine.service.MediaStore;
import dev.socialengine.web.dto.Dtos.MediaAssetDto;
import dev.socialengine.web.dto.Dtos.UpdatePosterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Media library: upload/list/delete user assets; serve via /media/**. */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaAssetRepository assets;
    private final MediaAssetService mediaService;
    private final MediaStore store;

    public MediaController(MediaAssetRepository assets, MediaAssetService mediaService, MediaStore store) {
        this.assets = assets;
        this.mediaService = mediaService;
        this.store = store;
    }

    @GetMapping
    public List<MediaAssetDto> list(@CurrentUserId String userId) {
        return assets.findByUserIdOrderByCreatedAtDesc(userId).stream().map(Mappers::mediaAsset).toList();
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAssetDto upload(@CurrentUserId String userId, @RequestParam("file") MultipartFile file,
                                @RequestParam(value = "type", required = false) String type) {
        String resolvedType = type != null ? type : typeOf(file.getContentType());
        if (resolvedType == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only image, video and audio files are allowed");
        }
        String url = store.saveUpload(file);
        MediaAsset a = mediaService.record(userId, url, resolvedType, null,
                file.getOriginalFilename(), file.getSize(), "upload");
        return Mappers.mediaAsset(a);
    }

    @PatchMapping("/{id}")
    public MediaAssetDto setPoster(@CurrentUserId String userId, @PathVariable String id,
                                   @RequestBody UpdatePosterRequest req) {
        MediaAsset a = owned(userId, id);
        a.setPosterUrl(req.posterUrl());
        a = assets.save(a);
        return Mappers.mediaAsset(a);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId String userId, @PathVariable String id) {
        mediaService.delete(owned(userId, id));
    }

    private MediaAsset owned(String userId, String id) {
        return assets.findById(id)
                .filter(a -> a.getUserId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));
    }

    private String typeOf(String contentType) {
        if (contentType == null) return null;
        if (contentType.startsWith("image/")) return "image";
        if (contentType.startsWith("video/")) return "video";
        if (contentType.startsWith("audio/")) return "audio";
        return null;
    }
}
