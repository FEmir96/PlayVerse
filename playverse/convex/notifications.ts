// convex/notifications.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/** Trae notificaciones del usuario (desc por fecha) */
export const getForUser = query({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit }) => {
    const take = limit ?? 50;
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
      .take(take);
    return rows;
  },
});

/** Contador de no leídas */
export const getUnreadCount = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_isRead", (q) => q.eq("userId", userId).eq("isRead", false))
      .take(1000);
    return rows.length;
  },
});

/** Crear una notificación */
export const add = mutation({
  args: {
    userId: v.id("profiles"),
    type: v.union(
      v.literal("rental"),
      v.literal("new-game"),
      v.literal("discount"),
      v.literal("achievement"),
      v.literal("purchase"),
      v.literal("game-update"),
      v.literal("media-added")
    ),
    title: v.string(),
    message: v.string(),
    gameId: v.optional(v.id("games")),
    transactionId: v.optional(v.id("transactions")),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, a) => {
    const now = Date.now();
    const id = await ctx.db.insert("notifications", {
      userId: a.userId,
      type: a.type,
      title: a.title,
      message: a.message,
      gameId: a.gameId,
      transactionId: a.transactionId,
      isRead: false,
      readAt: undefined,
      createdAt: now,
      meta: a.meta,
    });
    return id;
  },
});

// Alias de compatibilidad
export { add as create };

/** Marcar una notificación como leída (solo dueño) */
export const markAsRead = mutation({
  args: {
    userId: v.id("profiles"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, { userId, notificationId }) => {
    const n = await ctx.db.get(notificationId);
    if (!n) return;
    if (n.userId !== userId) return;
    if (!n.isRead) {
      await ctx.db.patch(notificationId, { isRead: true, readAt: Date.now() });
    }
  },
});

/** Marcar todas como leídas del usuario */
export const markAllAsRead = mutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_isRead", (q) => q.eq("userId", userId).eq("isRead", false))
      .take(1000);
    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { isRead: true, readAt: Date.now() }))
    );
    return unread.length;
  },
});

/** Eliminar una notificación por id (solo dueño) */
export const deleteById = mutation({
  args: {
    userId: v.id("profiles"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, { userId, notificationId }) => {
    const n = await ctx.db.get(notificationId);
    if (!n) return { ok: false as const, reason: "not_found" as const };
    if (n.userId !== userId) return { ok: false as const, reason: "forbidden" as const };
    await ctx.db.delete(notificationId);
    return { ok: true as const };
  },
});

/** Limpiar todas las notificaciones del usuario */
export const clearAllForUser = mutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, { userId }) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .order("desc")
      .take(1000);
    await Promise.all(all.map((n) => ctx.db.delete(n._id)));
    return { ok: true as const, deleted: all.length };
  },
});

/** Broadcast simple a todos o por rol */
export const broadcast = mutation({
  args: {
    type: v.union(
      v.literal("rental"),
      v.literal("new-game"),
      v.literal("discount"),
      v.literal("achievement"),
      v.literal("purchase"),
      v.literal("game-update"),
      v.literal("media-added")
    ),
    title: v.string(),
    message: v.string(),
    role: v.optional(v.union(v.literal("free"), v.literal("premium"), v.literal("admin"))),
    gameId: v.optional(v.id("games")),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, { type, title, message, role, gameId, meta }) => {
    const now = Date.now();
    const profiles = await ctx.db.query("profiles").collect();
    const targets = role ? profiles.filter((p) => p.role === role) : profiles;

    await Promise.all(
      targets.map((p) =>
        ctx.db.insert("notifications", {
          userId: p._id as Id<"profiles">,
          type,
          title,
          message,
          gameId,
          transactionId: undefined,
          isRead: false,
          readAt: undefined,
          createdAt: now,
          meta,
        })
      )
    );

    return { ok: true as const, count: targets.length };
  },
});
