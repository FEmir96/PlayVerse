// convex/functions/mutations/promoteToAdmin.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const promoteToAdmin = mutation({
  args: {
    userId: v.id("profiles"),
    requesterId: v.id("profiles"), // quién realiza la acción
  },
  handler: async ({ db }, { userId, requesterId }) => {
    const user = await db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // Actualizamos rol a admin
    await db.patch(userId, { role: "admin" });

    const now = Date.now();

    // Guardamos auditoría
    await db.insert("audits", {
      action: "promote_to_admin",
      entity: "user",
      entityId: userId,
      requesterId,
      timestamp: now,
      details: {
        previousRole: user.role,
        newRole: "admin",
      },
    });

    return {
      success: true,
      message: `El usuario ${user.name} ahora es administrador`,
      userId,
    };
  },
});
