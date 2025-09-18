// convex/functions/mutations/upgradePlan.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const upgradePlan = mutation({
  args: {
    userId: v.id("profiles"),                  // usuario afectado
    toRole: v.union(v.literal("free"), v.literal("premium")),
    paymentId: v.optional(v.id("payments")),   // si hay pago simulado
    requesterId: v.optional(v.id("profiles")), // quién ejecuta (si no se pasa, es el mismo userId)
  },
  handler: async ({ db }, { userId, toRole, paymentId, requesterId }) => {
    const now = Date.now();

    const user = await db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const fromRole = user.role;
    if (fromRole === toRole) {
      return { changed: false, message: "El usuario ya tiene ese plan." };
    }
    if (fromRole === "admin") {
      throw new Error("No se puede cambiar el plan de un administrador desde aquí.");
    }

    // Actualizar perfil
    await db.patch(userId, { role: toRole });

    // Registrar upgrade/downgrade funcional
    const upgradeId = await db.insert("upgrades", {
      userId,
      fromRole,
      toRole,
      effectiveAt: now,
      paymentId,
    });

    // Auditoría
    const actorId = requesterId ?? userId; // Id<"profiles">
    const actor = await db.get(actorId);
    await db.insert("audits", {
      action: "upgrade_plan",
      entity: "user",
      entityId: userId,   // <-- PASAMOS LA Id (NO string)
      requesterId: actorId,
      timestamp: now,
      details: {
        requesterName: actor?.name ?? "(desconocido)",
        userEmail: user.email,
        fromRole,
        toRole,
        upgradeId: String(upgradeId),         // en details, string OK
        paymentId: paymentId ? String(paymentId) : undefined,
      },
    });

    return {
      changed: true,
      upgradeId,
      message: toRole === "premium"
        ? "¡Upgrade a Premium aplicado!"
        : "Cambio aplicado a plan Free.",
    };
  },
});
