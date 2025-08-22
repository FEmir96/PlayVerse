// convex/functions/mutations/addGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const addGame = mutation({
  args: {
    requesterId: v.id("profiles"), // 👈 quién ejecuta la acción
    title: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium")),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
  },
  handler: async ({ db }, { requesterId, title, plan, description, cover_url, trailer_url }) => {
    const now = Date.now();

    // 1. Validar que el requester sea admin
    const requester = await db.get(requesterId);
    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado. Solo un admin puede agregar juegos.");
    }

    // 2. Validación: evitar duplicados (case insensitive opcional)
    const existing = await db
      .query("games")
      .filter((q) => q.eq(q.field("title"), title))
      .unique();

    if (existing) {
      return { status: "exists", message: `El juego "${title}" ya existe en el catálogo.` };
    }

    // 3. Inserción del nuevo juego
    const gameId = await db.insert("games", {
      title,
      description: description ?? `Descripción de ${title} próximamente...`,
      cover_url,
      trailer_url,
      plan,
      createdAt: now,
    });

    // 4. Registrar en auditoría
    await db.insert("audits", {
      action: "add_game",
      entity: "game",
      entityId: gameId,
      requesterId,
      timestamp: now,
      details: { title, plan },
    });

    return { status: "inserted", message: `Juego "${title}" agregado correctamente.`, gameId };
  },
});
