import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/** Resolves the signed-in user from a session token (custom auth, no env vars needed). */
export async function requireUser(ctx: QueryCtx | MutationCtx, token: string | undefined): Promise<Id<"users">> {
    if (!token) throw new Error("Not authenticated");
    const session = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Session expired — please sign in again");
    return session.userId;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx, token: string | undefined): Promise<Id<"users">> {
    const userId = await requireUser(ctx, token);
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Forbidden: admin only");
    return userId;
}

export function iso(ms: number | undefined): string | undefined {
    return ms === undefined ? undefined : new Date(ms).toISOString();
}
