// convex/queries/getUserRentals.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserRentals = query({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, { userId }) => {
    // Traer SOLO alquileres del usuario usando el índice by_user_type
    const rentals = await ctx.db
      .query("transactions")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "rental"))
      .collect();

    // Hidratar con datos del juego
    const rows = await Promise.all(
      rentals.map(async (r) => {
        const game = await ctx.db.get(r.gameId);
        return {
          _id: r._id,
          gameId: r.gameId,
          createdAt: r.createdAt,
          expiresAt: r.expiresAt ?? null,
          // campos “flat” para que tu UI funcione tal cual la tenés
          title: (game as any)?.title,
          cover_url: (game as any)?.cover_url,
          // y opcionalmente un objeto "game" por si lo necesitás
          game: game
            ? { title: (game as any).title, cover_url: (game as any).cover_url }
            : undefined,
        };
      })
    );

    return rows;
  },
});
