import { query } from "./_generated/server";
import { requireUserId } from "./lib/guards";

export const summary = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);
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
