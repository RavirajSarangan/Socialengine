import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, iso } from "./lib/guards";

export const list = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        const userId = await requireUser(ctx, token);
        const rows = await ctx.db.query("activities").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").take(100);
        return rows.map((a) => ({
            _id: a._id,
            user: a.userId,
            actionType: a.actionType,
            description: a.description,
            relatedPost: a.relatedPostId ? { _id: a.relatedPostId, content: a.relatedPostContent ?? "" } : null,
            createdAt: iso(a._creationTime),
            updatedAt: iso(a._creationTime),
        }));
    },
});

export const log = internalMutation({
    args: {
        userId: v.id("users"),
        actionType: v.string(),
        description: v.string(),
        relatedPostId: v.optional(v.id("posts")),
        relatedPostContent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("activities", args);
    },
});
