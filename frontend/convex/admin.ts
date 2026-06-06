import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, iso } from "./lib/guards";

export const stats = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        await requireAdmin(ctx, token);
        const [users, posts, accounts, generations, media] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("posts").collect(),
            ctx.db.query("socialAccounts").collect(),
            ctx.db.query("generations").collect(),
            ctx.db.query("mediaAssets").collect(),
        ]);
        const byPlan: Record<string, number> = {};
        for (const u of users) { const p = u.plan ?? "Starter"; byPlan[p] = (byPlan[p] ?? 0) + 1; }
        return {
            users: users.length,
            admins: users.filter((u) => u.role === "admin").length,
            posts: posts.length,
            published: posts.filter((p) => p.status === "published").length,
            accounts: accounts.length,
            generations: generations.length,
            media: media.length,
            byPlan,
        };
    },
});

export const users = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        await requireAdmin(ctx, token);
        const rows = await ctx.db.query("users").order("desc").take(200);
        return rows.map((u) => ({
            _id: u._id,
            name: u.name ?? "",
            email: u.email ?? "",
            plan: u.plan ?? "Starter",
            aiCredits: u.aiCredits ?? 0,
            aiCreditsTotal: u.aiCreditsTotal ?? 0,
            role: u.role ?? "user",
            createdAt: iso(u._creationTime),
        }));
    },
});

export const activities = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        await requireAdmin(ctx, token);
        const rows = await ctx.db.query("activities").order("desc").take(100);
        return rows.map((a) => ({
            _id: a._id,
            user: a.userId,
            actionType: a.actionType,
            description: a.description,
            relatedPost: a.relatedPostId ? { _id: a.relatedPostId, content: a.relatedPostContent ?? "" } : undefined,
            createdAt: iso(a._creationTime),
            updatedAt: iso(a._creationTime),
        }));
    },
});

export const patchUser = mutation({
    args: { token: v.optional(v.string()), id: v.id("users"), plan: v.optional(v.string()), aiCredits: v.optional(v.number()), aiCreditsTotal: v.optional(v.number()), role: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await requireAdmin(ctx, args.token);
        const patch: { plan?: string; aiCredits?: number; aiCreditsTotal?: number; role?: string } = {};
        if (args.plan !== undefined) patch.plan = args.plan;
        if (args.aiCredits !== undefined) patch.aiCredits = args.aiCredits;
        if (args.aiCreditsTotal !== undefined) patch.aiCreditsTotal = args.aiCreditsTotal;
        if (args.role !== undefined) patch.role = args.role;
        await ctx.db.patch(args.id, patch);
        return { ok: true };
    },
});

export const removeUser = mutation({
    args: { token: v.optional(v.string()), id: v.id("users") },
    handler: async (ctx, { token, id }) => {
        const adminId = await requireAdmin(ctx, token);
        if (id === adminId) throw new Error("You cannot delete your own admin account");
        await ctx.db.delete(id);
        return { ok: true };
    },
});
