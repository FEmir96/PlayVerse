// convex/queries/canPlayGame.ts
import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Gating para juegos embebidos.
 * Campos esperados en games:
 *  - embed_url | embedUrl
 *  - access: "free" | "premium" | "purchase" | "rental"
 *  - license: "freeware" | "retail" (solo para inferir access si no está)
 *
 * ✅ TIPO-SAFE RELAXED:
 *  Este archivo usa casts a `any` en las consultas a tablas opcionales
 *  (purchases/library/rentals) para evitar errores TS cuando tu DataModel
 *  aún no las tiene tipadas en `convex/_generated/dataModel`.
 *  Cuando agregues esas tablas al schema de Convex y generes tipos,
 *  podés quitar los `as any` y usar índices reales.
 */
export const canPlayGame = query({
  args: {
    userId: v.union(v.id("profiles"), v.null()),
    gameId: v.id("games"),
  },
  handler: async (ctx, { userId, gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) {
      return { canPlay: false, reason: "Juego no encontrado", expiresAt: null as number | null };
    }

    const embedUrl = (game as any).embed_url ?? (game as any).embedUrl ?? null;
    if (!embedUrl) {
      return { canPlay: false, reason: "Este juego no tiene versión embebible", expiresAt: null as number | null };
    }

    const access: "free" | "premium" | "purchase" | "rental" =
      (game as any).access ??
      (game as any).accessModel ??
      ((game as any).license === "freeware" ? "free" : "purchase");

    // FREE → todos pueden (sin login)
    if (access === "free") {
      return { canPlay: true, reason: null, expiresAt: null };
    }

    // Desde acá: requiere usuario
    if (!userId) {
      return { canPlay: false, reason: "login", expiresAt: null };
    }

    const profile = await ctx.db.get(userId as Id<"profiles">);
    const role = (profile?.role as "free" | "premium" | "admin" | undefined) ?? "free";

    // PREMIUM
    if (access === "premium") {
      const ok = role === "premium" || role === "admin";
      return { canPlay: ok, reason: ok ? null : "premium_required", expiresAt: null };
    }

    // PURCHASE
    if (access === "purchase") {
      let owned = false;

      try {
        const db: any = ctx.db as any;

        // 1) buscar compra directa
        const purchase =
          (await db
            .query("purchases")
            ?.withIndex?.("by_user_game", (q: any) => q.eq("userId", userId).eq("gameId", gameId))
            ?.first?.()) ??
          (await db
            .query("purchases")
            ?.collect?.())
            ?.find?.((r: any) => String(r.userId) === String(userId) && String(r.gameId) === String(gameId));

        if (purchase) owned = true;

        // 2) o biblioteca marcada como owned
        if (!owned) {
          const libRow =
            (await db
              .query("library")
              ?.withIndex?.("by_user_game", (q: any) => q.eq("userId", userId).eq("gameId", gameId))
              ?.first?.()) ??
            (await db
              .query("library")
              ?.collect?.())
              ?.find?.((r: any) => String(r.userId) === String(userId) && String(r.gameId) === String(gameId));

          if (libRow?.owned) owned = true;
        }
      } catch {
        // si algo falla, dejamos owned=false
      }

      return { canPlay: owned, reason: owned ? null : "purchase_required", expiresAt: null };
    }

    // RENTAL
    if (access === "rental") {
      let rental: any = null;

      try {
        const db: any = (ctx.db as any);

        rental =
          (await db
            .query("rentals")
            ?.withIndex?.("by_user_game", (q: any) => q.eq("userId", userId).eq("gameId", gameId))
            ?.order?.("desc")
            ?.first?.()) ??
          (() => {
            // fallback a full scan (si no hay índices tipados)
            return db
              .query("rentals")
              ?.collect?.()
              ?.then?.((rows: any[]) =>
                rows
                  .filter(
                    (r) => String(r.userId) === String(userId) && String(r.gameId) === String(gameId)
                  )
                  .sort((a, b) => (b.expiresAt ?? 0) - (a.expiresAt ?? 0))[0]
              );
          })();

        if (rental && typeof rental.then === "function") {
          rental = await rental; // si vino como promesa del fallback
        }
      } catch {
        rental = null;
      }

      const now = Date.now();
      const active = rental && (typeof rental.expiresAt !== "number" || rental.expiresAt > now);
      return {
        canPlay: Boolean(active),
        reason: active ? null : "rental_required",
        expiresAt: active ? (rental!.expiresAt ?? null) : null,
      };
    }

    return { canPlay: false, reason: "modelo_de_acceso_desconocido", expiresAt: null };
  },
});
