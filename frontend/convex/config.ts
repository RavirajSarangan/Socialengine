import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/guards";

/** Internal: read a config value (e.g. an API key) by name. */
export const get = internalQuery({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const row = await ctx.db.query("appConfig").withIndex("by_name", (q) => q.eq("name", name)).unique();
        return row?.value ?? null;
    },
});

/** Admin: set/replace an API key (stored in the DB instead of Convex env). */
export const set = mutation({
    args: { token: v.optional(v.string()), name: v.string(), value: v.string() },
    handler: async (ctx, { token, name, value }) => {
        await requireAdmin(ctx, token);
        const row = await ctx.db.query("appConfig").withIndex("by_name", (q) => q.eq("name", name)).unique();
        if (row) await ctx.db.patch(row._id, { value });
        else await ctx.db.insert("appConfig", { name, value });
        return { ok: true };
    },
});

/** One-time bootstrap: set a key only while no config exists yet (self-disables afterward). */
export const seed = mutation({
    args: { name: v.string(), value: v.string() },
    handler: async (ctx, { name, value }) => {
        const existing = await ctx.db.query("appConfig").take(1);
        if (existing.length) throw new Error("Config already initialized — use admin set");
        await ctx.db.insert("appConfig", { name, value });
        return { ok: true };
    },
});

/** Admin: which integration keys are configured (names + whether set), never the values. */
export const status = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        await requireAdmin(ctx, token);
        const rows = await ctx.db.query("appConfig").collect();
        const set = new Set(rows.filter((r) => r.value.trim()).map((r) => r.name));
        return {
            openai: set.has("OPENAI_API_KEY"),
            elevenlabs: set.has("ELEVENLABS_API_KEY"),
            ayrshare: set.has("AYRSHARE_API_KEY"),
        };
    },
});
