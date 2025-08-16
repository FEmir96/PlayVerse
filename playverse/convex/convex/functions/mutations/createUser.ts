// convex/functions/mutations/createUser.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("free"), v.literal("premium")),
  },
  handler: async ({ db }, { email, role }) => {
    const now = Date.now();
    return await db.insert("profiles", {
      email,
      role,
      createdAt: now,
    });
  },
});
