"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

type MinimalGame = {
  _id: Id<"games">;
  title: string;
  igdbId?: number | null;
  ageRatingLabel?: string | null;
};

type RowResult = { id: Id<"games">; ok: boolean; reason?: string; dryRun?: boolean };

export const refreshIGDBBatch = action({
  args: {
    // Si querés pasar algunos ids específicos
    ids: v.optional(v.array(v.id("games"))),

    // true => sólo los que tienen clasificación faltante o "Not Rated" / "NR"
    onlyMissing: v.optional(v.boolean()),

    // corta la lista a N juegos (útil para probar)
    limit: v.optional(v.number()),

    // true => si el juego no tiene igdbId, hace match por título
    forceByTitleWhenNoId: v.optional(v.boolean()),

    // no escribe nada, sólo prueba
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const api: any = (await import("../_generated/api")).api;

    const onlyMissing = args.onlyMissing !== false; // default true
    const forceWhenNoId = args.forceByTitleWhenNoId !== false; // default true

    // 1) Armar lista de juegos
    let list: MinimalGame[] = [];
    if (args.ids?.length) {
      const rows = await Promise.all(
        args.ids.map((id) => ctx.runQuery(api.queries.getGameById.getGameById, { id }))
      );
      list = rows
        .filter(Boolean)
        .map((g: any) => ({
          _id: g._id as Id<"games">,
          title: g.title as string,
          igdbId: (g as any).igdbId ?? null,
          ageRatingLabel: (g as any).ageRatingLabel ?? null,
        }));
    } else {
      // Intentar con una query minimal; si no existe, fallback a free+premium
      try {
        list = (await ctx.runQuery(api.queries.listGamesMinimal.listGamesMinimal, {})) as MinimalGame[];
      } catch {
        const free = (await ctx.runQuery(api.queries.getFreeGames.getFreeGames, {})) as any[];
        const premium = (await ctx.runQuery(api.queries.getPremiumGames.getPremiumGames, {})) as any[];
        const merged = [...(free || []), ...(premium || [])];
        const seen = new Set<string>();
        list = merged
          .filter((g) => {
            const k = String(g?._id || "");
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
          })
          .map((g) => ({
            _id: g._id as Id<"games">,
            title: g.title as string,
            igdbId: (g as any).igdbId ?? null,
            ageRatingLabel: (g as any).ageRatingLabel ?? null,
          }));
      }
    }

    // 2) Filtrar si onlyMissing
    let source = list;
    if (onlyMissing) {
      source = source.filter(
        (g) => !g.ageRatingLabel || g.ageRatingLabel === "Not Rated" || g.ageRatingLabel === "NR"
      );
    }

    // 3) Limitar si pidieron
    const limited =
      typeof args.limit === "number" && args.limit > 0 ? source.slice(0, args.limit) : source;

    const results: RowResult[] = [];

    // 4) Procesar secuencialmente (rate-limit friendly)
    for (const g of limited) {
      if (args.dryRun) {
        results.push({ id: g._id, ok: true, dryRun: true });
        continue;
      }
      try {
        const out = (await ctx.runAction(
          api.actions.refreshIGDBRatingForGame.refreshIGDBRatingForGame,
          {
            gameId: g._id,
            igdbId: typeof g.igdbId === "number" ? g.igdbId : undefined,
            forceByTitle: typeof g.igdbId !== "number" ? forceWhenNoId : false,
          }
        )) as any;

        if (out?.ok) {
          results.push({ id: g._id, ok: true });
        } else {
          results.push({ id: g._id, ok: false, reason: out?.reason || "fail" });
        }
      } catch (e: any) {
        results.push({ id: g._id, ok: false, reason: String(e?.message || e) });
      }
      await sleep(180); // evita rate limits de IGDB
    }

    const ok = results.filter((r) => r.ok).length;
    return {
      total: results.length,
      ok,
      results,
      processedWithId: results.length,
      processedWithoutId: 0,
      errors: results.filter((r) => !r.ok),
    };
  },
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
