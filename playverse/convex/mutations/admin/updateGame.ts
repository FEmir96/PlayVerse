// convex/mutations/admin/updateGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

function toNum(x: unknown): number | undefined {
  if (typeof x === "number") return Number.isFinite(x) ? x : undefined;
  if (typeof x === "string") {
    const s = x.replace(",", ".").trim();
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export const updateGame = mutation({
  args: {
    gameId: v.optional(v.id("games")),
    id: v.optional(v.id("games")),
    patch: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      cover_url: v.optional(v.union(v.string(), v.null())),
      trailer_url: v.optional(v.union(v.string(), v.null())),
      plan: v.optional(v.union(v.literal("free"), v.literal("premium"), v.string())),
      genres: v.optional(v.array(v.string())),

      // precios (permitimos number|string|null)
      purchasePrice: v.optional(v.union(v.number(), v.string(), v.null())),
      weeklyPrice: v.optional(v.union(v.number(), v.string(), v.null())),

      // NUEVO
      extraTrailerUrl: v.optional(v.union(v.string(), v.null())),
      extraImages: v.optional(v.array(v.string())),

      // Aliases tolerados
      price_buy: v.optional(v.union(v.number(), v.string(), v.null())),
      weekly_price: v.optional(v.union(v.number(), v.string(), v.null())),
      extra_images: v.optional(v.array(v.string())),
      extra_trailer_url: v.optional(v.union(v.string(), v.null())),
    }),
  },

  handler: async (ctx, { gameId, id, patch }) => {
    const gid = gameId ?? id;
    if (!gid) throw new Error("Falta gameId (o id).");

    const raw: Record<string, any> = { ...patch };

    // plan → minúsculas válidas
    if (typeof raw.plan === "string") {
      const p = raw.plan.trim().toLowerCase();
      raw.plan = p === "premium" ? "premium" : p === "free" ? "free" : undefined;
    }

    // Aliases → canónicos
    if (raw.price_buy !== undefined && raw.purchasePrice === undefined) {
      raw.purchasePrice = raw.price_buy; delete raw.price_buy;
    }
    if (raw.weekly_price !== undefined && raw.weeklyPrice === undefined) {
      raw.weeklyPrice = raw.weekly_price; delete raw.weekly_price;
    }
    if (raw.extra_images !== undefined && raw.extraImages === undefined) {
      raw.extraImages = raw.extra_images; delete raw.extra_images;
    }
    if (raw.extra_trailer_url !== undefined && raw.extraTrailerUrl === undefined) {
      raw.extraTrailerUrl = raw.extra_trailer_url; delete raw.extra_trailer_url;
    }

    // precios a número; null => ignorar
    if (raw.purchasePrice !== undefined) {
      if (raw.purchasePrice === null) delete raw.purchasePrice;
      else {
        const n = toNum(raw.purchasePrice);
        if (n === undefined) delete raw.purchasePrice; else raw.purchasePrice = n;
      }
    }
    if (raw.weeklyPrice !== undefined) {
      if (raw.weeklyPrice === null) delete raw.weeklyPrice;
      else {
        const n = toNum(raw.weeklyPrice);
        if (n === undefined) delete raw.weeklyPrice; else raw.weeklyPrice = n;
      }
    }

    // extraTrailerUrl: permitir limpiar si viene null/"" (lo ignoramos si null/empty)
    if (raw.extraTrailerUrl !== undefined) {
      const s = typeof raw.extraTrailerUrl === "string" ? raw.extraTrailerUrl.trim() : "";
      if (!s) delete raw.extraTrailerUrl;
      else raw.extraTrailerUrl = s;
    }

    // extraImages: filtrar vacíos
    if (raw.extraImages !== undefined) {
      if (Array.isArray(raw.extraImages)) {
        const imgs = raw.extraImages.map((x: any) => (typeof x === "string" ? x.trim() : ""))
          .filter(Boolean);
        if (!imgs.length) delete raw.extraImages;
        else raw.extraImages = imgs;
      } else {
        delete raw.extraImages;
      }
    }

    // Quitar null/undefined
    const toSave = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined && v !== null)
    );

    if (Object.keys(toSave).length > 0) {
      (toSave as any).updatedAt = Date.now();
      await ctx.db.patch(gid, toSave as any);
    }

    return { ok: true };
  },
});
