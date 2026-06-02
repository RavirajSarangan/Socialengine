import { getPlatform } from "./dashboard";
import type { MediaItem } from "./types";

/* Single source of truth for what each platform accepts.
   Mirrors backend config/PlatformMedia.java — keep the two in sync.
   Values are configurable approximations; verify against current platform docs. */

interface KindSpec {
    formats: string[]; // lower-case extensions
    maxSizeMB: number;
}

export interface PlatformMediaSpec {
    image: KindSpec;
    video: KindSpec;
    supportsAudio: boolean;
    maxCount: number;
}

export const PLATFORM_MEDIA: Record<string, PlatformMediaSpec> = {
    twitter: {
        image: { formats: ["jpg", "jpeg", "png", "webp", "gif"], maxSizeMB: 5 },
        video: { formats: ["mp4", "mov"], maxSizeMB: 512 },
        supportsAudio: false,
        maxCount: 4,
    },
    instagram: {
        image: { formats: ["jpg", "jpeg", "png"], maxSizeMB: 8 },
        video: { formats: ["mp4", "mov"], maxSizeMB: 100 },
        supportsAudio: false,
        maxCount: 10,
    },
    facebook: {
        image: { formats: ["jpg", "jpeg", "png", "gif", "webp"], maxSizeMB: 30 },
        video: { formats: ["mp4", "mov"], maxSizeMB: 1024 },
        supportsAudio: false,
        maxCount: 10,
    },
    linkedin: {
        image: { formats: ["jpg", "jpeg", "png", "gif"], maxSizeMB: 10 },
        video: { formats: ["mp4"], maxSizeMB: 200 },
        supportsAudio: false,
        maxCount: 9,
    },
};

/** Lower-case file extension derived from a media URL or filename. */
export function formatOf(url: string): string {
    const clean = url.split("?")[0].split("#")[0];
    const dot = clean.lastIndexOf(".");
    return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
}

function platformName(id: string): string {
    return getPlatform(id)?.name ?? id;
}

/** Accepted file formats (for display) of a platform across image+video. */
export function acceptedFormats(platformId: string): string[] {
    const spec = PLATFORM_MEDIA[platformId];
    if (!spec) return [];
    return [...new Set([...spec.image.formats, ...spec.video.formats])];
}

/** `accept` attribute = union of accepted extensions across selected platforms. */
export function acceptFor(platforms: string[]): string {
    if (platforms.length === 0) return "image/*,video/*,audio/*";
    const exts = new Set<string>();
    for (const p of platforms) acceptedFormats(p).forEach((e) => exts.add("." + e));
    return [...exts].join(",");
}

/**
 * Validates a media set against every selected platform.
 * Hard violations (errors) block publishing; soft issues (warnings) do not.
 */
export function validateMedia(media: MediaItem[], platforms: string[]): { errors: string[]; warnings: string[] } {
    const errors = new Set<string>();
    const warnings = new Set<string>();

    for (const id of platforms) {
        const spec = PLATFORM_MEDIA[id];
        if (!spec) continue;
        const name = platformName(id);

        if (media.length > spec.maxCount) {
            errors.add(`${name} allows at most ${spec.maxCount} media item${spec.maxCount === 1 ? "" : "s"} (you have ${media.length}).`);
        }

        for (const m of media) {
            if (m.type === "audio") {
                if (!spec.supportsAudio) warnings.add(`${name} doesn't post standalone audio — add it to a video instead.`);
                continue;
            }
            const kind = m.type === "video" ? spec.video : spec.image;
            const fmt = formatOf(m.url);
            if (fmt && !kind.formats.includes(fmt)) {
                errors.add(`${fmt.toUpperCase()} ${m.type} isn't supported on ${name} (allowed: ${kind.formats.join(", ")}).`);
            }
            if (m.size && m.size > kind.maxSizeMB * 1024 * 1024) {
                errors.add(`${m.type === "video" ? "Video" : "Image"} exceeds ${name}'s ${kind.maxSizeMB} MB limit.`);
            }
        }
    }

    return { errors: [...errors], warnings: [...warnings] };
}
