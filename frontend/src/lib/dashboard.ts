import { PLATFORMS, dummyAccountsData, dummyActivityData, dummyGenerationData, dummyPostsData } from "../assets/assets";
import type { Platform } from "../assets/assets";
import type { Activity, AutoReplyRule, Generation, Post, SocialAccount } from "./types";

/* Existing dummy data, re-exported with proper types so dashboard pages stay typed.
   When the backend lands (Phase 3) these are swapped for API calls — the shapes match. */
export const posts = dummyPostsData as Post[];
export const accounts = dummyAccountsData as SocialAccount[];
export const activity = dummyActivityData as Activity[];
export const generations = dummyGenerationData as Generation[];

export const currentUser = {
    name: "Socialengine",
    email: "hello@socialengine.app",
    plan: "Pro" as const,
    aiCredits: 168,
    aiCreditsTotal: 200,
};

/* Auto-reply rules are a new feature with no existing mock data — seed a few. */
export const autoReplyRules: AutoReplyRule[] = [
    { _id: "rule_1", user: currentUser.email, platform: "instagram", trigger: "New comment", tone: "Friendly", instructions: "Thank the commenter and invite them to DM for details.", enabled: true },
    { _id: "rule_2", user: currentUser.email, platform: "linkedin", trigger: "Mention", tone: "Professional", instructions: "Acknowledge the mention and offer a relevant resource link.", enabled: true },
    { _id: "rule_3", user: currentUser.email, platform: "twitter", trigger: "Direct message", tone: "Concise", instructions: "Answer FAQs about pricing; escalate anything else to a human.", enabled: false },
];

/* ---- Platform helpers (reuse PLATFORMS config from assets.tsx) ---- */

export function getPlatform(id: string): Platform | undefined {
    return PLATFORMS.find((p) => p.id === id);
}

export { PLATFORMS };
export type { Platform };

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

/* ---- Derived dashboard stats ---- */

export function getStats() {
    return {
        scheduled: posts.filter((p) => p.status === "scheduled").length,
        published: posts.filter((p) => p.status === "published").length,
        accounts: accounts.filter((a) => a.status === "connected").length,
        aiRules: autoReplyRules.filter((r) => r.enabled).length,
    };
}

/* ---- Mock analytics series (real metrics arrive in Phase 6) ---- */

export const analyticsSeries = [
    { label: "Mon", posts: 3, engagement: 120 },
    { label: "Tue", posts: 5, engagement: 240 },
    { label: "Wed", posts: 2, engagement: 90 },
    { label: "Thu", posts: 6, engagement: 320 },
    { label: "Fri", posts: 4, engagement: 280 },
    { label: "Sat", posts: 1, engagement: 60 },
    { label: "Sun", posts: 3, engagement: 150 },
];

/* Voices offered by the ElevenLabs voiceover feature (Phase 4 wires the real API). */
export const voiceOptions = [
    { id: "rachel", name: "Rachel", description: "Warm, natural narration" },
    { id: "adam", name: "Adam", description: "Deep, confident male" },
    { id: "bella", name: "Bella", description: "Soft, friendly female" },
    { id: "antoni", name: "Antoni", description: "Energetic, upbeat" },
];

export const toneOptions = ["Professional", "Friendly", "Casual", "Bold", "Inspirational", "Concise"];
