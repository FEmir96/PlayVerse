import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export const listGamesWithoutCover = query({
  args: {},
  handler: async (ctx): Promise<Doc<"games">[]> => {
    const games = await ctx.db.query("games").collect();
    return games.filter(g => !g.cover_url || g.cover_url.trim() === "");
  },
});
