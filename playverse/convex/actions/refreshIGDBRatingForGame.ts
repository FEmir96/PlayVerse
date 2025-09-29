"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import { getIgdbAuth } from "../lib/igdb/auth";
import { pickAgeRating } from "../lib/igdb/ageRatings";

// Tipos mínimos para parsear IGDB
type IgdbCompany = {
  developer?: boolean;
  publisher?: boolean;
  company?: { name?: string | null } | null;
} | null;

type IgdbLangSupport = {
  language?: { name?: string | null } | null;
  language_support_type?: { name?: string | null } | null;
} | null;

type IgdbGame = {
  id: number;
  name?: string | null;
  slug?: string | null;
  first_release_date?: number | null;      // epoch seconds
  rating?: number | null;                  // user
  rating_count?: number | null;
  aggregated_rating?: number | null;       // critic
  total_rating?: number | null;            // combined
  age_ratings?: Array<{ category?: number | null; rating?: number | null }> | null;
  involved_companies?: IgdbCompany[] | null;
  language_supports?: IgdbLangSupport[] | null;
};

type HandlerResult = {
  ok: boolean;
  igdbId?: number;
  savedKeys?: string[];
  reason?: string;
};

export const refreshIGDBRatingForGame = action({
  args: {
    gameId: v.id("games"),
    igdbId: v.optional(v.number()),
    forceByTitle: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<HandlerResult> => {
    const api: any = (await import("../_generated/api")).api;

    // 1) Juego local
    const game = (await ctx.runQuery(api.queries.getGameById.getGameById, {
      id: args.gameId as Id<"games">,
    })) as Doc<"games"> | null;
    if (!game) throw new Error("Juego no encontrado en DB");

    // 2) Credenciales IGDB
    const { clientId: CLIENT_ID, token: TOKEN } = await getIgdbAuth();

    // 3) Campos válidos (nada de 'popularity' ni 'hypes')
    const fields = [
      "id",
      "name",
      "slug",
      "first_release_date",
      "rating",
      "rating_count",
      "aggregated_rating",
      "total_rating",
      "age_ratings.category",
      "age_ratings.rating",
      "involved_companies.company.name",
      "involved_companies.developer",
      "involved_companies.publisher",
      "language_supports.language.name",
      "language_supports.language_support_type.name",
    ].join(",");

    const useById =
      !args.forceByTitle && typeof args.igdbId === "number" && args.igdbId > 0;

    const queryStr = useById
      ? `fields ${fields}; where id = ${args.igdbId}; limit 1;`
      : `search "${escapeIgdbSearch(String(game.title || ""))}";
         fields ${fields};
         where version_parent = null;
         limit 1;`;

    const rows = await igdbPost<IgdbGame[]>("games", queryStr, CLIENT_ID, TOKEN);
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row?.id) return { ok: false, reason: "No se encontró el juego en IGDB" };

    // 4) Devs / Pubs
    const comps = (row.involved_companies ?? []).filter(Boolean) as NonNullable<IgdbCompany>[];
    const developers = dedupe(
      comps
        .filter(c => c.developer && c.company?.name)
        .map(c => String(c.company!.name!)).map(s => s.trim())
        .filter(Boolean)
    );
    const publishers = dedupe(
      comps
        .filter(c => c.publisher && c.company?.name)
        .map(c => String(c.company!.name!)).map(s => s.trim())
        .filter(Boolean)
    );

    // 5) Idiomas
    const langSupports = (row.language_supports ?? []).filter(Boolean) as NonNullable<IgdbLangSupport>[];
    const languages = dedupe(
      langSupports
        .map(l => l.language?.name ?? "")
        .map(s => String(s).trim())
        .filter(Boolean)
    );

    // 6) Clasificación por edad
    const chosen = pickAgeRating(row.age_ratings ?? undefined);

    // 7) Patch SOLO con campos que tu mutation valida
    const patch: Record<string, any> = {
      igdbUserRating: numOrUndef(round1, row.rating),
      igdbRatingCount: numOrUndef(n => n, row.rating_count),
      igdbCriticRating: numOrUndef(round1, row.aggregated_rating),
      igdbRating: numOrUndef(round1, row.total_rating), // mapeamos total_rating → igdbRating
      igdbId: row.id,
      igdbSlug: row.slug ?? undefined,

      firstReleaseDate: typeof row.first_release_date === "number" ? row.first_release_date * 1000 : undefined,
      developers: developers.length ? developers : undefined,
      publishers: publishers.length ? publishers : undefined,
      languages: languages.length ? languages : undefined,

      ageRatingSystem: chosen?.system,
      ageRatingLabel: chosen?.label,
      ageRatingCode: chosen?.code, // ← ahora existe en el tipo AgeRatingChoice
      lastIgdbSyncAt: Date.now(),
    };

    await ctx.runMutation(api.mutations.applyIgdbRating.applyIgdbRating, {
      id: args.gameId,
      requesterId: undefined,
      data: patch,
      auditDetails: { igdb: { id: row.id, name: row.name ?? null } },
    });

    return { ok: true, igdbId: row.id, savedKeys: Object.keys(patch).filter(k => patch[k] !== undefined) };
  },
});

// ===== helpers =====
async function igdbPost<T>(endpoint: string, body: string, clientId: string, token: string): Promise<T> {
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: { "Client-ID": clientId, Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`IGDB error ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

function escapeIgdbSearch(s: string) {
  return s.replace(/"/g, '\\"');
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function numOrUndef<T extends number>(map: (n: number) => T, val: number | null | undefined): T | undefined {
  return typeof val === "number" ? map(val) : undefined;
}
function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
