// convex/functions/mutations/deleteGame.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteGame = mutation({
  args: {
    gameId: v.id("games"),
    requesterId: v.id("profiles"),
  },
  handler: async ({ db }, { gameId, requesterId }) => {
    // 1) Validar admin
    const requester = await db.get(requesterId);
    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado. Solo un admin puede eliminar juegos.");
    }

    // 2) Verificar existencia del juego
    const game = await db.get(gameId);
    if (!game) throw new Error("Juego no encontrado.");

    // (opcional) Chequear si tiene transacciones asociadas y bloquear
    // const hasTx = await db.query("transactions").filter(q => q.eq(q.field("gameId"), gameId)).first();
    // if (hasTx) throw new Error("No se puede eliminar: el juego tiene transacciones asociadas.");

    // 3) Eliminar
    await db.delete(gameId);

    // 4) Auditoría
    await db.insert("audits", {
      action: "delete_game",
      entity: "game",
      entityId: gameId,
      requesterId,
      timestamp: Date.now(),
      details: {
        deletedTitle: game.title,
        snapshot: {
          title: game.title,
          description: game.description,
          cover_url: game.cover_url,
          trailer_url: game.trailer_url,
          plan: game.plan,
          createdAt: game.createdAt,
        },
      },
    });

    return { deleted: true, gameId, message: "Juego eliminado con éxito" };
  },
});
