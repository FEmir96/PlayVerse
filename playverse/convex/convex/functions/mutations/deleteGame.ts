// convex/functions/mutations/deleteGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const deleteGame = mutation({
  args: {
    gameId: v.id("games"),
    requesterId: v.id("profiles"),
  },
  handler: async ({ db }, { gameId, requesterId }) => {
    // Verificar que requester exista y sea admin
    const requester = await db.get(requesterId);
    if (!requester) {
      throw new Error("El usuario solicitante no existe.");
    }
    if (requester.role !== "admin") {
      throw new Error("No autorizado. Solo un admin puede eliminar juegos.");
    }

    // Verificar existencia del juego
    const game = await db.get(gameId);
    if (!game) {
      throw new Error("Juego no encontrado en la base de datos.");
    }

    // Eliminar juego
    await db.delete(gameId);

    // Registrar en auditoría
    await db.insert("audits", {
      action: "delete_game",
      entity: "game",
      entityId: gameId,
      requesterId,
      timestamp: Date.now(),
      details: { deletedTitle: game.title ?? "Título desconocido" },
    });

    return { deleted: true, gameId, message: `Juego "${game.title}" eliminado con éxito.` };
  },
});
