import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
// import type { Id } from "./_generated/dataModel"; // si no lo usás, podés borrarlo

// ⬇️ Helpers del template de email (archivo: convex/actions/email.ts)
import {
  buildPurchaseEmail,
  buildRentalEmail,
  buildExtendEmail,
} from "./lib/emailTemplates";

// URL pública de tu app para el botón del mail
const APP_URL = process.env.APP_URL || "https://playverse.com";

/** Inicia alquiler */
export const startRental = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    weeks: v.number(),
    weeklyPrice: v.optional(v.number()),
  },
  handler: async ({ db, scheduler }, { userId, gameId, weeks, weeklyPrice }) => {
    const now = Date.now();
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = now + weeks * MS_WEEK;

    // transacción
    await db.insert("transactions", {
      userId,
      gameId,
      type: "rental",
      createdAt: now,
      expiresAt,
    });

    // pago (opcional)
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

    // email
    const user = await db.get(userId);
    const game = await db.get(gameId);

    if (user?.email) {
      const coverUrl = (game as any)?.cover_url ?? null;
      const amount = (weeklyPrice || 0) * weeks;

      await scheduler.runAfter(
        0,
        // 👇 casteo a any para evitar el error de TS si el codegen no ve la acción
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
    const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
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

/** Compra del juego */
export const purchaseGame = mutation({
  args: {
    userId: v.id("profiles"),
    gameId: v.id("games"),
    amount: v.number(),
  },
  handler: async ({ db, scheduler }, { userId, gameId, amount }) => {
    const now = Date.now();

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
            method: "AMEX •••• 4542", // si tenés brand/last4, ponelo acá
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
