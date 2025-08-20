// convex/functions/mutations/updateGame.ts
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
  },
  handler: async ({ db }, { gameId, requesterId, ...fields }) => {
    // Verificar que requester sea admin
    const requester = await db.get(requesterId);
    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado. Solo un admin puede actualizar juegos.");
    }

    // Verificar existencia del juego
    const game = await db.get(gameId);
    if (!game) throw new Error("Juego no encontrado.");

    // Evitar patch vacío
    if (Object.keys(fields).length === 0) {
      throw new Error("Debe proporcionar al menos un campo a actualizar.");
    }

    // Guardar cambios
    await db.patch(gameId, fields);

    // Registrar en auditoría
    await db.insert("audits", {
      action: "update_game",
      entity: "game",
      entityId: gameId,
      requesterId,
      timestamp: Date.now(),
      details: fields,
    });

    return { updated: true, gameId, message: "Juego actualizado con éxito" };
  },
});
