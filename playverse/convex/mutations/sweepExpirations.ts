// convex/mutations/sweepExpirations.ts
import { mutation } from "../_generated/server";

export const sweepExpirations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const toExpire = await (ctx.db as any)
      .query("subscriptions")
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .filter((q: any) => q.neq(q.field("expiresAt"), undefined))
      .collect();

    let expiredCount = 0;

    for (const sub of toExpire) {
      const exp = Number(sub.expiresAt ?? 0);
      if (exp && exp <= now) {
        // marcar suscripción como expirada
        await ctx.db.patch(sub._id, {
          status: "expired",
          updatedAt: now,
        });

        // bajar el rol del usuario si no tiene otra suscripción activa
        const activeForUser = await (ctx.db as any)
          .query("subscriptions")
          .filter((q: any) => q.eq(q.field("userId"), sub.userId))
          .filter((q: any) => q.eq(q.field("status"), "active"))
          .collect();

        if (!activeForUser || activeForUser.length === 0) {
          await ctx.db.patch(sub.userId, { role: "free" as any });
        }

        expiredCount++;
      }
    }

    return { ok: true as const, expiredCount };
  },
});
