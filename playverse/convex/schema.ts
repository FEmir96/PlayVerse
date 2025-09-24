// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("free"), v.literal("premium"), v.literal("admin")),
    createdAt: v.number(),

    // Login con contraseña (opcional)
    passwordHash: v.optional(v.string()),

    // Para OAuth (Google/Microsoft) — opcional
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]), // ✅ ya lo usás con .unique()

  games: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
    // 👇 NUEVO: géneros normalizados para tus filtros
    genres: v.optional(v.array(v.string())),
  })
    .index("by_title", ["title"])
    // 🔎 útil para listados de “Nuevos juegos”
    .index("by_createdAt", ["createdAt"]),

  transactions: defineTable({
    userId: v.id("profiles"),
    gameId: v.id("games"),
    type: v.union(v.literal("rental"), v.literal("purchase")),
    expiresAt: v.optional(v.number()), // solo rentals
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    // 🔎 para getUserRentals / getUserPurchases sin filtrar en memoria
    .index("by_user_type", ["userId", "type"])
    // 🔎 para ver transacciones por juego (admin / analytics)
    .index("by_game", ["gameId"]),

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
  })
    .index("by_user", ["userId"])
    // 🔎 para listar/ordenar pagos del usuario por fecha
    .index("by_user_time", ["userId", "createdAt"]),

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
    entity: v.string(), // "profiles" | "games" | ...
    entityId: v.union(v.id("games"), v.id("profiles")),
    requesterId: v.id("profiles"),
    timestamp: v.number(),
    details: v.optional(v.any()),
  }).index("by_entity", ["entity", "entityId"]),

  // ⬇️ al final, antes del cierre de defineSchema({...})
  paymentMethods: defineTable({
    userId: v.id("profiles"),
    brand: v.union(
      v.literal("visa"),
      v.literal("mastercard"),
      v.literal("amex"),
      v.literal("otro")
    ),
    last4: v.string(), // solo guardamos últimos 4
    expMonth: v.number(), // 1..12
    expYear: v.number(), // ej. 2027
    panHash: v.optional(v.string()), // hash SHA-256 del PAN (opcional para dedupe)
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
