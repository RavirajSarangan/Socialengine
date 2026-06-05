// Per-platform media spec — mirror of frontend/src/lib/platformMedia.ts (pure, no React).

interface KindSpec { formats: string[]; maxSizeMB: number; }
interface Spec { image: KindSpec; video: KindSpec; supportsAudio: boolean; maxCount: number; name: string; }

const SPECS: Record<string, Spec> = {
    twitter: { image: { formats: ["jpg", "jpeg", "png", "webp", "gif"], maxSizeMB: 5 }, video: { formats: ["mp4", "mov"], maxSizeMB: 512 }, supportsAudio: false, maxCount: 4, name: "Twitter / X" },
    instagram: { image: { formats: ["jpg", "jpeg", "png"], maxSizeMB: 8 }, video: { formats: ["mp4", "mov"], maxSizeMB: 100 }, supportsAudio: false, maxCount: 10, name: "Instagram" },
    facebook: { image: { formats: ["jpg", "jpeg", "png", "gif", "webp"], maxSizeMB: 30 }, video: { formats: ["mp4", "mov"], maxSizeMB: 1024 }, supportsAudio: false, maxCount: 10, name: "Facebook" },
    linkedin: { image: { formats: ["jpg", "jpeg", "png", "gif"], maxSizeMB: 10 }, video: { formats: ["mp4"], maxSizeMB: 200 }, supportsAudio: false, maxCount: 9, name: "LinkedIn" },
};

export interface MediaItemInput { url?: string; type: string; size?: number; }

function formatOf(url: string | undefined): string {
    if (!url) return "";
    const clean = url.split(/[?#]/)[0];
    const dot = clean.lastIndexOf(".");
    return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
}

/** Returns hard violations (format/size/count) for the media across the selected platforms. */
export function validateMedia(media: MediaItemInput[], platforms: string[]): string[] {
    const errors = new Set<string>();
    if (!platforms || !media || media.length === 0) return [];
    for (const id of platforms) {
        const spec = SPECS[id];
        if (!spec) continue;
        if (media.length > spec.maxCount) errors.add(`${spec.name} allows at most ${spec.maxCount} media items (you have ${media.length}).`);
        for (const m of media) {
            if (m.type === "audio") continue;
            const kind = m.type === "video" ? spec.video : spec.image;
            const fmt = formatOf(m.url);
            if (fmt && !kind.formats.includes(fmt)) errors.add(`${fmt.toUpperCase()} ${m.type} isn't supported on ${spec.name}.`);
            if (m.size && m.size > kind.maxSizeMB * 1024 * 1024) errors.add(`${m.type === "video" ? "Video" : "Image"} exceeds ${spec.name}'s ${kind.maxSizeMB} MB limit.`);
        }
    }
    return [...errors];
}
