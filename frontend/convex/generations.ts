import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, iso } from "./lib/guards";

export const list = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        const userId = await requireUser(ctx, token);
        const rows = await ctx.db.query("generations").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").take(50);
        return Promise.all(rows.map(async (g) => ({
            _id: g._id,
            user: g.userId,
            prompt: g.prompt,
            content: g.content ?? "",
            mediaUrl: g.storageId ? (await ctx.storage.getUrl(g.storageId)) ?? undefined : g.mediaUrl,
            mediaType: g.mediaType,
            tone: g.tone,
            type: g.type,
            createdAt: iso(g._creationTime),
            updatedAt: iso(g._creationTime),
        })));
    },
});
