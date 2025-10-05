// convex/mutations/admin/createGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

function cleanStr(input: string | null | undefined): string | undefined {
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  return t.length ? t : undefined;
}

function toNum(input: number | string | null | undefined): number | undefined {
  if (input == null) return undefined;
  if (typeof input === "number") return Number.isNaN(input) ? undefined : input;
  const n = Number(String(input).replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

export const createGame = mutation({
  args: {
    title: v.string(),

    description: v.optional(v.union(v.string(), v.null())),
    cover_url: v.optional(v.union(v.string(), v.null())),
    trailer_url: v.optional(v.union(v.string(), v.null())),

    // extras opcionales
    extraTrailerUrl: v.optional(v.union(v.string(), v.null())),
    extraImages: v.optional(v.array(v.string())),

    plan: v.union(v.literal("free"), v.literal("premium")),
    genres: v.optional(v.array(v.string())),

    weeklyPrice: v.optional(v.union(v.number(), v.string(), v.null())),
    purchasePrice: v.optional(v.union(v.number(), v.string(), v.null())),

    // embed (admite variantes)
    embed_url: v.optional(v.union(v.string(), v.null())),
    embedUrl: v.optional(v.union(v.string(), v.null())),
    embed_allow: v.optional(v.union(v.string(), v.null())),
    embedAllow: v.optional(v.union(v.string(), v.null())),
    embed_sandbox: v.optional(v.union(v.string(), v.null())),
    embedSandbox: v.optional(v.union(v.string(), v.null())),
  },
  handler: async ({ db }, args) => {
    const now = Date.now();

    const doc = {
      title: args.title,
      description: cleanStr(args.description),
      cover_url: cleanStr(args.cover_url),
      trailer_url: cleanStr(args.trailer_url),

      // extras
      extraTrailerUrl: cleanStr(args.extraTrailerUrl),
      extraImages:
        Array.isArray(args.extraImages) && args.extraImages.length
          ? args.extraImages.filter(Boolean)
          : undefined,

      plan: args.plan,
      createdAt: now,
      genres: args.genres && args.genres.length ? args.genres : undefined,

      // precios (schema usa weeklyPrice / purchasePrice)
      weeklyPrice: toNum(args.weeklyPrice),
      purchasePrice: toNum(args.purchasePrice),

      // embed (seteo ambas variantes que están en tu schema)
      embed_url: cleanStr(args.embed_url ?? args.embedUrl),
      embedUrl: cleanStr(args.embedUrl ?? args.embed_url),
      embed_allow: cleanStr(args.embed_allow ?? args.embedAllow),
      embedAllow: cleanStr(args.embedAllow ?? args.embed_allow),
      embed_sandbox: cleanStr(args.embed_sandbox ?? args.embedSandbox),
      embedSandbox: cleanStr(args.embedSandbox ?? args.embed_sandbox),
    } as const;

    const id = await db.insert("games", doc);
    return { ok: true, id };
  },
});
