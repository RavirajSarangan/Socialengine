import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/guards";

export const PLANS: Record<string, { id: string; name: string; price: number; aiCredits: number; description: string }> = {
    starter: { id: "starter", name: "Starter", price: 0, aiCredits: 5, description: "For creators getting started." },
    pro: { id: "pro", name: "Pro", price: 29, aiCredits: 200, description: "Everything you need to grow." },
    agency: { id: "agency", name: "Agency", price: 79, aiCredits: 1000, description: "For teams and agencies at scale." },
};

export const plans = query({
    args: {},
    handler: async () => Object.values(PLANS),
});

export const setPlan = mutation({
    args: { plan: v.string() },
    handler: async (ctx, { plan }) => {
        const userId = await requireUserId(ctx);
        const def = PLANS[plan.toLowerCase()];
        if (!def) throw new Error("Unknown plan");
        await ctx.db.patch(userId, { plan: def.name, aiCredits: def.aiCredits, aiCreditsTotal: def.aiCredits });
        const u = (await ctx.db.get(userId))!;
        return { _id: u._id, name: u.name ?? "", email: u.email ?? "", plan: u.plan, aiCredits: u.aiCredits, aiCreditsTotal: u.aiCreditsTotal, role: u.role ?? "user" };
    },
});

export const updateProfile = mutation({
    args: { name: v.optional(v.string()), email: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const patch: { name?: string; email?: string } = {};
        if (args.name !== undefined) {
            if (!args.name.trim()) throw new Error("Name cannot be empty");
            patch.name = args.name.trim();
        }
        if (args.email !== undefined && args.email.trim()) patch.email = args.email.trim().toLowerCase();
        await ctx.db.patch(userId, patch);
        const u = (await ctx.db.get(userId))!;
        return { _id: u._id, name: u.name ?? "", email: u.email ?? "", plan: u.plan, aiCredits: u.aiCredits, aiCreditsTotal: u.aiCreditsTotal, role: u.role ?? "user" };
    },
});
