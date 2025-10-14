// convex/mutations/cart.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

/** Agregar al carrito (idempotente). */
export const add = mutation({
  args: { userId: v.id("profiles"), gameId: v.id("games") },
  handler: async (ctx, { userId, gameId }) => {
    const exists = await ctx.db
      .query("cartItems")
      .withIndex("by_user_game", (q) => q.eq("userId", userId).eq("gameId", gameId))
      .first();
    if (exists) return { status: "exists" as const };

    await ctx.db.insert("cartItems", { userId, gameId, createdAt: Date.now() });
    return { status: "added" as const };
  },
});

/** Quitar del carrito. */
export const remove = mutation({
  args: { userId: v.id("profiles"), gameId: v.id("games") },
  handler: async (ctx, { userId, gameId }) => {
    const row = await ctx.db
      .query("cartItems")
      .withIndex("by_user_game", (q) => q.eq("userId", userId).eq("gameId", gameId))
      .first();
    if (!row) return { status: "not_found" as const };
    await ctx.db.delete(row._id);
    return { status: "removed" as const };
  },
});

/** Vaciar carrito completo del usuario. */
export const clear = mutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
    return { status: "cleared" as const, count: rows.length };
  },
});

/** 🔁 Toggle: si está lo quita, si no está lo agrega. */
export const toggle = mutation({
  args: { userId: v.id("profiles"), gameId: v.id("games") },
  handler: async (ctx, { userId, gameId }) => {
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user_game", (q) => q.eq("userId", userId).eq("gameId", gameId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { status: "removed" as const };
    }

    await ctx.db.insert("cartItems", { userId, gameId, createdAt: Date.now() });
    return { status: "added" as const };
  },
});
