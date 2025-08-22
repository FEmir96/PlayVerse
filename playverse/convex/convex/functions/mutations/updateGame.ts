import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateGame = mutation({
  args: {
    gameId: v.id("games"),
    requesterId: v.id("profiles"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium")),
  },
  handler: async (
    { db },
    { gameId, requesterId, title, description, cover_url, trailer_url, plan }
  ) => {
    // Validación de admin
    const requester = await db.get(requesterId);
    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado.");
    }

    // Validar existencia del juego
    const existing = await db.get(gameId);
    if (!existing) throw new Error("Juego no encontrado.");

    const updates: Record<string, any> = {};

    if (title !== undefined && title !== existing.title) updates.title = title;
    if (description !== undefined && description !== existing.description)
      updates.description = description;
    if (cover_url !== undefined && cover_url !== existing.cover_url)
      updates.cover_url = cover_url;
    if (trailer_url !== undefined && trailer_url !== existing.trailer_url)
      updates.trailer_url = trailer_url;

    // Validar plan (solo si cambia)
    if (plan !== undefined) {
      if (plan === existing.plan) {
        throw new Error(
          `El juego "${existing.title}" ya tiene asignado el plan "${plan}".`
        );
      }
      updates.plan = plan;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("Debe proporcionar al menos un campo diferente para actualizar.");
    }

    await db.patch(gameId, updates);

    return { status: "updated", updates };
  },
});
