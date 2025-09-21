import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPaymentMethods = query({
  args: { userId: v.id("profiles") },
  handler: async ({ db }, { userId }) => {
    const rows = await db
      .query("paymentMethods")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    // Orden más nuevo primero
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  },
});
