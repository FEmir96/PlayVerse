// convex/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async ({ db }, { email }) => {
    return await db.query("profiles")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();
  },
});
