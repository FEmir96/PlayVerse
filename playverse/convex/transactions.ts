// convex/transactions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  buildPurchaseEmail,
  buildRentalEmail,
  buildExtendEmail,
} from "./lib/emailTemplates";

const APP_URL = process.env.APP_URL || "https://playverse.com";
const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Inicia alquiler (o extiende si ya hay uno activo) */
export const startRental = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    weeks: v.number(),
    weeklyPrice: v.optional(v.number()),
  },
  handler: async ({ db, scheduler }, { userId, gameId, weeks, weeklyPrice }) => {
    const now = Date.now();

    // ¿Hay un alquiler (transaction type="rental") de este juego para este usuario?
    const existingTx = await db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "rental"))
      .filter((q) => q.eq(q.field("gameId"), gameId))
      .first();

    let expiresAt: number;

    if (existingTx && typeof existingTx.expiresAt === "number" && existingTx.expiresAt > now) {
      // ✅ Ya hay un alquiler ACTIVO → EXTENDER
      expiresAt = existingTx.expiresAt + weeks * MS_WEEK;
      await db.patch(existingTx._id, { expiresAt });

      // Pago (opcional)
      if (weeklyPrice) {
        await db.insert("payments", {
          userId,
          amount: weeklyPrice * weeks,
          currency: "USD",
          status: "completed",
          provider: "manual",
          createdAt: now,
        });
      }

      // Email de extensión
      const user = await db.get(userId);
      const game = await db.get(gameId);
      if (user?.email) {
        const coverUrl = (game as any)?.cover_url ?? null;
        const amount = (weeklyPrice || 0) * weeks;

        await scheduler.runAfter(
          0,
          (api as any).actions.email.sendReceiptEmail,
          {
            to: user.email,
            subject: `PlayVerse – Extensión de alquiler: ${game?.title ?? "Juego"}`,
            html: buildExtendEmail({
              userName: user.name ?? "",
              gameTitle: game?.title ?? "",
              coverUrl,
              amount,
              currency: "USD",
              method: "Tarjeta guardada",
              orderId: null,
              appUrl: APP_URL,
              weeks,
              expiresAt,
            }),
            replyTo: user.email,
          }
        );
      }

      return { ok: true as const, expiresAt };
    }

    // 🆕 No había alquiler activo (o no existía) → CREAR
    expiresAt = now + weeks * MS_WEEK;

    await db.insert("transactions", {
      userId,
      gameId,
      type: "rental",
      createdAt: now,
      expiresAt,
    });

    if (weeklyPrice) {
      await db.insert("payments", {
        userId,
        amount: weeklyPrice * weeks,
        currency: "USD",
        status: "completed",
        provider: "manual",
        createdAt: now,
      });
    }

    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;
      const amount = (weeklyPrice || 0) * weeks;

      await scheduler.runAfter(
        0,
        (api as any).actions.email.sendReceiptEmail,
        {
          to: user.email,
          subject: `PlayVerse – Alquiler confirmado: ${game?.title ?? "Juego"}`,
          html: buildRentalEmail({
            userName: user.name ?? "",
            gameTitle: game?.title ?? "",
            coverUrl,
            amount,
            currency: "USD",
            method: "Tarjeta guardada",
            orderId: null,
            appUrl: APP_URL,
            weeks,
            expiresAt,
          }),
          replyTo: user.email,
        }
      );
    }

    return { ok: true as const, expiresAt };
  },
});

/** Extiende un alquiler existente (o crea uno si no existía) */
export const extendRental = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    weeks: v.number(),
    weeklyPrice: v.optional(v.number()),
  },
  handler: async ({ db, scheduler }, { userId, gameId, weeks, weeklyPrice }) => {
    const now = Date.now();

    // alquiler actual del usuario para ese juego
    const tx = await db
      .query("transactions")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", userId).eq("type", "rental")
      )
      .filter((q) => q.eq(q.field("gameId"), gameId))
      .first();

    const base = tx?.expiresAt && tx.expiresAt > now ? tx.expiresAt : now;
    const newExpiresAt = base + weeks * MS_WEEK;

    if (tx) {
      await db.patch(tx._id, { expiresAt: newExpiresAt });
    } else {
      await db.insert("transactions", {
        userId,
        gameId,
        type: "rental",
        createdAt: now,
        expiresAt: newExpiresAt,
      });
    }

    if (weeklyPrice) {
      await db.insert("payments", {
        userId,
        amount: weeklyPrice * weeks,
        currency: "USD",
        status: "completed",
        provider: "manual",
        createdAt: now,
      });
    }

    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;
      const amount = (weeklyPrice || 0) * weeks;

      await scheduler.runAfter(
        0,
        (api as any).actions.email.sendReceiptEmail,
        {
          to: user.email,
          subject: `PlayVerse – Extensión de alquiler: ${game?.title ?? "Juego"}`,
          html: buildExtendEmail({
            userName: user.name ?? "",
            gameTitle: game?.title ?? "",
            coverUrl,
            amount,
            currency: "USD",
            method: "Tarjeta guardada",
            orderId: null,
            appUrl: APP_URL,
            weeks,
            expiresAt: newExpiresAt,
          }),
          replyTo: user.email,
        }
      );
    }

    return { ok: true as const, expiresAt: newExpiresAt };
  },
});

/** Compra del juego (sin cambios) */
export const purchaseGame = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    amount: v.number(),
  },
  handler: async ({ db, scheduler }, { userId, gameId, amount }) => {
    const now = Date.now();

    // 🔒 Bloqueo: si ya fue comprado antes, no permitir duplicado
    const existingPurchase = await db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "purchase"))
      .filter((q) => q.eq(q.field("gameId"), gameId))
      .first();

    if (existingPurchase) {
      // el front captura "ALREADY_OWNED" y muestra un toast
      throw new Error("ALREADY_OWNED");
    }

    await db.insert("transactions", {
      userId,
      gameId,
      type: "purchase",
      createdAt: now,
    });

    await db.insert("payments", {
      userId,
      amount,
      currency: "USD",
      status: "completed",
      provider: "manual",
      createdAt: now,
    });

    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;

      await scheduler.runAfter(
        0,
        (api as any).actions.email.sendReceiptEmail,
        {
          to: user.email,
          subject: `PlayVerse – Compra confirmada: ${game?.title ?? "Juego"}`,
          html: buildPurchaseEmail({
            userName: user.name ?? "",
            gameTitle: game?.title ?? "",
            coverUrl,
            amount,
            currency: "USD",
            method: "AMEX •••• 4542", // si tenés brand/last4 reales, ponelos acá
            orderId: null,
            appUrl: APP_URL,
          }),
          replyTo: user.email,
        }
      );
    }

    return { ok: true as const };
  },
});
