// convex/functions/mutations/updateGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateGame = mutation({
  args: {
    gameId: v.id("games"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
  },
  handler: async ({ db }, { gameId, ...fields }) => {
    await db.patch(gameId, fields);
    return true;
  },
});
