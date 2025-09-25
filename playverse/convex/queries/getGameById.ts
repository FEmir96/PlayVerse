import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

export const getGameById = query({
  args: { id: v.id("games") },
  handler: async (ctx, { id }): Promise<Doc<"games"> | null> => {
    return await ctx.db.get(id as Id<"games">);
  },
});
