import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

export const searchGames = query({
  args: {
    q: v.optional(v.string()),
    genre: v.optional(v.string()),              // "Todos" => sin filtro
    plan: v.optional(v.union(v.literal("free"), v.literal("premium"))),
    page: v.optional(v.number()),               // 1-based
    pageSize: v.optional(v.number()),           // default 12
  },
  handler: async (ctx, { q, genre, plan, page = 1, pageSize = 12 }) => {
    // base: por fecha desc para que sea determinista
    const all = await ctx.db
      .query("games")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    let filtered = all as Doc<"games">[];

    if (q && q.trim()) {
      const needle = q.toLowerCase();
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(needle)
      );
    }

    if (genre && genre !== "Todos") {
      filtered = filtered.filter((g) => (g.genres ?? []).includes(genre));
    }

    if (plan) {
      filtered = filtered.filter((g) => g.plan === plan);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total, page, pageSize };
  },
});
