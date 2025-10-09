// convex/mutations/cancelPremiumPlan.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Cancela Premium => role: "free" y deja rastro en 'upgrades'.
 * Además marca la suscripción activa (si existe) como "canceled".
 */
export const cancelPremiumPlan = mutation({
  args: {
    userId: v.id("profiles"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { userId, reason }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const prevRole = (user as any)?.role ?? "free";
    const now = Date.now();

    // Marcar suscripción activa como cancelada (si existe)
    try {
      const actives = await (ctx.db as any)
        .query("subscriptions")
        .filter((q: any) => q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("status"), "active")
        ))
        .collect();

      if (actives?.length) {
        const latest = actives.sort(
          (a: any, b: any) => (b.startAt ?? 0) - (a.startAt ?? 0)
        )[0];
        await (ctx.db as any).patch(latest._id, {
          status: "canceled",
          // opcional: cortar expiración al momento de cancelar
          // expiresAt: now,
        });
      }
    } catch {}

    // Cambiar rol si no era free
    if (prevRole !== "free") {
      await ctx.db.patch(userId, { role: "free" });
    }

    // Registrar en upgrades (schema ahora soporta campos extra)
    try {
      await (ctx.db as any).insert("upgrades", {
        userId,
        fromRole: prevRole,
        toRole: "free",
        status: "canceled",
        reason,
        createdAt: now,
      });
    } catch {}

    return { ok: true as const, newRole: "free" as const, alreadyFree: prevRole === "free" };
  },
});
