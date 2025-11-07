// convex/mutations/setAutoRenew.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Activa o desactiva la renovación automática sin tocar el rol.
 * Campos esperados (opcionales) en profiles:
 *  - premiumAutoRenew?: boolean
 *  - premiumPlan?: "monthly" | "quarterly" | "annual" | "lifetime"
 *  - premiumExpiresAt?: number
 */
export const setAutoRenew = mutation({
  args: {
    userId: v.id("profiles"),
    autoRenew: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { userId, autoRenew, reason }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const now = Date.now();
    const currentRole = (user as any)?.role ?? "free";

    // 1) Actualizar flag en perfil
    await ctx.db.patch(userId, { premiumAutoRenew: autoRenew });

    // 2) Si usás histórico de suscripciones, actualizá el último registro activo/cancelado
    try {
      const subs = await (ctx.db as any)
        .query("subscriptions")
        .filter((q: any) =>
          q.and(
            q.eq(q.field("userId"), userId),
            q.or(q.eq(q.field("status"), "active"), q.eq(q.field("status"), "canceled"))
          )
        )
        .collect();

      if (subs?.length) {
        const latest = subs.sort((a: any, b: any) => (b.startAt ?? 0) - (a.startAt ?? 0))[0];
        await (ctx.db as any).patch(latest._id, { autoRenew, updatedAt: now });
      }
    } catch {
      // Si no existe la tabla/índice, lo ignoramos
    }

    // 3) Auditoría opcional
    try {
      await (ctx.db as any).insert("upgrades", {
        userId,
        fromRole: currentRole,
        toRole: currentRole,
        status: autoRenew ? "auto-renew-activated" : "auto-renew-canceled",
        reason,
        createdAt: now,
        meta: { autoRenew },
      });
    } catch {}

    // Retorno tipado simple (sin 'as const' sobre variables)
    return { ok: true, autoRenew };
  },
});
