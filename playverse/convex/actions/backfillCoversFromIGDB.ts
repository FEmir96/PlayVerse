"use node";
/// <reference types="node" />

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

/** ========= Helpers ========= **/
const STOPWORDS = new Set(["the","of","and","edition","editions","deluxe","ultimate","definitive","remastered","remake",
"goty","complete","collection","director","directors","cut","hd","enhanced","year","gold","platinum","el","la","los",
"las","de","del","y","edicion","definitiva","remasterizado","remasterizada","completa","coleccion","aniversario","juego",
"videojuego","videjuego","tm","©","®"]);

const ROMAN_TO_INT: Record<string, number> =
 {i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9,x:10,xi:11,xii:12,xiii:13,xiv:14,xv:15,xvi:16,xvii:17,xviii:18,xix:19,xx:20};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/['’]/g,"").replace(/&/g," and ").toLowerCase();

const tok = (s: string) =>
  norm(s).replace(/[^a-z0-9\s]/g," ").split(/\s+/).map(t => ROMAN_TO_INT[t] ? String(ROMAN_TO_INT[t]) : t)
  .filter(Boolean).filter(t => !STOPWORDS.has(t));

const set = (a: string[]) => new Set(a);
const jaccard = (A: Set<string>, B: Set<string>) => {
  let inter = 0; for (const x of A) if (B.has(x)) inter++;
  const uni = A.size + B.size - inter; return uni === 0 ? 0 : inter/uni;
};

/** tokens “distintivos”: largos (≥4) o numéricos (2,3,4…) */
function distinctiveTokens(title: string): string[] {
  const tks = tok(title);
  return tks.filter(t => t.length >= 4 || /^\d+$/.test(t));
}

function baseVariants(original: string): string[] {
  const raw = original.trim();
  const out = new Set<string>([raw]);
  const cut = raw.split(/[:\-–—\|]/)[0].trim(); if (cut && cut !== raw) out.add(cut);
  out.add(raw.replace(/[™©®]/g,"").trim());
  return Array.from(out);
}

/** ========= IGDB ========= **/
type IgdbGame = { name?: string; cover?: { image_id?: string }; alternative_names?: { name?: string }[] };

async function getToken(clientId: string, clientSecret: string): Promise<string> {
  const r = await fetch("https://id.twitch.tv/oauth2/token", {
    method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
  });
  if (!r.ok) throw new Error(`Twitch token ${r.status}`);
  const j = await r.json() as { access_token: string }; return j.access_token;
}

async function igdbSearch(clientId: string, token: string, q: string): Promise<IgdbGame[]> {
  const r = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}`, "Accept":"application/json" },
    body: q,
  });
  if (!r.ok) return [];
  return await r.json() as IgdbGame[];
}

/** Busca con variantes + ranking por similaridad.
 *  Requiere tokens distintivos presentes en el candidato (si hay).
 */
async function smartCover(
  clientId: string, token: string, title: string, minScore = 0.55
): Promise<string | null> {
  const variants = baseVariants(title);
  const titleTokens = tok(title);
  const need = new Set(distinctiveTokens(title)); // p.ej. miles, morales, 2…

  let bestImg: string | null = null, bestScore = 0;

  for (const v of variants) {
    const arr = await igdbSearch(clientId, token,
      `search "${v.replace(/"/g,'\\"')}"; fields name,cover.image_id,alternative_names.name; limit 7;`
    );

    for (const g of arr) {
      const names = [g.name ?? "", ...(g.alternative_names?.map(x => x.name ?? "") ?? [])].filter(Boolean);
      const candTokens = set(tok(names.join(" ")));

      // 👉 si hay tokens distintivos, exigimos que todos estén en el candidato
      let missing = false;
      for (const t of need) if (!candTokens.has(t)) { missing = true; break; }
      if (missing) continue;

      const score = jaccard(set(titleTokens), candTokens);
      const img = g.cover?.image_id ?? null;
      if (!img) continue;

      if (score >= minScore && score > bestScore) {
        bestScore = score; bestImg = img;
        if (score >= 0.75) return img; // match fuerte → corto
      }
    }
  }
  return bestImg;
}

/** ========= Action ========= **/

type Item = { title: string; url?: string; note?: string };
type Result = { candidates: number; updated: number; sample: Item[]; dryRun: boolean };

export const backfillCoversFromIGDB = action({
  args: {
    dryRun: v.optional(v.boolean()),
    size2x: v.optional(v.boolean()),
    minScore: v.optional(v.number()),         // default 0.55
    // overrides manuales (título → URL absoluta)
    overrides: v.optional(v.array(v.object({ title: v.string(), url: v.string() }))),
  },
  handler: async (ctx, args): Promise<Result> => {
    const dryRun = args.dryRun ?? true;
    const minScore = args.minScore ?? 0.55;
    const size = args.size2x ? "t_cover_big_2x" : "t_cover_big";

    const clientId = process.env.TWITCH_CLIENT_ID as string | undefined;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET as string | undefined;
    if (!clientId || !clientSecret) throw new Error("Faltan TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET");

    const token = await getToken(clientId, clientSecret);

    const games: Doc<"games">[] = await ctx.runQuery(
      api.queries.listGamesWithoutCover.listGamesWithoutCover, {}
    );

    // index de overrides para lookup O(1)
    const overrideMap = new Map<string,string>(
      (args.overrides ?? []).map(o => [o.title.trim().toLowerCase(), o.url])
    );

    const results: Item[] = [];

    for (const g of games) {
      // 0) override manual exacto por título
      const override = overrideMap.get(g.title.trim().toLowerCase());
      if (override) {
        results.push({ title: g.title, url: override });
        if (!dryRun) {
          await ctx.runMutation(api.mutations.setGameCoverUrl.setGameCoverUrl,
            { gameId: g._id as Id<"games">, coverUrl: override });
        }
        continue;
      }

      // 1) búsqueda estricta inteligente
      const imageId = await smartCover(clientId, token, g.title, minScore);

      if (!imageId) {
        results.push({ title: g.title, note: "Sin cover (tokens distintivos no matchearon)" });
        continue;
      }

      const url = `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
      results.push({ title: g.title, url });

      if (!dryRun) {
        await ctx.runMutation(api.mutations.setGameCoverUrl.setGameCoverUrl,
          { gameId: g._id as Id<"games">, coverUrl: url });
      }
    }

    return { candidates: games.length, updated: results.filter(r => r.url).length, sample: results.slice(0, 10), dryRun };
  },
});
