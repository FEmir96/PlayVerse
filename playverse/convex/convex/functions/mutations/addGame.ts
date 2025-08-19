// convex/functions/mutations/addGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const addGame = mutation({
  args: {
    title: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium")),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
  },
  handler: async ({ db }, { title, plan, description, cover_url, trailer_url }) => {
    const now = Date.now();

    // Validación: evitar duplicados (case insensitive por seguridad)
    const existing = await db
      .query("games")
      .filter((q) => q.eq(q.field("title"), title))
      .unique();

    if (existing) {
      return { status: "exists", message: `El juego "${title}" ya existe en el catálogo.` };
    }

    // Inserción del nuevo juego
    await db.insert("games", {
      title,
      description: description ?? `Descripción de ${title} próximamente...`,
      cover_url,
      trailer_url,
      plan,
      createdAt: now,
    });

    return { status: "inserted", message: `Juego "${title}" agregado correctamente.` };
  },
});
