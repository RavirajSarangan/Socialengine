import { query } from "./_generated/server";
import { requireUserId, iso } from "./lib/guards";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireUserId(ctx);
        const rows = await ctx.db.query("generations").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").take(50);
        return Promise.all(rows.map(async (g) => ({
            _id: g._id,
            user: g.userId,
            prompt: g.prompt,
            content: g.content ?? "",
            mediaUrl: g.storageId ? (await ctx.storage.getUrl(g.storageId)) ?? undefined : g.mediaUrl,
            mediaType: g.mediaType,
            tone: g.tone,
            type: g.type,
            createdAt: iso(g._creationTime),
            updatedAt: iso(g._creationTime),
        })));
    },
});
