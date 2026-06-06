import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { requireUser, iso } from "./lib/guards";

async function shape(ctx: QueryCtx | MutationCtx, a: Doc<"mediaAssets">) {
    const url = a.storageId ? await ctx.storage.getUrl(a.storageId) : a.url ?? null;
    return {
        _id: a._id,
        user: a.userId,
        url: url ?? "",
        type: a.type,
        posterUrl: a.posterUrl,
        name: a.name,
        size: a.size ?? 0,
        source: a.source,
        createdAt: iso(a._creationTime),
    };
}

export const list = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        const userId = await requireUser(ctx, token);
        const rows = await ctx.db.query("mediaAssets").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
        return Promise.all(rows.map((a) => shape(ctx, a)));
    },
});

export const generateUploadUrl = mutation({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        await requireUser(ctx, token);
        return await ctx.storage.generateUploadUrl();
    },
});

export const addAsset = mutation({
    args: { token: v.optional(v.string()), storageId: v.id("_storage"), type: v.string(), name: v.optional(v.string()), size: v.optional(v.number()), posterUrl: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx, args.token);
        const id = await ctx.db.insert("mediaAssets", { userId, storageId: args.storageId, type: args.type, name: args.name, size: args.size, posterUrl: args.posterUrl, source: "upload" });
        return shape(ctx, (await ctx.db.get(id))!);
    },
});

export const patchPoster = mutation({
    args: { token: v.optional(v.string()), id: v.id("mediaAssets"), posterUrl: v.string() },
    handler: async (ctx, { token, id, posterUrl }) => {
        const userId = await requireUser(ctx, token);
        const a = await ctx.db.get(id);
        if (!a || a.userId !== userId) throw new Error("Media not found");
        await ctx.db.patch(id, { posterUrl });
        return shape(ctx, (await ctx.db.get(id))!);
    },
});

export const remove = mutation({
    args: { token: v.optional(v.string()), id: v.id("mediaAssets") },
    handler: async (ctx, { token, id }) => {
        const userId = await requireUser(ctx, token);
        const a = await ctx.db.get(id);
        if (!a || a.userId !== userId) throw new Error("Media not found");
        if (a.storageId) await ctx.storage.delete(a.storageId);
        await ctx.db.delete(id);
    },
});
