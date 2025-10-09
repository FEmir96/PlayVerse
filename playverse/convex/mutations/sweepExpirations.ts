// convex/mutations/sweepExpirations.ts
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

async function downgradeProfile(ctx: any, userId: Id<"profiles">, meta?: Record<string, unknown>) {
  // Baja rol + limpia flags premium
  await ctx.db.patch(userId, {
    role: "free" as any,
    premiumPlan: undefined,
    premiumExpiresAt: undefined,
    premiumAutoRenew: undefined,
  });

  // Notificación local (sin helpers externos)
  await ctx.db.insert("notifications", {
    userId,
    type: "plan-expired",
    title: "Tu Premium venció",
    message: "Tu cuenta pasó a Free. Puedes reactivar cuando quieras.",
    gameId: undefined,
    transactionId: undefined,
    isRead: false,
    readAt: undefined,
    createdAt: Date.now(),
    meta,
  });
}

export const sweepExpirations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let expiredCount = 0;

    // 1) Marcar suscripciones "active" con expiresAt vencido -> "expired"
    const activeSubs = await (ctx.db as any)
      .query("subscriptions")
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();

    for (const sub of activeSubs) {
      const exp = Number(sub.expiresAt ?? 0);
      if (exp && exp <= now) {
        await ctx.db.patch(sub._id, { status: "expired", updatedAt: now });
        expiredCount++;
      }
    }

    // 2) Bajar perfiles cuyo premiumExpiresAt venció y NO tengan otra sub activa
    const profiles = await (ctx.db as any).query("profiles").collect();
    for (const p of profiles) {
      if (p.role === "premium" && p.premiumPlan !== "lifetime") {
        const exp = Number(p.premiumExpiresAt ?? 0);
        if (exp && exp <= now) {
          const stillActive = await (ctx.db as any)
            .query("subscriptions")
            .filter((q: any) => q.eq(q.field("userId"), p._id))
            .filter((q: any) => q.eq(q.field("status"), "active"))
            .collect();

          if (!stillActive || stillActive.length === 0) {
            await downgradeProfile(ctx, p._id, { expiredAt: exp });
          }
        }
      }
    }

    return { ok: true as const, expiredCount };
  },
});
