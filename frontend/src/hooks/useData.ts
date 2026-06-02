import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Activity, AutoReplyRule, Generation, Post, SocialAccount } from "../lib/types";

export interface AnalyticsSummary {
    scheduled: number;
    published: number;
    accounts: number;
    aiRules: number;
    totalReach: number;
    engagements: number;
}

export interface PostMediaInput {
    url: string;
    type: string;
    posterUrl?: string;
}

export interface CreatePostInput {
    content: string;
    platforms: string[];
    mediaUrl?: string;
    mediaType?: string;
    media?: PostMediaInput[];
    scheduledFor?: string;
    status?: string;
}

export const qk = {
    posts: ["posts"] as const,
    accounts: ["accounts"] as const,
    activity: ["activity"] as const,
    generations: ["generations"] as const,
    analytics: ["analytics"] as const,
    autoReply: ["auto-reply"] as const,
    media: ["media"] as const,
};

export function usePosts() {
    return useQuery({ queryKey: qk.posts, queryFn: async () => (await api.get<Post[]>("/posts")).data });
}

export function useAccounts() {
    return useQuery({ queryKey: qk.accounts, queryFn: async () => (await api.get<SocialAccount[]>("/accounts")).data });
}

export function useActivity() {
    return useQuery({ queryKey: qk.activity, queryFn: async () => (await api.get<Activity[]>("/activities")).data });
}

export function useGenerations() {
    return useQuery({ queryKey: qk.generations, queryFn: async () => (await api.get<Generation[]>("/generations")).data });
}

export function useAnalytics() {
    return useQuery({ queryKey: qk.analytics, queryFn: async () => (await api.get<AnalyticsSummary>("/analytics/summary")).data });
}

export function useCreatePost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreatePostInput) => (await api.post<Post>("/posts", input)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.posts });
            qc.invalidateQueries({ queryKey: qk.activity });
            qc.invalidateQueries({ queryKey: qk.analytics });
        },
    });
}

export function useDuplicatePost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => (await api.post<Post>(`/posts/${id}/duplicate`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.posts });
            qc.invalidateQueries({ queryKey: qk.analytics });
        },
    });
}

export function useConnectAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: { platform: string; handle: string }) =>
            (await api.post<SocialAccount>("/accounts/connect", input)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts }),
    });
}

export function useDisconnectAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => api.delete(`/accounts/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts }),
    });
}

export function useAutoReply() {
    return useQuery({ queryKey: qk.autoReply, queryFn: async () => (await api.get<AutoReplyRule[]>("/auto-reply")).data });
}

export function useToggleRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) =>
            (await api.patch<AutoReplyRule>(`/auto-reply/${id}`, { enabled })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.autoReply }),
    });
}

export function useCreateRule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: { platform: string; trigger: string; tone: string; instructions: string; enabled?: boolean }) =>
            (await api.post<AutoReplyRule>("/auto-reply", input)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.autoReply });
            qc.invalidateQueries({ queryKey: qk.analytics });
        },
    });
}

// ---- AI generation (OpenAI captions/images, ElevenLabs voice) ----

export interface AiResult {
    generation: Generation;
    remainingCredits: number;
}

export function useGenerateCaption() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: { prompt: string; tone?: string; platforms?: string[] }) =>
            (await api.post<AiResult>("/ai/caption", input)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.generations }),
    });
}

export function useGenerateImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: { prompt: string }) => (await api.post<AiResult>("/ai/image", input)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.generations }),
    });
}

export function useGenerateVoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: { text: string; voiceId: string }) => (await api.post<AiResult>("/ai/voice", input)).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: qk.generations }),
    });
}
