// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("free"), v.literal("premium"), v.literal("admin")),
    createdAt: v.number(),
    passwordHash: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  games: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
    genres: v.optional(v.array(v.string())),

    // precios (opcionales)
    weeklyPrice: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),

    // IGDB / rating / popscore (opcionales)
    igdbId: v.optional(v.number()),
    igdbSlug: v.optional(v.string()),
    igdbRating: v.optional(v.number()),        // 0..100
    igdbUserRating: v.optional(v.number()),    // 0..100
    igdbCriticRating: v.optional(v.number()),  // 0..100
    igdbRatingCount: v.optional(v.number()),
    igdbHypes: v.optional(v.number()),
    popscore: v.optional(v.number()),
    lastIgdbSyncAt: v.optional(v.number()),

    // Metadatos extra IGDB
    firstReleaseDate: v.optional(v.number()),  // ms epoch
    developers: v.optional(v.array(v.string())),
    publishers: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())), // nombres (English, Spanish, etc.)

    // Age rating (preformateado + crudo)
    ageRatingSystem: v.optional(v.string()),    // ESRB | PEGI | CERO | ...
    ageRatingCode: v.optional(v.string()),      // "T", "M", "E10+", "18", etc.
    ageRatingLabel: v.optional(v.string()),     // Teen, Mature, etc.

    // >>> NUEVO: soporte juegos embebidos
    embed_url: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    embed_allow: v.optional(v.string()),
    embedAllow: v.optional(v.string()),
    embed_sandbox: v.optional(v.string()),
    embedSandbox: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_title", ["title"])
    .index("by_createdAt", ["createdAt"])
    .index("by_popscore", ["popscore"]),

  transactions: defineTable({
    userId: v.id("profiles"),
    gameId: v.id("games"),
    type: v.union(v.literal("rental"), v.literal("purchase")),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_game", ["gameId"]),

  payments: defineTable({
    userId: v.id("profiles"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    provider: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_time", ["userId", "createdAt"]),

  upgrades: defineTable({
    userId: v.id("profiles"),
    fromRole: v.union(v.literal("free"), v.literal("premium"), v.literal("admin")),
    toRole: v.union(v.literal("free"), v.literal("premium"), v.literal("admin")),
    effectiveAt: v.number(),
    paymentId: v.optional(v.id("payments")),
  }).index("by_user", ["userId"]),

  audits: defineTable({
    action: v.string(),
    entity: v.string(),
    entityId: v.union(v.id("games"), v.id("profiles")),
    requesterId: v.id("profiles"),
    timestamp: v.number(),
    details: v.optional(v.any()),
  }).index("by_entity", ["entity", "entityId"]),

  paymentMethods: defineTable({
    userId: v.id("profiles"),
    brand: v.union(v.literal("visa"), v.literal("mastercard"), v.literal("amex"), v.literal("otro")),
    last4: v.string(),
    expMonth: v.number(),
    expYear: v.number(),
    panHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  favorites: defineTable({
    userId: v.id("profiles"),
    gameId: v.id("games"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_game", ["userId", "gameId"]),

  upcomingGames: defineTable({
    title: v.string(),
    genre: v.optional(v.string()),
    releaseAt: v.number(),
    priority: v.optional(v.number()),
    cover_url: v.optional(v.string()),
    gameId: v.optional(v.id("games")),
    createdAt: v.number(),
  })
    .index("by_releaseAt", ["releaseAt"])
    .index("by_title", ["title"])
    .index("by_priority", ["priority"]),
});
