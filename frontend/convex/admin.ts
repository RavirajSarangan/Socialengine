import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, iso } from "./lib/guards";

export const stats = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const [users, posts, accounts, generations] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("posts").collect(),
            ctx.db.query("socialAccounts").collect(),
            ctx.db.query("generations").collect(),
        ]);
        return {
            users: users.length,
            posts: posts.length,
            published: posts.filter((p) => p.status === "published").length,
            accounts: accounts.length,
            generations: generations.length,
        };
    },
});

export const users = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const rows = await ctx.db.query("users").order("desc").take(200);
        return rows.map((u) => ({
            _id: u._id,
            name: u.name ?? "",
            email: u.email ?? "",
            plan: u.plan ?? "Starter",
            aiCredits: u.aiCredits ?? 0,
            role: u.role ?? "user",
            createdAt: iso(u._creationTime),
        }));
    },
});

export const activities = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const rows = await ctx.db.query("activities").order("desc").take(100);
        return rows.map((a) => ({ _id: a._id, user: a.userId, actionType: a.actionType, description: a.description, createdAt: iso(a._creationTime) }));
    },
});

export const patchUser = mutation({
    args: { id: v.id("users"), plan: v.optional(v.string()), aiCredits: v.optional(v.number()), role: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const patch: { plan?: string; aiCredits?: number; aiCreditsTotal?: number; role?: string } = {};
        if (args.plan !== undefined) patch.plan = args.plan;
        if (args.aiCredits !== undefined) { patch.aiCredits = args.aiCredits; patch.aiCreditsTotal = args.aiCredits; }
        if (args.role !== undefined) patch.role = args.role;
        await ctx.db.patch(args.id, patch);
        return { ok: true };
    },
});

export const removeUser = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, { id }) => {
        const adminId = await requireAdmin(ctx);
        if (id === adminId) throw new Error("You cannot delete your own admin account");
        await ctx.db.delete(id);
        return { ok: true };
    },
});
