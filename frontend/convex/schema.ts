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
    // Keep the legacy Convex Auth tables so any pre-existing rows still validate.
    ...authTables,

    // Override users with our shape. All fields optional so legacy auth rows validate too.
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        passwordHash: v.optional(v.string()),
        plan: v.optional(v.string()),
        aiCredits: v.optional(v.number()),
        aiCreditsTotal: v.optional(v.number()),
        role: v.optional(v.string()), // user | admin
        // legacy @convex-dev/auth fields (tolerated on old docs)
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        image: v.optional(v.string()),
        isAnonymous: v.optional(v.boolean()),
    }).index("by_email", ["email"]),

    sessions: defineTable({
        token: v.string(),
        userId: v.id("users"),
        expiresAt: v.number(),
    }).index("by_token", ["token"]),

    appConfig: defineTable({
        name: v.string(),
        value: v.string(),
    }).index("by_name", ["name"]),

    socialAccounts: defineTable({
        userId: v.id("users"),
        platform: v.string(),
        handle: v.string(),
        status: v.string(),
        providerAccountId: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    posts: defineTable({
        userId: v.id("users"),
        content: v.string(),
        platforms: v.array(v.string()),
        media: v.optional(v.array(mediaItem)),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.string()),
        scheduledFor: v.number(),
        status: v.string(),
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
        type: v.string(),
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
        source: v.string(),
    }).index("by_user", ["userId"]),
});
