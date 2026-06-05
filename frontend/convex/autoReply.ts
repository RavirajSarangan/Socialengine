import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { requireUserId } from "./lib/guards";

function shape(r: Doc<"autoReplyRules">) {
    return { _id: r._id, user: r.userId, platform: r.platform, trigger: r.trigger, tone: r.tone, instructions: r.instructions, enabled: r.enabled };
}

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);
        const rows = await ctx.db.query("autoReplyRules").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
        return rows.map(shape);
    },
});

export const create = mutation({
    args: { platform: v.string(), trigger: v.string(), tone: v.optional(v.string()), instructions: v.string(), enabled: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        if (!args.platform.trim() || !args.trigger.trim() || !args.instructions.trim()) throw new Error("Platform, trigger and instructions are required");
        const id = await ctx.db.insert("autoReplyRules", {
            userId,
            platform: args.platform.trim(),
            trigger: args.trigger.trim(),
            tone: args.tone?.trim() || "Professional",
            instructions: args.instructions.trim(),
            enabled: args.enabled ?? true,
        });
        return shape((await ctx.db.get(id))!);
    },
});

export const toggle = mutation({
    args: { id: v.id("autoReplyRules"), enabled: v.boolean() },
    handler: async (ctx, { id, enabled }) => {
        const userId = await requireUserId(ctx);
        const r = await ctx.db.get(id);
        if (!r || r.userId !== userId) throw new Error("Rule not found");
        await ctx.db.patch(id, { enabled });
        return shape((await ctx.db.get(id))!);
    },
});
