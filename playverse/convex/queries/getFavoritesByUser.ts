import { query } from "../_generated/server";
import { v } from "convex/values";

export const getFavoritesByUser = query({
  args: { userId: v.id("profiles") },
  handler: async ({ db }, { userId }) => {
    const favs = await db
      .query("favorites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    // Traemos los juegos y devolvemos datos útiles para la UI
    const games = await Promise.all(favs.map(f => db.get(f.gameId)));
    const byId = new Map(games.filter(Boolean).map(g => [g!._id, g!]));

    return favs
      .map(f => byId.get(f.gameId))
      .filter(Boolean)
      .map(g => ({
        _id: g!._id,
        title: g!.title ?? "Juego",
        cover_url: (g as any).cover_url ?? null,
        plan: (g as any).plan ?? "free",
        price_buy: (g as any).price_buy ?? null,
        weekly_price: (g as any).weekly_price ?? null,
      }));
  },
});
