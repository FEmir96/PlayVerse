// convex/transactions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/* ---- helpers html simples ---- */
function rentalEmailHTML(args: {
  userName: string;
  gameTitle: string;
  weeks: number;
  expiresAt: number;
}) {
  const expires = new Date(args.expiresAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `
  <div style="font-family:Inter,Arial,sans-serif">
    <h2>¡Alquiler confirmado!</h2>
    <p>Hola ${args.userName || "jugador/a"},</p>
    <p>Alquilaste <strong>${args.gameTitle}</strong> por <strong>${args.weeks}</strong> semana(s).</p>
    <p>Vencimiento: <strong>${expires}</strong></p>
    <p>Gracias por usar <strong>PlayVerse</strong> 🎮</p>
  </div>`;
}

function purchaseEmailHTML(args: {
  userName: string;
  gameTitle: string;
  amount: number;
}) {
  return `
  <div style="font-family:Inter,Arial,sans-serif">
    <h2>¡Compra confirmada!</h2>
    <p>Hola ${args.userName || "jugador/a"},</p>
    <p>Compraste <strong>${args.gameTitle}</strong>.</p>
    <p>Monto: <strong>USD $${args.amount.toFixed(2)}</strong></p>
    <p>¡A disfrutar! – <strong>PlayVerse</strong></p>
  </div>`;
}

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
      await scheduler.runAfter(0, api.actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Alquiler confirmado: ${game?.title ?? "Juego"}`,
        html: rentalEmailHTML({
          userName: user.name ?? "",
          gameTitle: game?.title ?? "",
          weeks,
          expiresAt,
        }),
      });
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
      await scheduler.runAfter(0, api.actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Extensión de alquiler: ${game?.title ?? "Juego"}`,
        html: rentalEmailHTML({
          userName: user.name ?? "",
          gameTitle: game?.title ?? "",
          weeks,
          expiresAt: newExpiresAt,
        }),
      });
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
      await scheduler.runAfter(0, api.actions.email.sendReceiptEmail, {
        to: user.email,
        subject: `PlayVerse – Compra confirmada: ${game?.title ?? "Juego"}`,
        html: purchaseEmailHTML({
          userName: user.name ?? "",
          gameTitle: game?.title ?? "",
          amount,
        }),
      });
    }

    return { ok: true as const };
  },
});
