export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role?: string;
    plan: string;
    aiCredits: number;
    aiCreditsTotal: number;
}

export type PlatformId = "twitter" | "linkedin" | "facebook" | "instagram";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export type MediaType = "image" | "audio" | "video";

export interface MediaItem {
    url: string;
    type: MediaType;
    posterUrl?: string;
    size?: number; // bytes — used for per-platform size validation
}

export interface MediaAsset {
    _id: string;
    user: string;
    url: string;
    type: MediaType;
    posterUrl?: string;
    name?: string;
    size: number;
    source: "upload" | "ai";
    createdAt: string;
}

export interface Post {
    _id: string;
    user: string;
    content: string;
    platforms: string[];
    scheduledFor: string;
    status: PostStatus;
    mediaUrl?: string;
    mediaType?: MediaType;
    media?: MediaItem[];
    createdAt: string;
    updatedAt: string;
}

export interface SocialAccount {
    _id: string;
    user: string;
    handle: string;
    platform: string;
    status: "connected" | "disconnected" | "error";
    providerAccountId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    _id: string;
    user: string;
    actionType: string;
    description: string;
    relatedPost: { _id: string; content: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface Generation {
    _id: string;
    user: string;
    prompt: string;
    content: string;
    mediaUrl?: string;
    mediaType?: MediaType;
    tone: string;
    type?: "text" | "image" | "voice";
    createdAt: string;
    updatedAt: string;
}

export interface AutoReplyRule {
    _id: string;
    user: string;
    platform: string;
    trigger: string;
    tone: string;
    instructions: string;
    enabled: boolean;
}
