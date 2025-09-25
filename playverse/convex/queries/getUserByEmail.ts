import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<Doc<"profiles"> | null> => {
    const user = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    return user ?? null;
  },
});
