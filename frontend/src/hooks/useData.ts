import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
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
    size?: number;
}

export interface CreatePostInput {
    content: string;
    platforms: string[];
    media?: PostMediaInput[];
    mediaUrl?: string;
    mediaType?: string;
    scheduledFor?: string;
    status?: string;
}

export interface AiResult {
    generation: Generation;
    remainingCredits: number;
}

type Opts<R> = { onSuccess?: (r: R) => void; onError?: (e: unknown) => void };

/** react-query-style { data, isLoading } from a Convex reactive query (undefined while loading). */
function qr<T>(data: T | undefined) {
    return { data, isLoading: data === undefined };
}

/** react-query-style mutation surface over a Convex mutation/action runner. */
function useAdapter<PageArg, R>(runner: (arg: unknown) => Promise<R>, map: (a: PageArg) => unknown) {
    const [isPending, setPending] = useState(false);
    const [variables, setVariables] = useState<PageArg | undefined>(undefined);
    const mutateAsync = async (arg: PageArg): Promise<R> => {
        setPending(true);
        setVariables(arg);
        try {
            return await runner(map(arg));
        } finally {
            setPending(false);
        }
    };
    const mutate = (arg: PageArg, opts?: Opts<R>) => {
        mutateAsync(arg).then((r) => opts?.onSuccess?.(r)).catch((e) => opts?.onError?.(e));
    };
    return { mutate, mutateAsync, isPending, variables };
}

// ---- Queries ----
export function usePosts() { return qr(useQuery(api.posts.list) as Post[] | undefined); }
export function useAccounts() { return qr(useQuery(api.accounts.list) as SocialAccount[] | undefined); }
export function useActivity() { return qr(useQuery(api.activities.list) as Activity[] | undefined); }
export function useGenerations() { return qr(useQuery(api.generations.list) as Generation[] | undefined); }
export function useAnalytics() { return qr(useQuery(api.analytics.summary) as AnalyticsSummary | undefined); }
export function useAutoReply() { return qr(useQuery(api.autoReply.list) as AutoReplyRule[] | undefined); }

// ---- Posts ----
export function useCreatePost() {
    const run = useMutation(api.posts.create);
    return useAdapter<CreatePostInput, Post>((a) => run(a as never) as Promise<Post>, (a) => a);
}
export function useDuplicatePost() {
    const run = useMutation(api.posts.duplicate);
    return useAdapter<string, Post>((a) => run(a as never) as Promise<Post>, (id) => ({ id: id as Id<"posts"> }));
}
export function useDeletePost() {
    const run = useMutation(api.posts.remove);
    return useAdapter<string, unknown>((a) => run(a as never), (id) => ({ id: id as Id<"posts"> }));
}
export function usePublishPost() {
    const run = useAction(api.publish.publish);
    return useAdapter<string, { status: string }>((a) => run(a as never) as Promise<{ status: string }>, (id) => ({ postId: id as Id<"posts"> }));
}

// ---- Accounts ----
export function useConnectAccount() {
    const run = useMutation(api.accounts.connect);
    return useAdapter<{ platform: string; handle: string }, SocialAccount>((a) => run(a as never) as Promise<SocialAccount>, (a) => a);
}
export function useDisconnectAccount() {
    const run = useMutation(api.accounts.disconnect);
    return useAdapter<string, unknown>((a) => run(a as never), (id) => ({ id: id as Id<"socialAccounts"> }));
}
export function useVerifyAccounts() {
    const run = useAction(api.accounts.verify);
    return useAdapter<void, unknown>((a) => run(a as never), () => ({}));
}

// ---- Auto-reply ----
export function useToggleRule() {
    const run = useMutation(api.autoReply.toggle);
    return useAdapter<{ id: string; enabled: boolean }, AutoReplyRule>((a) => run(a as never) as Promise<AutoReplyRule>, (a) => ({ id: a.id as Id<"autoReplyRules">, enabled: a.enabled }));
}
export function useCreateRule() {
    const run = useMutation(api.autoReply.create);
    return useAdapter<{ platform: string; trigger: string; tone: string; instructions: string; enabled?: boolean }, AutoReplyRule>((a) => run(a as never) as Promise<AutoReplyRule>, (a) => a);
}

// ---- AI ----
export function useGenerateCaption() {
    const run = useAction(api.ai.caption);
    return useAdapter<{ prompt: string; tone?: string; platforms?: string[] }, AiResult>((a) => run(a as never) as Promise<AiResult>, (a) => a);
}
export function useGenerateImage() {
    const run = useAction(api.ai.image);
    return useAdapter<{ prompt: string }, AiResult>((a) => run(a as never) as Promise<AiResult>, (a) => a);
}
export function useGenerateVoice() {
    const run = useAction(api.ai.voice);
    return useAdapter<{ text: string; voiceId: string }, AiResult>((a) => run(a as never) as Promise<AiResult>, (a) => a);
}
