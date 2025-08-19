// convex/functions/mutations/addGamesBatch.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const addGamesBatch = mutation({
  args: {
    games: v.array(
      v.object({
        title: v.string(),
        plan: v.union(v.literal("free"), v.literal("premium")),
        description: v.optional(v.string()),
        cover_url: v.optional(v.string()),
        trailer_url: v.optional(v.string()),
      })
    ),
  },
  handler: async ({ db }, { games }) => {
    for (const game of games) {
      await db.insert("games", {
        ...game,
        createdAt: Date.now(), // 👈 agregado obligatorio
      });
    }

    return { inserted: games.length };
  },
});
