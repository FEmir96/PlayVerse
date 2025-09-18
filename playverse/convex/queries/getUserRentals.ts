// convex/functions/queries/getUserRentals.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserRentals = query({
  args: { userId: v.id("profiles") },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
