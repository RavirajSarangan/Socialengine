"use node";

import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const VOICE_IDS: Record<string, string> = {
    rachel: "21m00Tcm4TlvDq8ikWAM",
    adam: "pNInz6obpgDQGcFmaJgB",
    bella: "EXAVITQu4vr4xnSDxMaL",
    antoni: "ErXwobaYiN019PkySvjV",
};

async function requireCreditsUserId(ctx: ActionCtx): Promise<Id<"users">> {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const credits = await ctx.runQuery(internal.aiInternal.credits, { userId });
    if (credits <= 0) throw new Error("Out of AI credits");
    return userId;
}

export const caption = action({
    args: { prompt: v.string(), tone: v.optional(v.string()), platforms: v.optional(v.array(v.string())) },
    handler: async (ctx, args) => {
        const userId = await requireCreditsUserId(ctx);
        const key = process.env.OPENAI_API_KEY;
        if (!key) throw new Error("OpenAI is not configured (set OPENAI_API_KEY)");
        const audience = args.platforms?.length ? ` for ${args.platforms.join(", ")}` : "";
        const system = `You are an expert social media copywriter. Write a single ${(args.tone ?? "professional").toLowerCase()} social media caption${audience}. Add a few relevant hashtags at the end. Return only the caption text.`;
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.8, messages: [{ role: "system", content: system }, { role: "user", content: args.prompt }] }),
        });
        if (!res.ok) throw new Error("OpenAI error: " + (await res.text()).slice(0, 200));
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (!text) throw new Error("OpenAI returned no caption");
        return await ctx.runMutation(internal.aiInternal.record, { userId, prompt: args.prompt, content: text, tone: args.tone, type: "text" });
    },
});

export const image = action({
    args: { prompt: v.string() },
    handler: async (ctx, args) => {
        const userId = await requireCreditsUserId(ctx);
        const key = process.env.OPENAI_API_KEY;
        if (!key) throw new Error("OpenAI is not configured (set OPENAI_API_KEY)");
        const res = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "gpt-image-1", prompt: args.prompt, size: "1024x1024", n: 1 }),
        });
        if (!res.ok) throw new Error("OpenAI error: " + (await res.text()).slice(0, 200));
        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) throw new Error("OpenAI returned no image");
        const blob = new Blob([Buffer.from(b64, "base64")], { type: "image/png" });
        const storageId = await ctx.storage.store(blob);
        return await ctx.runMutation(internal.aiInternal.record, { userId, prompt: args.prompt, storageId, mediaType: "image", type: "image" });
    },
});

export const voice = action({
    args: { text: v.string(), voiceId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await requireCreditsUserId(ctx);
        const key = process.env.ELEVENLABS_API_KEY;
        if (!key) throw new Error("ElevenLabs is not configured (set ELEVENLABS_API_KEY)");
        const voice = VOICE_IDS[(args.voiceId ?? "rachel").toLowerCase()] ?? "21m00Tcm4TlvDq8ikWAM";
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: "POST",
            headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
            body: JSON.stringify({ text: args.text, model_id: "eleven_multilingual_v2" }),
        });
        if (!res.ok) throw new Error(`ElevenLabs error (${res.status}): check ELEVENLABS_API_KEY`);
        const buf = await res.arrayBuffer();
        const storageId = await ctx.storage.store(new Blob([buf], { type: "audio/mpeg" }));
        return await ctx.runMutation(internal.aiInternal.record, { userId, prompt: args.text, storageId, mediaType: "audio", type: "voice" });
    },
});

export const video = action({
    args: { prompt: v.string() },
    handler: async () => {
        throw new Error("AI video generation needs a video provider (e.g. Sora/Runway). Upload your own video meanwhile.");
    },
});
