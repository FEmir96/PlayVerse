// convex/mutations/upgradePlan.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const upgradePlan = mutation({
  args: {
    userId: v.id("profiles"),
    toRole: v.union(v.literal("premium"), v.literal("free")),
    plan: v.optional(v.string()),          // opcional (hoy no se guarda en profiles)
    trial: v.optional(v.boolean()),        // opcional (hoy no se guarda en profiles)
    paymentId: v.optional(v.id("payments"))// opcional (por si querés enlazarlo luego)
  },
  handler: async (ctx, { userId, toRole /* plan, trial, paymentId */ }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // Evitamos escribir campos que NO existen en el schema de profiles
    // (no premiumPlan, no updatedAt, etc.)
    if (user.role !== toRole) {
      await ctx.db.patch(userId, { role: toRole });
    }

    // ⚠️ IMPORTANTE:
    // No insertamos en "transactions" porque tu schema de esa colección
    // obliga a type: "rental" | "purchase" y rompería el tipado.
    // Cuando quieras loguear la suscripción:
    //  - opción A: crear colección "subscriptions" con su propio schema
    //  - opción B: agregar "subscription" al union del campo "type" de esa colección

    return { ok: true, role: toRole };
  },
});
