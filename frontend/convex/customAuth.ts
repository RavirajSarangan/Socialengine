import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/guards";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PLAN_CREDITS: Record<string, { name: string; credits: number }> = {
    starter: { name: "Starter", credits: 5 },
    pro: { name: "Pro", credits: 200 },
    agency: { name: "Agency", credits: 1000 },
};

function bytesToHex(b: Uint8Array): string {
    return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(h: string): Uint8Array {
    const a = new Uint8Array(h.length / 2);
    for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16);
    return a;
}

/** PBKDF2(SHA-256) password hash, stored as "saltHex:hashHex". Uses Web Crypto (available in Convex). */
async function hashPassword(password: string, saltHex?: string): Promise<string> {
    const enc = new TextEncoder();
    const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
    const material = enc.encode(password) as unknown as BufferSource;
    const key = await crypto.subtle.importKey("raw", material, "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: 100000, hash: "SHA-256" }, key, 256);
    return `${bytesToHex(salt)}:${bytesToHex(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltHex] = stored.split(":");
    if (!saltHex) return false;
    return (await hashPassword(password, saltHex)) === stored;
}

function newToken(): string {
    return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

function shapeUser(u: { _id: string; name?: string; email?: string; plan?: string; aiCredits?: number; aiCreditsTotal?: number; role?: string }) {
    return { _id: u._id, name: u.name ?? "", email: u.email ?? "", plan: u.plan ?? "Starter", aiCredits: u.aiCredits ?? 0, aiCreditsTotal: u.aiCreditsTotal ?? 5, role: u.role ?? "user" };
}

export const signUp = mutation({
    args: { name: v.optional(v.string()), email: v.string(), password: v.string(), plan: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const email = args.email.trim().toLowerCase();
        if (!email || !args.password || args.password.length < 6) throw new Error("Email and a 6+ char password are required");
        const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
        if (existing) throw new Error("An account with this email already exists");

        const plan = PLAN_CREDITS[(args.plan ?? "starter").toLowerCase()] ?? PLAN_CREDITS.starter;
        const isFirstUser = (await ctx.db.query("users").take(1)).length === 0;
        const userId = await ctx.db.insert("users", {
            name: args.name?.trim() || email.split("@")[0],
            email,
            passwordHash: await hashPassword(args.password),
            plan: plan.name,
            aiCredits: plan.credits,
            aiCreditsTotal: plan.credits,
            role: isFirstUser ? "admin" : "user",
        });
        const token = newToken();
        await ctx.db.insert("sessions", { token, userId, expiresAt: Date.now() + SESSION_MS });
        return { token, user: shapeUser((await ctx.db.get(userId))!) };
    },
});

export const signIn = mutation({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.trim().toLowerCase();
        const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
        if (!user || !user.passwordHash || !(await verifyPassword(args.password, user.passwordHash))) throw new Error("Invalid email or password");
        const token = newToken();
        await ctx.db.insert("sessions", { token, userId: user._id, expiresAt: Date.now() + SESSION_MS });
        return { token, user: shapeUser(user) };
    },
});

export const signOut = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const session = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
        if (session) await ctx.db.delete(session._id);
    },
});

export const me = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => {
        if (!token) return null;
        const session = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
        if (!session || session.expiresAt < Date.now()) return null;
        const user = await ctx.db.get(session.userId);
        return user ? shapeUser(user) : null;
    },
});

/** One-time bootstrap: promote a user to admin while no admin exists yet (self-disables). */
export const claimAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const users = await ctx.db.query("users").collect();
        if (users.some((u) => u.role === "admin")) throw new Error("An admin already exists");
        const user = users.find((u) => (u.email ?? "").toLowerCase() === email.trim().toLowerCase());
        if (!user) throw new Error("User not found");
        await ctx.db.patch(user._id, { role: "admin" });
        return { ok: true };
    },
});

/** For actions: resolve a session token to a userId (actions have no ctx.db). */
export const userIdFromToken = internalQuery({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, { token }) => requireUser(ctx, token),
});
