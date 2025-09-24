"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import type { Id, Doc } from "../_generated/dataModel";
import type { FunctionReference } from "convex/server";

// 💡 triple nivel (carpeta → archivo → export)
const qGetGames = (api as any).queries.getGames.getGames as FunctionReference<"query">;
const mSetGameDetails =
  (api as any).mutations.setGameDetails.setGameDetails as FunctionReference<"mutation">;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const clamp = (s: string, max = 4000) => (s.length > max ? s.slice(0, max) : s);

function normalizeTitle(t: string) {
  return t
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
const TITLE_ALIASES: Record<string, string[]> = {
  "marvel's spiderman": ["marvel's spider-man"],
  "resident evil 8": ["resident evil village", "re8"],
};

async function translateToEs(text: string): Promise<string> {
  if (!text) return text;
  const base = process.env.LIBRETRANSLATE_URL || "https://libretranslate.com";
  const url = `${base.replace(/\/$/, "")}/translate`;
  const payload: any = { q: text, source: "auto", target: "es", format: "text" };
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  if (apiKey) payload.api_key = apiKey;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => null);
    const out = j?.translatedText ?? text;
    return clamp(out, 4000);
  } catch {
    return text;
  }
}

async function getIgdbToken(): Promise<{ token: string; clientId: string }> {
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
  if (!clientId || !clientSecret)
    throw new Error("Faltan TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET en Convex env");
  const resp = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );
  const json = await resp.json();
  if (!json.access_token) throw new Error("No IGDB token (Twitch OAuth)");
  return { token: json.access_token as string, clientId };
}

type IGDBGame = { id: number; name: string; summary?: string; genres?: { name: string }[] };

async function igdbFindByTitle(title: string): Promise<IGDBGame | null> {
  const { token, clientId } = await getIgdbToken();

  const base = normalizeTitle(title);
  const simple = base.split(":")[0].split("-")[0].trim();
  const aliases = TITLE_ALIASES[base.toLowerCase()] ?? [];

  const queries = [
    `search "${base.replace(/"/g, '\\"')}"; fields name,summary,genres.name; where version_parent = null; limit 1;`,
    `search "${simple.replace(/"/g, '\\"')}"; fields name,summary,genres.name; limit 1;`,
    ...aliases.map(
      (a) =>
        `search "${a.replace(/"/g, '\\"')}"; fields name,summary,genres.name; limit 1;`
    ),
  ];

  for (const q of queries) {
    const r = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: { "Client-ID": clientId, Authorization: `Bearer ${token}` },
      body: q,
    });
    const data = (await r.json()) as IGDBGame[];
    if (Array.isArray(data) && data[0]) return data[0];
    await sleep(250);
  }
  return null;
}

function mapGenresToPlayVerse(igdbNames: string[] = []): string[] {
  const MAP = new Map<string, string>([
    ["Action", "Acción"],
    ["Adventure", "Acción"],
    ["Fighting", "Acción"],
    ["Platform", "Acción"],
    ["Hack and slash/Beat 'em up", "Acción"],
    ["Role-playing (RPG)", "RPG"],
    ["Racing", "Carreras"],
    ["Shooter", "Shooter"],
    ["Strategy", "Estrategia"],
    ["Tactical", "Estrategia"],
    ["Real Time Strategy (RTS)", "Estrategia"],
    ["Turn-based strategy (TBS)", "Estrategia"],
    ["Simulator", "Sandbox"],
    ["Indie", "Sandbox"],
    ["Puzzle", "Sandbox"],
    ["Sport", "Deportes"],
    ["Sports", "Deportes"],
  ]);
  const out = new Set<string>();
  for (const g of igdbNames) {
    const m = MAP.get(g);
    if (m) out.add(m);
  }
  return [...out];
}

type DetailsResult = {
  candidates: number;
  processed: number;
  updated: number;
  dryRun: boolean;
  overwrite: boolean;
  sample: any[];
};

export const backfillDetailsFromIGDB = action({
  args: {
    dryRun: v.boolean(),
    overwrite: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { dryRun, overwrite = false, limit }
  ): Promise<DetailsResult> => {
    // 1) Traer juegos con TU getGames.ts
    const all: Doc<"games">[] = (await ctx.runQuery(qGetGames, {} as any)) as Doc<"games">[];

    // 2) Filtrar pendientes
    const pending = all.filter((g: any) => {
      const missingDesc = overwrite || !g.description || g.description.trim() === "";
      const missingGenres = overwrite || !Array.isArray(g.genres) || g.genres.length === 0;
      return missingDesc || missingGenres;
    });
    const batch = typeof limit === "number" ? pending.slice(0, Math.max(0, limit)) : pending;

    let updated = 0;
    const sample: any[] = [];

    for (const game of batch) {
      const found = await igdbFindByTitle(game.title);
      if (!found) {
        sample.push({ title: game.title, note: "No match IGDB" });
        continue;
      }

      const igdbGenres = found.genres?.map((g) => g.name) ?? [];
      const genresPV = mapGenresToPlayVerse(igdbGenres);

      const descEn = (found.summary ?? "").trim();
      const descEs = descEn ? await translateToEs(descEn) : undefined;

      if (dryRun) {
        sample.push({
          title: game.title,
          igdbMatch: found.name,
          genresIGDB: igdbGenres,
          genresPlayVerse: genresPV,
          descriptionPreview:
            (descEs ?? "").slice(0, 160) +
            (descEs && descEs.length > 160 ? "…" : ""),
        });
      } else {
        await ctx.runMutation(mSetGameDetails, {
          gameId: game._id as Id<"games">,
          description: descEs,
          genres: genresPV,
          overwrite,
        });
        updated++;
      }

      await sleep(300);
    }

    return {
      candidates: all.length,
      processed: batch.length,
      updated,
      dryRun,
      overwrite,
      sample: sample.slice(0, 10),
    };
  },
});
