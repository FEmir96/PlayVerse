// convex/functions/mutations/createUser.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("free"),
      v.literal("premium")
    ),
  },
  handler: async ({ db }, { name, email, role }) => {
    const now = Date.now();
    return await db.insert("profiles", {
      name,
      email,
      role,
      createdAt: now,
    });
  },
});
