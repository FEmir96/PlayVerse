// convex/mutations/cancelPremiumPlan.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Cancela Premium => role: "free" y deja rastro en 'upgrades' (si existe).
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
    if (prevRole === "free") {
      return { ok: true as const, newRole: "free" as const, alreadyFree: true as const };
    }

    await ctx.db.patch(userId, { role: "free" });

    try {
      await (ctx.db as any).insert("upgrades", {
        userId,
        fromRole: prevRole,
        toRole: "free",
        status: "canceled",
        reason,
        createdAt: Date.now(),
      });
    } catch {}

    return { ok: true as const, newRole: "free" as const };
  },
});
