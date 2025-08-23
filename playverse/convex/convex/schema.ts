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
      v.literal("admin") // rol admin incluido
    ),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  games: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium")), // nivel mínimo requerido
    createdAt: v.number(),
  }).index("by_title", ["title"]),

  transactions: defineTable({
    userId: v.id("profiles"),
    gameId: v.id("games"),
    type: v.union(v.literal("rental"), v.literal("purchase")),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // pagos simulados
  payments: defineTable({
    userId: v.id("profiles"),
    amount: v.number(),
    currency: v.string(), // ej: "USD", "ARS"
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    provider: v.optional(v.string()), // ej: "DummyPay", "Stripe(sim)"
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // historial de upgrades/downgrades
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
    paymentId: v.optional(v.id("payments")), // si hubo pago asociado
  }).index("by_user", ["userId"]),

  // auditoría
    audits: defineTable({
  action: v.string(), // "update_game" | "delete_game" | "create_user"
  entity: v.string(), // "game" | "profile"
  entityId: v.union(v.id("games"), v.id("profiles")),
  requesterId: v.id("profiles"),
  timestamp: v.number(),
  details: v.optional(v.any()),
}),
});
