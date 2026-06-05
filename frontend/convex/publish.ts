import { action, internalAction, internalQuery, internalMutation } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

export const _get = internalQuery({
    args: { postId: v.id("posts") },
    handler: async (ctx, { postId }) => {
        const p = await ctx.db.get(postId);
        if (!p) return null;
        const urls: string[] = [];
        for (const m of p.media ?? []) {
            const u = m.storageId ? await ctx.storage.getUrl(m.storageId) : m.url;
            if (u) urls.push(u);
        }
        return { userId: p.userId, content: p.content, platforms: p.platforms, status: p.status, mediaUrls: urls };
    },
});

export const _mark = internalMutation({
    args: { postId: v.id("posts"), status: v.string(), description: v.string() },
    handler: async (ctx, { postId, status, description }) => {
        const p = await ctx.db.get(postId);
        if (!p) return;
        await ctx.db.patch(postId, { status, publishedAt: status === "published" ? Date.now() : p.publishedAt });
        await ctx.db.insert("activities", {
            userId: p.userId,
            actionType: status === "published" ? "POST_PUBLISHED" : "POST_PUBLISH_FAILED",
            description,
            relatedPostId: postId,
            relatedPostContent: p.content,
        });
    },
});

export const _due = internalQuery({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const rows = await ctx.db.query("posts").withIndex("by_status_scheduledFor", (q) => q.eq("status", "scheduled").lte("scheduledFor", now)).take(25);
        return rows.map((p) => p._id);
    },
});

async function deliver(ctx: ActionCtx, postId: Id<"posts">): Promise<string> {
    const post = await ctx.runQuery(internal.publish._get, { postId });
    if (!post) return "missing";
    const platforms = post.platforms.join(", ");
    const key = process.env.AYRSHARE_API_KEY;
    if (key) {
        try {
            const res = await fetch("https://api.ayrshare.com/api/post", {
                method: "POST",
                headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
                body: JSON.stringify({ post: post.content || "(no caption)", platforms: post.platforms, ...(post.mediaUrls.length ? { mediaUrls: post.mediaUrls } : {}) }),
            });
            const data = await res.json().catch(() => ({}));
            const ok = res.ok && (data.status === "success" || data.status === "scheduled");
            if (!ok) {
                await ctx.runMutation(internal.publish._mark, { postId, status: "failed", description: "Publish failed: " + JSON.stringify(data).slice(0, 180) });
                return "failed";
            }
        } catch (e) {
            await ctx.runMutation(internal.publish._mark, { postId, status: "failed", description: "Publish failed: " + String(e).slice(0, 180) });
            return "failed";
        }
    }
    await ctx.runMutation(internal.publish._mark, { postId, status: "published", description: `Published post to ${platforms}${key ? "" : " (simulated)"}` });
    return "published";
}

export const publish = action({
    args: { postId: v.id("posts") },
    handler: async (ctx, { postId }): Promise<{ status: string }> => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const post = await ctx.runQuery(internal.publish._get, { postId });
        if (!post || post.userId !== userId) throw new Error("Post not found");
        return { status: await deliver(ctx, postId) };
    },
});

export const publishDue = internalAction({
    args: {},
    handler: async (ctx) => {
        const due = await ctx.runQuery(internal.publish._due, {});
        for (const postId of due) await deliver(ctx, postId);
    },
});
