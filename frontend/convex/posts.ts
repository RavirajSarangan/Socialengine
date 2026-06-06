import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { requireUser, iso } from "./lib/guards";
import { validateMedia } from "./lib/platformMedia";

const mediaArg = v.array(v.object({
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    type: v.string(),
    posterUrl: v.optional(v.string()),
    size: v.optional(v.number()),
}));

function shape(p: Doc<"posts">) {
    return {
        _id: p._id,
        user: p.userId,
        content: p.content,
        platforms: p.platforms,
        media: p.media ?? [],
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        scheduledFor: iso(p.scheduledFor),
        status: p.status,
        publishedAt: iso(p.publishedAt),
        createdAt: iso(p._creationTime),
        updatedAt: iso(p._creationTime),
    };
}

function parseWhen(s: string | undefined): number {
    if (!s) return Date.now();
    const t = Date.parse(s);
    return Number.isNaN(t) ? Date.now() : t;
}

export const list = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        const userId = await requireUser(ctx, token);
        const rows = await ctx.db.query("posts").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
        return rows.map(shape);
    },
});

export const get = query({
    args: { token: v.optional(v.string()), id: v.id("posts") },
    handler: async (ctx, { token, id }) => {
        const userId = await requireUser(ctx, token);
        const p = await ctx.db.get(id);
        if (!p || p.userId !== userId) throw new Error("Post not found");
        return shape(p);
    },
});

export const create = mutation({
    args: {
        token: v.optional(v.string()),
        content: v.string(),
        platforms: v.array(v.string()),
        media: v.optional(mediaArg),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.string()),
        scheduledFor: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx, args.token);
        const status = args.status ?? "scheduled";
        const media = args.media ?? [];
        if (status !== "draft") {
            const violations = validateMedia(media, args.platforms);
            if (violations.length) throw new Error(violations.join(" "));
        }
        const first = media[0];
        const id = await ctx.db.insert("posts", {
            userId,
            content: args.content,
            platforms: args.platforms,
            media,
            mediaUrl: args.mediaUrl ?? first?.url,
            mediaType: args.mediaType ?? first?.type,
            scheduledFor: parseWhen(args.scheduledFor),
            status,
            publishedAt: status === "published" ? Date.now() : undefined,
        });
        const verb = status === "published" ? "Published" : "Scheduled";
        await ctx.db.insert("activities", {
            userId,
            actionType: "POST_" + status.toUpperCase(),
            description: `${verb} post to ${args.platforms.join(", ")}`,
            relatedPostId: id,
            relatedPostContent: args.content,
        });
        return shape((await ctx.db.get(id))!);
    },
});

export const update = mutation({
    args: {
        token: v.optional(v.string()),
        id: v.id("posts"),
        content: v.optional(v.string()),
        platforms: v.optional(v.array(v.string())),
        media: v.optional(mediaArg),
        scheduledFor: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx, args.token);
        const p = await ctx.db.get(args.id);
        if (!p || p.userId !== userId) throw new Error("Post not found");
        const patch: Partial<Doc<"posts">> = {};
        if (args.content !== undefined) patch.content = args.content;
        if (args.platforms !== undefined) patch.platforms = args.platforms;
        if (args.media !== undefined) {
            patch.media = args.media;
            patch.mediaUrl = args.media[0]?.url;
            patch.mediaType = args.media[0]?.type;
        }
        if (args.scheduledFor !== undefined) patch.scheduledFor = parseWhen(args.scheduledFor);
        if (args.status !== undefined) patch.status = args.status;
        await ctx.db.patch(args.id, patch);
        return shape((await ctx.db.get(args.id))!);
    },
});

export const remove = mutation({
    args: { token: v.optional(v.string()), id: v.id("posts") },
    handler: async (ctx, { token, id }) => {
        const userId = await requireUser(ctx, token);
        const p = await ctx.db.get(id);
        if (!p || p.userId !== userId) throw new Error("Post not found");
        await ctx.db.delete(id);
    },
});

export const duplicate = mutation({
    args: { token: v.optional(v.string()), id: v.id("posts") },
    handler: async (ctx, { token, id }) => {
        const userId = await requireUser(ctx, token);
        const p = await ctx.db.get(id);
        if (!p || p.userId !== userId) throw new Error("Post not found");
        const copyId = await ctx.db.insert("posts", {
            userId,
            content: p.content,
            platforms: p.platforms,
            media: p.media,
            mediaUrl: p.mediaUrl,
            mediaType: p.mediaType,
            scheduledFor: Date.now(),
            status: "draft",
        });
        return shape((await ctx.db.get(copyId))!);
    },
});
