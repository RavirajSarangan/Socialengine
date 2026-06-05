import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Forbidden: admin only");
    return userId;
}

export function iso(ms: number | undefined): string | undefined {
    return ms === undefined ? undefined : new Date(ms).toISOString();
}
