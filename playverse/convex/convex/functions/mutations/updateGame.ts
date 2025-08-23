// convex/functions/mutations/updateGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateGame = mutation({
  args: {
    gameId: v.id("games"),
    requesterId: v.id("profiles"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    cover_url: v.optional(v.string()),
    trailer_url: v.optional(v.string()),
    // 👉 plan OBLIGATORIO
    plan: v.union(v.literal("free"), v.literal("premium")),
  },
  handler: async (
    { db },
    { gameId, requesterId, title, description, cover_url, trailer_url, plan }
  ) => {
    // 1) Validar admin
    const requester = await db.get(requesterId);
    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado. Solo un admin puede actualizar juegos.");
    }

    // 2) Verificar existencia del juego
    const existing = await db.get(gameId);
    if (!existing) throw new Error("Juego no encontrado.");

    // 3) Construir cambios (solo si cambian de verdad)
    const updates: Record<string, any> = {};
    const before: Record<string, any> = {};

    const setIfChanged = (key: keyof typeof existing, next: any) => {
      if (next !== undefined && existing[key] !== next) {
        updates[key as string] = next;
        before[key as string] = existing[key];
      }
    };

    setIfChanged("title", title);
    setIfChanged("description", description);
    setIfChanged("cover_url", cover_url);
    setIfChanged("trailer_url", trailer_url);

    // 4) Validación de plan: no permitir “actualizar” al mismo plan
    if (plan !== existing.plan) {
      updates.plan = plan;
      before.plan = existing.plan;
    }

    // Si no hay cambios (incluye el caso plan igual y sin otros campos distintos)
    if (Object.keys(updates).length === 0) {
      throw new Error(
        `No se realizaron cambios: el juego ya tiene plan "${plan}" y no enviaste otros campos distintos.`
      );
    }

    // 5) Guardar cambios
    await db.patch(gameId, updates);

    // 6) Auditoría
    await db.insert("audits", {
      action: "update_game",
      entity: "game",
      entityId: gameId,
      requesterId,
      timestamp: Date.now(),
      details: { before, after: updates },
    });

    return {
      status: "updated",
      gameId,
      planChanged: "plan" in updates,
      updates,
      message: "Juego actualizado con éxito",
    };
  },
});
