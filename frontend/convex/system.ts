import { query } from "./_generated/server";

export const health = query({
    args: {},
    handler: async (ctx) => {
        const rows = await ctx.db.query("appConfig").collect();
        const set = new Set(rows.filter((r) => r.value.trim()).map((r) => r.name));
        return {
            status: "ok",
            service: "convex",
            database: "connected",
            time: new Date().toISOString(),
            integrations: {
                openai: set.has("OPENAI_API_KEY"),
                elevenlabs: set.has("ELEVENLABS_API_KEY"),
                ayrshare: set.has("AYRSHARE_API_KEY"),
            },
        };
    },
});
