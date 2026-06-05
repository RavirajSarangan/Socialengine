import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const mediaItem = v.object({
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    type: v.string(), // image | video | audio
    posterUrl: v.optional(v.string()),
    size: v.optional(v.number()),
});

export default defineSchema({
    ...authTables,

    // Auth's users table is extended with our profile fields.
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        image: v.optional(v.string()),
        isAnonymous: v.optional(v.boolean()),
        plan: v.optional(v.string()),
        aiCredits: v.optional(v.number()),
        aiCreditsTotal: v.optional(v.number()),
        role: v.optional(v.string()), // user | admin
    }).index("email", ["email"]),

    socialAccounts: defineTable({
        userId: v.id("users"),
        platform: v.string(),
        handle: v.string(),
        status: v.string(), // connected | pending | error
        providerAccountId: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    posts: defineTable({
        userId: v.id("users"),
        content: v.string(),
        platforms: v.array(v.string()),
        media: v.optional(v.array(mediaItem)),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.string()),
        scheduledFor: v.number(), // epoch ms
        status: v.string(), // draft | scheduled | published | failed
        publishedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_status_scheduledFor", ["status", "scheduledFor"]),

    generations: defineTable({
        userId: v.id("users"),
        prompt: v.string(),
        content: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.string()),
        tone: v.optional(v.string()),
        type: v.string(), // text | image | voice
    }).index("by_user", ["userId"]),

    activities: defineTable({
        userId: v.id("users"),
        actionType: v.string(),
        description: v.string(),
        relatedPostId: v.optional(v.id("posts")),
        relatedPostContent: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    autoReplyRules: defineTable({
        userId: v.id("users"),
        platform: v.string(),
        trigger: v.string(),
        tone: v.string(),
        instructions: v.string(),
        enabled: v.boolean(),
    }).index("by_user", ["userId"]),

    mediaAssets: defineTable({
        userId: v.id("users"),
        storageId: v.optional(v.id("_storage")),
        url: v.optional(v.string()),
        type: v.string(),
        posterUrl: v.optional(v.string()),
        name: v.optional(v.string()),
        size: v.optional(v.number()),
        source: v.string(), // upload | ai
    }).index("by_user", ["userId"]),
});
