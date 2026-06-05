import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const credits = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const u = await ctx.db.get(userId);
        return u?.aiCredits ?? 0;
    },
});

export const record = internalMutation({
    args: {
        userId: v.id("users"),
        prompt: v.string(),
        content: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        mediaType: v.optional(v.string()),
        tone: v.optional(v.string()),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");
        if ((user.aiCredits ?? 0) <= 0) throw new Error("Out of AI credits");

        const genId = await ctx.db.insert("generations", {
            userId: args.userId,
            prompt: args.prompt,
            content: args.content,
            storageId: args.storageId,
            mediaType: args.mediaType,
            tone: args.tone,
            type: args.type,
        });
        if (args.storageId) {
            await ctx.db.insert("mediaAssets", { userId: args.userId, storageId: args.storageId, type: args.mediaType ?? "image", source: "ai", name: `AI ${args.mediaType ?? "image"}` });
        }
        const remaining = (user.aiCredits ?? 0) - 1;
        await ctx.db.patch(args.userId, { aiCredits: remaining });

        const g = (await ctx.db.get(genId))!;
        const mediaUrl = g.storageId ? (await ctx.storage.getUrl(g.storageId)) ?? undefined : g.mediaUrl;
        return {
            generation: { _id: g._id, user: g.userId, prompt: g.prompt, content: g.content ?? "", mediaUrl, mediaType: g.mediaType, tone: g.tone, type: g.type, createdAt: new Date(g._creationTime).toISOString(), updatedAt: new Date(g._creationTime).toISOString() },
            remainingCredits: remaining,
        };
    },
});
