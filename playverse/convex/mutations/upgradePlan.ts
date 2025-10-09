// convex/mutations/upgradePlan.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

type Plan = "monthly" | "quarterly" | "annual" | "lifetime";

export const upgradePlan = mutation({
  args: {
    userId: v.id("profiles"),
    toRole: v.union(v.literal("premium"), v.literal("free")),
    plan: v.optional(v.string()),           // "monthly" | "quarterly" | "annual" | "lifetime"
    trial: v.optional(v.boolean()),         // 7 días si true
    paymentId: v.optional(v.id("payments")) // link opcional
  },
  handler: async (ctx, { userId, toRole, plan, trial, paymentId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // 1) Cambiar rol si es distinto
    if (user.role !== toRole) {
      await ctx.db.patch(userId, { role: toRole });
    }

    // 2) Si toRole === "premium", setear expiración y registrar suscripción
    if (toRole === "premium") {
      const p: Plan = (plan as Plan) || "monthly";
      const now = Date.now();

      // Trial => +7 días antes de empezar el período
      const trialMs = trial ? 7 * 24 * 60 * 60 * 1000 : 0;
      const start = new Date(now + trialMs);

      let expiresAt: number | undefined = undefined;
      let autoRenew = true;

      if (p !== "lifetime") {
        const months = p === "annual" ? 12 : p === "quarterly" ? 3 : 1;
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        expiresAt = end.getTime();
      } else {
        autoRenew = false;
      }

      // Guardar en perfil (opcionales en schema)
      await (ctx.db as any).patch(userId, {
        premiumPlan: p,
        premiumAutoRenew: autoRenew,
        premiumExpiresAt: expiresAt,
      });

      // Registrar suscripción (histórico)
      await (ctx.db as any).insert("subscriptions", {
        userId,
        plan: p,
        startAt: start.getTime(),
        expiresAt,
        autoRenew,
        status: "active",
        paymentId,
        createdAt: now,
      });

      // Dejar rastro en upgrades
      try {
        await (ctx.db as any).insert("upgrades", {
          userId,
          fromRole: user.role,
          toRole: "premium",
          effectiveAt: now,
          paymentId,
          status: "upgraded",
          createdAt: now,
        });
      } catch {}
    }

    return { ok: true, role: toRole };
  },
});
