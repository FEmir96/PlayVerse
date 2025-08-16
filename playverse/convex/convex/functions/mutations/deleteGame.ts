// convex/functions/mutations/deleteGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const deleteGame = mutation({
  args: { gameId: v.id("games") },
  handler: async ({ db }, { gameId }) => {
    await db.delete(gameId);
    return true;
  },
});
