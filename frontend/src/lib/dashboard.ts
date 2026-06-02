import { PLATFORMS } from "../assets/assets";
import type { Platform } from "../assets/assets";

/* Static config + pure helpers used across the dashboard.
   All live data now comes from the API via hooks in src/hooks/useData.ts. */

export { PLATFORMS };
export type { Platform };

export function getPlatform(id: string): Platform | undefined {
    return PLATFORMS.find((p) => p.id === id);
}

/* ---- Date / number helpers ---- */

export function formatRelativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function truncate(text: string, max = 140): string {
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

/* ---- Static config for AI Studio / Composer ---- */

export const voiceOptions = [
    { id: "rachel", name: "Rachel", description: "Warm, natural narration" },
    { id: "adam", name: "Adam", description: "Deep, confident male" },
    { id: "bella", name: "Bella", description: "Soft, friendly female" },
    { id: "antoni", name: "Antoni", description: "Energetic, upbeat" },
];

export const toneOptions = ["Professional", "Friendly", "Casual", "Bold", "Inspirational", "Concise"];
