"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import type { Id, Doc } from "../_generated/dataModel";
import type { FunctionReference } from "convex/server";

// 💡 OJO: triple nivel (carpeta → archivo → export)
const qGetGames = (api as any).queries.getGames.getGames as FunctionReference<"query">;
// si querés fallback por plan:
const qGetFreeGames = (api as any).queries.getFreeGames?.getFreeGames as
  | FunctionReference<"query">
  | undefined;
const qGetPremiumGames = (api as any).queries.getPremiumGames?.getPremiumGames as
  | FunctionReference<"query">
  | undefined;

const mSetGameCoverUrl =
  (api as any).mutations.setGameCoverUrl.setGameCoverUrl as FunctionReference<"mutation">;

const IGDB_IMG_BASE = "https://images.igdb.com/igdb/image/upload/";
const SIZE_COVER = (x2: boolean) => (x2 ? "t_cover_big_2x" : "t_cover_big");
const ALLOWED = /^https:\/\/images\.igdb\.com\/igdb\/image\/upload\//i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const coverUrlFromImageId = (image_id: string, x2: boolean) =>
  `${IGDB_IMG_BASE}${SIZE_COVER(x2)}/${image_id}.jpg`;

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

type IGDBGame = { id: number; name: string; cover?: { image_id: string } | number };

async function igdbFindCoverByTitle(
  title: string,
  size2x: boolean
): Promise<{ url: string; match: string } | null> {
  const { token, clientId } = await getIgdbToken();

  const base = normalizeTitle(title);
  const simple = base.split(":")[0].split("-")[0].trim();
  const aliases = TITLE_ALIASES[base.toLowerCase()] ?? [];

  const queries = [
    `search "${base.replace(/"/g, '\\"')}"; fields name,cover.image_id,cover; where version_parent = null; limit 1;`,
    `search "${simple.replace(/"/g, '\\"')}"; fields name,cover.image_id,cover; limit 1;`,
    ...aliases.map(
      (a) =>
        `search "${a.replace(/"/g, '\\"')}"; fields name,cover.image_id,cover; limit 1;`
    ),
  ];

  for (const q of queries) {
    const r = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: { "Client-ID": clientId, Authorization: `Bearer ${token}` },
      body: q,
    });
    const data = (await r.json()) as IGDBGame[];

    if (Array.isArray(data) && data[0]) {
      const g = data[0];

      if (g.cover && typeof g.cover === "object" && "image_id" in g.cover) {
        return { url: coverUrlFromImageId((g.cover as any).image_id, size2x), match: g.name };
      }
      if (typeof g.cover === "number") {
        const r2 = await fetch("https://api.igdb.com/v4/covers", {
          method: "POST",
          headers: { "Client-ID": clientId, Authorization: `Bearer ${token}` },
          body: `fields image_id; where id = ${g.cover}; limit 1;`,
        });
        const c = (await r2.json()) as { image_id: string }[];
        if (Array.isArray(c) && c[0]?.image_id) {
          return { url: coverUrlFromImageId(c[0].image_id, size2x), match: g.name };
        }
      }
    }
    await sleep(250);
  }
  return null;
}

type CoverResult = {
  dryRun: boolean;
  overwrite: boolean;
  size2x: boolean;
  candidates: number;
  processed: number;
  updated: number;
  sample: any[];
};

export const backfillCoversFromIGDB = action({
  args: {
    dryRun: v.boolean(),
    overwrite: v.optional(v.boolean()),
    size2x: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { dryRun, overwrite = false, size2x = true, limit }
  ): Promise<CoverResult> => {
    // 1) Traer juegos (tu getGames.ts)
    let all: Doc<"games">[] = [];
    try {
      all = (await ctx.runQuery(qGetGames, {} as any)) as Doc<"games">[];
    } catch {
      // opcional: fallback por plan si también los tenés
      if (qGetFreeGames && qGetPremiumGames) {
        const free = (await ctx.runQuery(qGetFreeGames, {} as any)) as Doc<"games">[];
        const prem = (await ctx.runQuery(qGetPremiumGames, {} as any)) as Doc<"games">[];
        const byId = new Map<string, Doc<"games">>();
        for (const g of [...free, ...prem]) byId.set(g._id as unknown as string, g);
        all = [...byId.values()];
      } else {
        throw new Error(
          "No puedo invocar queries.getGames.getGames (ni los fallbacks). Verificá los paths y corré `npx convex dev`."
        );
      }
    }

    const pending = all.filter((g) => overwrite || !g.cover_url || g.cover_url.trim() === "");
    const batch = typeof limit === "number" ? pending.slice(0, Math.max(0, limit)) : pending;

    let updated = 0;
    const sample: any[] = [];

    for (const g of batch) {
      const found = await igdbFindCoverByTitle(g.title, size2x);
      if (!found) {
        sample.push({ title: g.title, note: "sin match en IGDB" });
        continue;
      }

      const url = found.url;
      if (!ALLOWED.test(url)) {
        sample.push({ title: g.title, match: found.match, note: "URL no permitida" });
        continue;
      }

      if (dryRun) {
        sample.push({ title: g.title, match: found.match, url });
      } else {
        await ctx.runMutation(mSetGameCoverUrl, {
          gameId: g._id as Id<"games">,
          coverUrl: url,
        });
        updated++;
      }
      await sleep(250);
    }

    return {
      dryRun,
      overwrite,
      size2x,
      candidates: all.length,
      processed: batch.length,
      updated,
      sample: sample.slice(0, 12),
    };
  },
});
