// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    email: v.string(),
    role: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(), // timestamp
  }).index("by_email", ["email"]),

  games: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_title", ["title"]),

  transactions: defineTable({
    userId: v.id("profiles"),
    gameId: v.id("games"),
    type: v.union(v.literal("rental"), v.literal("purchase")),
    expiresAt: v.optional(v.number()), // timestamp solo para alquileres
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
