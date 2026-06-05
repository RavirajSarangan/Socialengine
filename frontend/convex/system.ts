import { query } from "./_generated/server";

export const health = query({
    args: {},
    handler: async () => ({
        status: "ok",
        service: "convex",
        database: "connected",
        time: new Date().toISOString(),
        integrations: {
            openai: !!process.env.OPENAI_API_KEY,
            elevenlabs: !!process.env.ELEVENLABS_API_KEY,
            ayrshare: !!process.env.AYRSHARE_API_KEY,
        },
    }),
});
