package dev.socialengine.config;

import dev.socialengine.web.dto.Dtos.MediaItemDto;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;

/**
 * Authoritative per-platform media spec (accepted formats, max size, max count).
 * Mirrors frontend/src/lib/platformMedia.ts — keep the two in sync.
 */
public final class PlatformMedia {
    private PlatformMedia() {}

    public record KindSpec(Set<String> formats, long maxSizeMB) {}
    public record Spec(KindSpec image, KindSpec video, boolean supportsAudio, int maxCount, String name) {}

    private static KindSpec k(long mb, String... fmts) {
        return new KindSpec(Set.of(fmts), mb);
    }

    public static final Map<String, Spec> SPECS = Map.of(
            "twitter", new Spec(k(5, "jpg", "jpeg", "png", "webp", "gif"), k(512, "mp4", "mov"), false, 4, "Twitter / X"),
            "instagram", new Spec(k(8, "jpg", "jpeg", "png"), k(100, "mp4", "mov"), false, 10, "Instagram"),
            "facebook", new Spec(k(30, "jpg", "jpeg", "png", "gif", "webp"), k(1024, "mp4", "mov"), false, 10, "Facebook"),
            "linkedin", new Spec(k(10, "jpg", "jpeg", "png", "gif"), k(200, "mp4"), false, 9, "LinkedIn")
    );

    /** Returns hard violations (format/size/count) for the media set across the selected platforms. */
    public static List<String> validate(List<String> platforms, List<MediaItemDto> media) {
        Set<String> errors = new LinkedHashSet<>();
        if (platforms == null || media == null || media.isEmpty()) return List.of();

        for (String id : platforms) {
            Spec spec = SPECS.get(id);
            if (spec == null) continue;

            if (media.size() > spec.maxCount()) {
                errors.add(spec.name() + " allows at most " + spec.maxCount() + " media items (you have " + media.size() + ").");
            }
            for (MediaItemDto m : media) {
                if ("audio".equals(m.type())) continue; // soft (warning handled client-side)
                KindSpec kind = "video".equals(m.type()) ? spec.video() : spec.image();
                String fmt = formatOf(m.url());
                if (!fmt.isEmpty() && !kind.formats().contains(fmt)) {
                    errors.add(fmt.toUpperCase() + " " + m.type() + " isn't supported on " + spec.name() + ".");
                }
                if (m.size() != null && m.size() > kind.maxSizeMB() * 1024L * 1024L) {
                    errors.add(("video".equals(m.type()) ? "Video" : "Image") + " exceeds " + spec.name() + "'s " + kind.maxSizeMB() + " MB limit.");
                }
            }
        }
        return List.copyOf(errors);
    }

    private static String formatOf(String url) {
        if (url == null) return "";
        String clean = url.split("[?#]")[0];
        int dot = clean.lastIndexOf('.');
        return dot >= 0 ? clean.substring(dot + 1).toLowerCase() : "";
    }
}
