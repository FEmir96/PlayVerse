// convex/functions/mutations/upgradePlan.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const upgradePlan = mutation({
  args: {
    userId: v.id("profiles"),
    toRole: v.union(v.literal("free"), v.literal("premium")),
    paymentId: v.optional(v.id("payments")),
  },
  handler: async (ctx, { userId, toRole, paymentId }) => {
    const now = Date.now();

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const fromRole = user.role;
    if (fromRole === toRole) {
      return { changed: false, message: "El usuario ya tiene ese plan." };
    }

    // Actualizamos el perfil
    await ctx.db.patch(userId, { role: toRole });

    // Registramos el upgrade/downgrade
    const upgradeId = await ctx.db.insert("upgrades", {
      userId,
      fromRole,
      toRole,
      effectiveAt: now,
      paymentId,
    });

    // Auditoría
    await ctx.db.insert("audits", {
      action: "upgradePlan",
      entity: "profile",
      entityId: userId, // se audita el usuario
      requesterId: userId, // el mismo usuario está cambiando su plan
      timestamp: now,
      details: {
        fromRole,
        toRole,
        upgradeId,
        paymentId,
      },
    });

    return {
      changed: true,
      upgradeId,
      message:
        toRole === "premium"
          ? "¡Upgrade a Premium aplicado!"
          : "Cambio aplicado a plan Free.",
    };
  },
});
