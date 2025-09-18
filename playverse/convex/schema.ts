// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("admin")
    ),
    createdAt: v.number(),
    // 👇 Nuevo campo para login seguro (opcional para no romper datos existentes)
    passwordHash: v.optional(v.string()),
  }).index("by_email", ["email"]),

  games: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
  }).index("by_title", ["title"]),

  transactions: defineTable({
    userId: v.id("profiles"),
    gameId: v.id("games"),
    type: v.union(v.literal("rental"), v.literal("purchase")),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  payments: defineTable({
    userId: v.id("profiles"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    provider: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  upgrades: defineTable({
    userId: v.id("profiles"),
    fromRole: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("admin")
    ),
    toRole: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("admin")
    ),
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
  }),
});
