// convex/transactions.ts
import { mutation, query as txQuery } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  buildPurchaseEmail,
  buildRentalEmail,
  buildExtendEmail,
  buildCartEmail,
} from "./lib/emailTemplates";

const APP_URL = process.env.APP_URL || "https://playverse.com";

/** Inicia alquiler */
export const startRental = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    weeks: v.number(),
    weeklyPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async ({ db, scheduler }, { userId, gameId, weeks, weeklyPrice, currency }) => {
    const now = Date.now();
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    const cur = currency || "USD";

    const existingRental = await db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "rental"))
      .filter((q) => q.eq(q.field("gameId"), gameId))
      .first();

    if (existingRental && typeof existingRental.expiresAt === "number" && existingRental.expiresAt > now) {
      throw new Error("ALREADY_RENTED_ACTIVE");
    }

    const expiresAt = now + weeks * MS_WEEK;

    await db.insert("transactions", { userId, gameId, type: "rental", createdAt: now, expiresAt });

    if (weeklyPrice) {
      await db.insert("payments", {
        userId, amount: weeklyPrice * weeks, currency: cur, status: "completed", provider: "manual", createdAt: now,
      });
    }

    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;
      const amount = (weeklyPrice || 0) * weeks;

      await scheduler.runAfter(0, (api as any).actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Alquiler confirmado: ${game?.title ?? "Juego"}`,
        html: buildRentalEmail({
          userName: user.name ?? "",
          gameTitle: (game as any)?.title ?? "",
          coverUrl,
          amount,
          currency: cur,
          method: "Tarjeta guardada",
          orderId: null,
          appUrl: APP_URL,
          weeks,
          expiresAt,
        }),
        replyTo: user.email,
      });
    }

    return { ok: true as const, expiresAt };
  },
});

/** Extiende alquiler */
export const extendRental = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    weeks: v.number(),
    weeklyPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async ({ db, scheduler }, { userId, gameId, weeks, weeklyPrice, currency }) => {
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const cur = currency || "USD";

    const tx = await db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "rental"))
      .filter((q) => q.eq(q.field("gameId"), gameId))
      .first();

    const base = tx?.expiresAt && tx.expiresAt > now ? tx.expiresAt : now;
    const newExpiresAt = base + weeks * MS_WEEK;

    if (tx) {
      await db.patch(tx._id, { expiresAt: newExpiresAt });
    } else {
      await db.insert("transactions", { userId, gameId, type: "rental", createdAt: now, expiresAt: newExpiresAt });
    }

    if (weeklyPrice) {
      await db.insert("payments", {
        userId, amount: weeklyPrice * weeks, currency: cur, status: "completed", provider: "manual", createdAt: now,
      });
    }

    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;
      const amount = (weeklyPrice || 0) * weeks;

      await scheduler.runAfter(0, (api as any).actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Extensión de alquiler: ${game?.title ?? "Juego"}`,
        html: buildExtendEmail({
          userName: user.name ?? "",
          gameTitle: (game as any)?.title ?? "",
          coverUrl,
          amount,
          currency: cur,
          method: "Tarjeta guardada",
          orderId: null,
          appUrl: APP_URL,
          weeks,
          expiresAt: newExpiresAt,
        }),
        replyTo: user.email,
      });
    }

    return { ok: true as const, expiresAt: newExpiresAt };
  },
});

/** Compra simple */
export const purchaseGame = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    amount: v.number(),
    currency: v.optional(v.string()),
  },
  handler: async ({ db, scheduler }, { userId, gameId, amount, currency }) => {
    const now = Date.now();
    const cur = currency || "USD";

    const existingPurchase = await db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "purchase"))
      .filter((q) => q.eq(q.field("gameId"), gameId))
      .first();

    if (existingPurchase) throw new Error("ALREADY_OWNED");

    await db.insert("transactions", { userId, gameId, type: "purchase", createdAt: now });
    await db.insert("payments", {
      userId, amount, currency: cur, status: "completed", provider: "manual", createdAt: now,
    });

    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;
      await scheduler.runAfter(0, (api as any).actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Compra confirmada: ${game?.title ?? "Juego"}`,
        html: buildPurchaseEmail({
          userName: user.name ?? "",
          gameTitle: (game as any)?.title ?? "",
          coverUrl,
          amount,
          currency: cur,
          method: "AMEX •••• 4542",
          orderId: null,
          appUrl: APP_URL,
        }),
        replyTo: user.email,
      });
    }

    return { ok: true as const };
  },
});

/** ✅ NUEVO: Compra de carrito (varios juegos) */
export const purchaseCart = mutation({
  args: {
    userId: v.id("profiles"),
    gameIds: v.array(v.id("games")),   // solo ids; el precio se toma del server (anti-tamper)
    currency: v.optional(v.string()),
  },
  handler: async ({ db, scheduler }, { userId, gameIds, currency }) => {
    const cur = currency || "USD";
    const now = Date.now();

    // Unicos
    const ids = Array.from(new Set(gameIds.map((g) => g as Id<"games">)));

    // Filtrar los ya comprados
    const already = await db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "purchase"))
      .collect();

    const alreadyIds = new Set(already.map((t) => String(t.gameId)));
    const toBuyIds = ids.filter((id) => !alreadyIds.has(String(id)));

    if (toBuyIds.length === 0) {
      return { ok: true as const, purchased: 0, skipped: ids.length, total: 0 };
    }

    // Traer juegos y armar líneas con precio actual
    const games = await Promise.all(toBuyIds.map((id) => db.get(id)));
    const lines = games
      .filter(Boolean)
      .map((g: any) => ({
        id: g._id as Id<"games">,
        title: g.title ?? "Juego",
        cover: g.cover_url ?? null,
        price: typeof g.price_buy === "number" ? g.price_buy : 49.99,
      }));

    const total = lines.reduce((a, l) => a + (l.price || 0), 0);

    // Transacciones y pago único
    for (const line of lines) {
      await db.insert("transactions", {
        userId, gameId: line.id, type: "purchase", createdAt: now,
      });
    }
    await db.insert("payments", {
      userId, amount: total, currency: cur, status: "completed", provider: "manual", createdAt: now,
    });

    // Email de carrito
    const user = await db.get(userId);
    if (user?.email) {
      await scheduler.runAfter(0, (api as any).actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Compra confirmada (${lines.length} ítems)`,
        html: buildCartEmail({
          userName: user.name ?? "",
          items: lines.map((l) => ({ title: l.title, coverUrl: l.cover, amount: l.price })),
          currency: cur,
          method: "Tarjeta guardada",
          appUrl: APP_URL,
        }),
        replyTo: user.email,
      });
    }

    return { ok: true as const, purchased: lines.length, skipped: ids.length - lines.length, total };
  },
});

/** Lista alquileres por vencimiento (existente) */
export const listRentalsExpiring = txQuery({
  args: { now: v.number(), upTo: v.number() },
  handler: async (ctx, { now, upTo }) => {
    const all = await ctx.db.query("transactions").collect();
    return all
      .filter((t) => t.type === "rental")
      .filter((t) => typeof t.expiresAt === "number" && (t.expiresAt as number) >= now && (t.expiresAt as number) <= upTo)
      .map((t) => ({
        _id: t._id as Id<"transactions">,
        userId: t.userId as Id<"profiles">,
        gameId: t.gameId as Id<"games">,
        expiresAt: t.expiresAt as number,
      }));
  },
});
