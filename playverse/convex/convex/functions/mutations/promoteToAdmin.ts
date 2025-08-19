// convex/functions/mutations/promoteToAdmin.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const promoteToAdmin = mutation({
  args: {
    userId: v.id("profiles"),
  },
  handler: async ({ db }, { userId }) => {
    const user = await db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    await db.patch(userId, { role: "admin" });

    return {
      success: true,
      message: `El usuario ${user.name} ahora es administrador`,
      userId,
    };
  },
});
