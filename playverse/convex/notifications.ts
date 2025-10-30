// convex/notifications.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/* ─────────────────────────────────────────────
   Tipos y validadores compartidos
   ───────────────────────────────────────────── */
const NotificationTypeV = v.union(
  v.literal("rental"),
  v.literal("new-game"),
  v.literal("discount"),
  v.literal("achievement"),
  v.literal("purchase"),
  v.literal("game-update"),
  // ⬇️ añadimos tipos de plan para que notificaciones de suscripción funcionen
  v.literal("plan-expired"),
  v.literal("plan-renewed")
);
export type NotificationType =
  | "rental"
  | "new-game"
  | "discount"
  | "achievement"
  | "purchase"
  | "game-update"
  | "plan-expired"
  | "plan-renewed";

/* ─────────────────────────────────────────────
   Helpers internos (índices y límites)
   ───────────────────────────────────────────── */
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Inserta una notificación evitando duplicados del mismo tipo
 * en una ventana temporal (por defecto 10 min).
 * Exportada para poder usarse desde otras mutaciones (import directo).
 */
async function schedulePushNotification(
  scheduler: any,
  payload: {
    userId: Id<"profiles">;
    notificationId: Id<"notifications">;
    title: string;
    message: string;
    type: NotificationType;
    meta?: unknown;
  }
) {
  if (!scheduler) return;
  try {
    await scheduler.runAfter(0, api.actions.push.send, {
      userId: payload.userId,
      notificationId: payload.notificationId,
      title: payload.title,
      message: payload.message,
      data:
        payload.meta && typeof payload.meta === "object"
          ? { type: payload.type, meta: payload.meta }
          : { type: payload.type },
    });
  } catch (error) {
    console.error("schedulePushNotification error", error);
  }
}

export async function notifyOnceServer(
  ctx: { db: any; scheduler?: any },
  args: {
    userId: Id<"profiles">;
    type: NotificationType;
    title: string;
    message: string;
    meta?: unknown;
    dedupeWindowMs?: number; // 10 minutos por defecto
  }
) {
  const { userId, type, title, message, meta, dedupeWindowMs = 10 * 60 * 1000 } = args;
  const since = Date.now() - dedupeWindowMs;

  let recent: any | null = null;
  try {
    recent = await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q: any) => q.eq("userId", userId).gte("createdAt", since))
      .filter((q: any) => q.eq(q.field("type"), type))
      .first();
  } catch {
    const scan = await ctx.db.query("notifications").collect();
    recent = scan
      .filter(
        (n: any) => String(n.userId) === String(userId) && n.createdAt >= since && n.type === type
      )
      .sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
  }

  if (recent) {
    return { ok: true as const, skipped: true as const, id: recent._id };
  }

  const id = await ctx.db.insert("notifications", {
    userId,
    type,
    title,
    message,
    gameId: undefined,
    transactionId: undefined,
    isRead: false,
    readAt: undefined,
    createdAt: Date.now(),
    meta,
  });

  await schedulePushNotification(ctx.scheduler, {
    userId,
    notificationId: id,
    title,
    message,
    type,
    meta,
  });

  return { ok: true as const, skipped: false as const, id };
}

/**
 * Usa el índice tipado `by_user_createdAt` (["userId","createdAt"]).
 * Si no existe ese índice, hace fallback a escaneo en memoria.
 */
async function getRowsForUser(db: any, userId: Id<"profiles">, limit: number) {
  try {
    return await db
      .query("notifications")
      .withIndex("by_user_createdAt", (q: any) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  } catch {
    const all = await db.query("notifications").collect();
    return all
      .filter((n: any) => String(n.userId) === String(userId))
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, limit);
  }
}

/** Intenta conteo de no leídas por índice y cae a escaneo si no existe. */
async function getUnreadForUser(db: any, userId: Id<"profiles">) {
  try {
    return await db
      .query("notifications")
      .withIndex("by_user_isRead", (q: any) => q.eq("userId", userId).eq("isRead", false))
      .collect();
  } catch {
    const all = await db.query("notifications").collect();
    return all.filter(
      (n: any) => String(n.userId) === String(userId) && n.isRead === false
    );
  }
}

/* ─────────────────────────────────────────────
   Queries
   ───────────────────────────────────────────── */

/** Trae notificaciones del usuario (desc por fecha) */
export const getForUser = query({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { userId, limit }) => {
    const take = clamp(limit ?? 50, 1, 200);
    const rows = await getRowsForUser(db, userId, take);
    return rows;
  },
});

/** Contador de no leídas */
export const getUnreadCount = query({
  args: { userId: v.id("profiles") },
  handler: async ({ db }, { userId }) => {
    const unread = await getUnreadForUser(db, userId);
    return unread.length;
  },
});

/* ─────────────────────────────────────────────
   Mutations
   ───────────────────────────────────────────── */

/** Crear una notificación (uso interno desde tus mutaciones core) */
export const add = mutation({
  args: {
    userId: v.id("profiles"),
    type: NotificationTypeV,
    title: v.string(),
    message: v.string(),
    gameId: v.optional(v.id("games")),
    transactionId: v.optional(v.id("transactions")),
    meta: v.optional(v.any()),
  },
  handler: async ({ db, scheduler }, a) => {
    const now = Date.now();
    const id = await db.insert("notifications", {
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
    await schedulePushNotification(scheduler, {
      userId: a.userId,
      notificationId: id,
      title: a.title,
      message: a.message,
      type: a.type,
      meta: a.meta,
    });
    return { ok: true as const, id };
  },
});

// Alias por compatibilidad
export { add as create };

/** Igual que add pero con deduplicación por ventana temporal. */
export const addOnce = mutation({
  args: {
    userId: v.id("profiles"),
    type: NotificationTypeV,
    title: v.string(),
    message: v.string(),
    meta: v.optional(v.any()),
    dedupeWindowMs: v.optional(v.number()),
  },
  handler: async (ctx, a) => {
    const res = await notifyOnceServer(ctx, a);
    return res;
  },
});

/** Marcar una notificación como leída (solo dueño) */
export const markAsRead = mutation({
  args: {
    userId: v.id("profiles"),
    notificationId: v.id("notifications"),
  },
  handler: async ({ db }, { userId, notificationId }) => {
    const n = await db.get(notificationId);
    if (!n) return { ok: false as const, reason: "not_found" as const };
    if (String(n.userId) !== String(userId)) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    if (!n.isRead) {
      await db.patch(notificationId, { isRead: true, readAt: Date.now() });
      return { ok: true as const, updated: true };
    }
    return { ok: true as const, updated: false };
  },
});

/** Marcar todas como leídas del usuario */
export const markAllAsRead = mutation({
  args: { userId: v.id("profiles") },
  handler: async ({ db }, { userId }) => {
    const unread = await getUnreadForUser(db, userId);
    let count = 0;
    for (const n of unread) {
      await db.patch(n._id, { isRead: true, readAt: Date.now() });
      count++;
    }
    return { ok: true as const, count };
  },
});

/** Limpiar todas las notificaciones del usuario */
export const clearAllForUser = mutation({
  args: { userId: v.id("profiles") },
  handler: async ({ db }, { userId }) => {
    // Intentamos con índice por fecha; si no existe, escaneo:
    let all: any[] = [];
    try {
      all = await db
        .query("notifications")
        .withIndex("by_user_createdAt", (q: any) => q.eq("userId", userId))
        .collect();
    } catch {
      const scan = await db.query("notifications").collect();
      all = scan.filter((n: any) => String(n.userId) === String(userId));
    }

    for (const n of all) {
      await db.delete(n._id);
    }
    return { ok: true as const, deleted: all.length };
  },
});

/** Eliminar una notificación puntual del usuario */
export const deleteById = mutation({
  args: { userId: v.id("profiles"), notificationId: v.id("notifications") },
  handler: async ({ db }, { userId, notificationId }) => {
    const n = await db.get(notificationId);
    if (!n) return { ok: false as const, reason: "not_found" as const };
    if (String(n.userId) !== String(userId)) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    await db.delete(notificationId);
    return { ok: true as const, deleted: true };
  },
});

/** Broadcast simple a todos o por rol (opcional para comunicaciones globales) */
export const broadcast = mutation({
  args: {
    type: NotificationTypeV,
    title: v.string(),
    message: v.string(),
    role: v.optional(v.union(v.literal("free"), v.literal("premium"), v.literal("admin"))),
    gameId: v.optional(v.id("games")),
    meta: v.optional(v.any()),
    excludeUserId: v.optional(v.id("profiles")),
  },
  handler: async ({ db }, { type, title, message, role, gameId, meta, excludeUserId }) => {
    const now = Date.now();
    const profiles = await db.query("profiles").collect();

    const targets = (role ? profiles.filter((p) => p.role === role) : profiles).filter((p) =>
      excludeUserId ? String(p._id) !== String(excludeUserId) : true
    );

    for (const p of targets) {
      await db.insert("notifications", {
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
      });
    }

    return { ok: true as const, count: targets.length };
  },
});
