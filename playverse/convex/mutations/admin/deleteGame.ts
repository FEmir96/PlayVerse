// convex/mutations/admin/deleteGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const deleteGame = mutation({
  args: { id: v.id("games") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { ok: true };
  },
});
