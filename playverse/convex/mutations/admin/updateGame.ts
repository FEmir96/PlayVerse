// convex/mutations/admin/updateGame.ts  (wrapper panel admin)
// Detecta cambios por campo y crea JOBS ligeros en notification_jobs.
// Además inserta una notificación inmediata para el admin (requesterId)
// para que el admin reciba la notificación al instante.
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { updateGameCore } from "../../lib/gameCore";
import { api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";

const PatchValidator = v.object({
  title: v.optional(v.union(v.string(), v.null())),
  description: v.optional(v.union(v.string(), v.null())),
  cover_url: v.optional(v.union(v.string(), v.null())),
  trailer_url: v.optional(v.union(v.string(), v.null())),
  extraTrailerUrl: v.optional(v.union(v.string(), v.null())),
  extraImages: v.optional(v.array(v.string())),
  genres: v.optional(v.array(v.string())),

  purchasePrice: v.optional(v.union(v.float64(), v.string(), v.null())),
  weeklyPrice: v.optional(v.union(v.float64(), v.string(), v.null())),

  embed_url: v.optional(v.union(v.string(), v.null())),
  embed_allow: v.optional(v.union(v.string(), v.null())),
  embed_sandbox: v.optional(v.union(v.string(), v.null())),

  plan: v.optional(v.union(v.literal("free"), v.literal("premium"))),
});

function equalish(a: any, b: any) {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    try { return JSON.stringify(a || []) === JSON.stringify(b || []); } catch { return false; }
  }
  if (typeof a === "object" || typeof b === "object") {
    try { return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {}); } catch { return false; }
  }
  const an = Number(a), bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an === bn;
  return String(a ?? "") === String(b ?? "");
}

function moneyLabel(v: any) {
  if (v == null) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  try { return n.toLocaleString("en-US", { style: "currency", currency: "USD" }); } catch { return `$${n.toFixed(2)}`; }
}

export const updateGame = mutation({
  args: {
    gameId: v.id("games"),
    requesterId: v.optional(v.id("profiles")),

    // campos sueltos
    title: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.union(v.string(), v.null())),
    cover_url: v.optional(v.union(v.string(), v.null())),
    trailer_url: v.optional(v.union(v.string(), v.null())),
    extraTrailerUrl: v.optional(v.union(v.string(), v.null())),
    extraImages: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    purchasePrice: v.optional(v.union(v.float64(), v.string(), v.null())),
    weeklyPrice: v.optional(v.union(v.float64(), v.string(), v.null())),
    embed_url: v.optional(v.union(v.string(), v.null())),
    embed_allow: v.optional(v.union(v.string(), v.null())),
    embed_sandbox: v.optional(v.union(v.string(), v.null())),
    plan: v.optional(v.union(v.literal("free"), v.literal("premium"))),

    patch: v.optional(PatchValidator),
  },
  handler: async ({ db, scheduler }, args) => {
    const { patch, ...top } = args as any;
    const merged = patch ? { ...top, ...patch } : top;

    // leer antes y después para diff
    const before = await db.get(args.gameId);
    const result = await updateGameCore(db, merged);
    const after = await db.get(args.gameId);

    const watchedFields: string[] = [
      "title","description","cover_url","trailer_url","extraTrailerUrl","extraImages","genres",
      "purchasePrice","weeklyPrice","embed_url","embed_allow","embed_sandbox","plan"
    ];

    const changes: Array<{ field: string; before: any; after: any }> = [];
    for (const f of watchedFields) {
      const b = before ? (before as any)[f] : undefined;
      const a = after ? (after as any)[f] : undefined;
      if (!equalish(b, a)) changes.push({ field: f, before: b, after: a });
    }

    if (changes.length === 0) return result;

    const now = Date.now();

    // Determinar targetRoles según plan final (after)
    const planFinal = (after as any)?.plan ?? (before as any)?.plan ?? "free";
    const rolesForPlan = planFinal === "premium" ? ["premium", "admin"] : ["free", "premium", "admin"];

    // Por cada cambio: crear JOB ligero en notification_jobs (uno por campo)
    // y además insertar notificación inmediata para el requester (admin) si existe
    for (const change of changes) {
      const f = change.field;
      let titleMsg = `Actualización: ${(after as any)?.title ?? (before as any)?.title ?? "Juego"}`;
      let message = `Se actualizó ${f}.`;
      if (f === "purchasePrice") {
        titleMsg = `Precio de compra actualizado: ${(after as any)?.title ?? (before as any)?.title ?? "Juego"}`;
        message = `Precio compra: ${moneyLabel(change.before)} → ${moneyLabel(change.after)}`;
      } else if (f === "weeklyPrice") {
        titleMsg = `Precio de alquiler actualizado: ${(after as any)?.title ?? (before as any)?.title ?? "Juego"}`;
        message = `Precio alquiler: ${moneyLabel(change.before)} → ${moneyLabel(change.after)}`;
      } else if (f === "description") {
        titleMsg = `Descripción actualizada: ${(after as any)?.title ?? (before as any)?.title ?? "Juego"}`;
        message = `Se actualizó la descripción del juego.`;
      }

      // Insertamos JOB ligero (cast a any porque notification_jobs puede no estar tipado aún)
      try {
        await (db as any).insert("notification_jobs", {
          kind: "game-update",
          title: titleMsg,
          message,
          gameId: args.gameId,
          targetRoles: rolesForPlan,
          meta: { field: change.field, before: change.before, after: change.after, updatedBy: args.requesterId ?? null },
          status: "pending",
          createdAt: now,
        });
      } catch (err) {
        console.error("updateGame: failed to insert notification_job", err);
      }

      // Insertamos una notificación inmediata para el requester (admin) si existe
      if (args.requesterId) {
        try {
          await db.insert("notifications", {
            userId: args.requesterId,
            type: "game-update",
            title: titleMsg,
            message,
            gameId: args.gameId,
            transactionId: undefined,
            isRead: false,
            readAt: undefined,
            createdAt: now,
            meta: { field: change.field, before: change.before, after: change.after, updatedBy: args.requesterId ?? null },
          });

          // intentamos planificar push al requester (si hay scheduler), no bloqueante
          if (scheduler) {
            try {
              await scheduler.runAfter(0, api.actions.pushy.sendToProfile, {
                profileId: args.requesterId,
                title: titleMsg,
                message,
                data: { type: "game-update", meta: { gameId: String(args.gameId), field: change.field } },
              });
            } catch (e) {
              console.error("schedule push to requester failed", e);
            }
          }
        } catch (e) {
          console.error("updateGame: failed to insert immediate notification for requester", e);
        }
      }
    }

    return result;
  },
});