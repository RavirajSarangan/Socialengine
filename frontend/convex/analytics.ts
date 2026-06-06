import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/guards";

export const summary = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        const userId = await requireUser(ctx, token);
        const posts = await ctx.db.query("posts").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
        const accounts = await ctx.db.query("socialAccounts").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
        const rules = await ctx.db.query("autoReplyRules").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
        return {
            scheduled: posts.filter((p) => p.status === "scheduled").length,
            published: posts.filter((p) => p.status === "published").length,
            accounts: accounts.filter((a) => a.status === "connected").length,
            aiRules: rules.filter((r) => r.enabled).length,
            totalReach: 0,
            engagements: 0,
        };
    },
});
