import { query, mutation, action, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireUser, iso } from "./lib/guards";

function shape(a: Doc<"socialAccounts">) {
    return {
        _id: a._id,
        user: a.userId,
        handle: a.handle,
        platform: a.platform,
        status: a.status,
        providerAccountId: a.providerAccountId,
        createdAt: iso(a._creationTime),
        updatedAt: iso(a._creationTime),
    };
}

export const list = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        const userId = await requireUser(ctx, token);
        const rows = await ctx.db.query("socialAccounts").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
        return rows.map(shape);
    },
});

export const connect = mutation({
    args: { token: v.optional(v.string()), platform: v.string(), handle: v.string() },
    handler: async (ctx, args) => {
        const userId = await requireUser(ctx, args.token);
        if (!args.platform.trim()) throw new Error("Platform is required");
        if (!args.handle.trim()) throw new Error("Handle is required");
        const handle = args.handle.trim().replace(/^@/, "");
        const id = await ctx.db.insert("socialAccounts", { userId, platform: args.platform.trim(), handle, status: "connected", providerAccountId: "local-" + Date.now() });
        await ctx.db.insert("activities", { userId, actionType: "ACCOUNT_CONNECTED", description: `Connected ${args.platform} account @${handle}` });
        return shape((await ctx.db.get(id))!);
    },
});

export const disconnect = mutation({
    args: { token: v.optional(v.string()), id: v.id("socialAccounts") },
    handler: async (ctx, { token, id }) => {
        const userId = await requireUser(ctx, token);
        const a = await ctx.db.get(id);
        if (!a || a.userId !== userId) throw new Error("Account not found");
        await ctx.db.delete(id);
        await ctx.db.insert("activities", { userId, actionType: "ACCOUNT_DISCONNECTED", description: `Disconnected ${a.platform} account @${a.handle}` });
    },
});

export const _forUser = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => ctx.db.query("socialAccounts").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
});

export const _setStatus = internalMutation({
    args: { id: v.id("socialAccounts"), status: v.string() },
    handler: async (ctx, { id, status }) => { await ctx.db.patch(id, { status }); },
});

export const verify = action({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }): Promise<{ verified: boolean }> => {
        const userId = await ctx.runQuery(internal.customAuth.userIdFromToken, { token });
        const key = await ctx.runQuery(internal.config.get, { name: "AYRSHARE_API_KEY" });
        const accounts = await ctx.runQuery(internal.accounts._forUser, { userId });
        if (!key) return { verified: false };
        let connected: string[] = [];
        try {
            const res = await fetch("https://api.ayrshare.com/api/user", { headers: { Authorization: `Bearer ${key}` } });
            const data = await res.json();
            connected = (data.activeSocialAccounts ?? []).map((s: string) => s.toLowerCase());
        } catch {
            // leave empty on error
        }
        for (const a of accounts) {
            await ctx.runMutation(internal.accounts._setStatus, { id: a._id, status: connected.includes(a.platform.toLowerCase()) ? "connected" : "pending" });
        }
        return { verified: true };
    },
});
