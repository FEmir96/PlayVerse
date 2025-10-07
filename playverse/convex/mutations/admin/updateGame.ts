// convex/mutations/admin/updateGame.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";

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

      purchasePrice: v.optional(v.union(v.number(), v.string(), v.null())),
      weeklyPrice: v.optional(v.union(v.number(), v.string(), v.null())),

      extraTrailerUrl: v.optional(v.union(v.string(), v.null())),
      extraImages: v.optional(v.array(v.string())),

      // aliases tolerados
      price_buy: v.optional(v.union(v.number(), v.string(), v.null())),
      weekly_price: v.optional(v.union(v.number(), v.string(), v.null())),
      extra_images: v.optional(v.array(v.string())),
      extra_trailer_url: v.optional(v.union(v.string(), v.null())),
    }),
  },

  handler: async (ctx, { gameId, id, patch }) => {
    const gid = gameId ?? id;
    if (!gid) throw new Error("Falta gameId (o id).");

    // 1) Traer estado actual para comparar cambios
    const before = await ctx.db.get(gid);
    if (!before) throw new Error("Juego no encontrado");

    const raw: Record<string, any> = { ...patch };

    // plan → normalizar
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

    // precios a número; null => limpiar
    if (raw.purchasePrice !== undefined) {
      if (raw.purchasePrice === null) {
        raw.purchasePrice = null;
      } else {
        const n = toNum(raw.purchasePrice);
        raw.purchasePrice = n ?? null;
      }
    }
    if (raw.weeklyPrice !== undefined) {
      if (raw.weeklyPrice === null) {
        raw.weeklyPrice = null;
      } else {
        const n = toNum(raw.weeklyPrice);
        raw.weeklyPrice = n ?? null;
      }
    }

    // clearables: string | null, normalizar vacíos a null
    const clearableStrings = ["cover_url", "trailer_url", "extraTrailerUrl"] as const;
    for (const k of clearableStrings) {
      if (k in raw) {
        if (raw[k] === null) {
          raw[k] = null;
        } else if (typeof raw[k] === "string") {
          const s = raw[k].trim();
          raw[k] = s.length ? s : null;
        } else {
          raw[k] = null;
        }
      }
    }

    // extraImages: [] limpia, normalizar strings
    if (raw.extraImages !== undefined) {
      if (Array.isArray(raw.extraImages)) {
        const imgs = raw.extraImages
          .map((x: any) => (typeof x === "string" ? x.trim() : ""))
          .filter(Boolean);
        raw.extraImages = imgs; // [] si quedó vacío
      } else {
        raw.extraImages = [];
      }
    }

    // Filtrar undefined; permitir null/[] en campos clearables
    const allowNull = new Set(["cover_url", "trailer_url", "extraTrailerUrl", "purchasePrice", "weeklyPrice"]);
    const toSave = Object.fromEntries(
      Object.entries(raw).filter(([k, v]) => v !== undefined && (v !== null || allowNull.has(k)))
    );

    // 2) Si no hay nada para guardar, cortar
    if (Object.keys(toSave).length === 0) {
      return { ok: true, changed: [] as string[] };
    }

    // 3) Detectar cambios por categorías (comparando con `before`)
    const changed: string[] = [];

    const changedField = (k: keyof typeof before | string) => {
      // @ts-ignore
      const prev = (before as any)[k];
      const next = (toSave as any)[k];
      return (k in toSave) && JSON.stringify(prev) !== JSON.stringify(next);
    };

    // Texto
    const textChanged: string[] = [];
    if (changedField("title")) textChanged.push("título");
    if (changedField("description")) textChanged.push("sinopsis");

    // Precios
    const priceChanged: string[] = [];
    if (changedField("purchasePrice")) priceChanged.push("precio de compra");
    if (changedField("weeklyPrice")) priceChanged.push("precio de alquiler");

    // Meta
    const metaChanged: string[] = [];
    if (changedField("genres")) metaChanged.push("géneros");
    if (changedField("plan")) metaChanged.push("plan");

    // Media
    const mediaChanged: string[] = [];
    if (changedField("cover_url")) mediaChanged.push("portada");
    if (changedField("trailer_url")) mediaChanged.push("trailer principal");
    if (changedField("extraTrailerUrl")) mediaChanged.push("trailer extra");
    if (changedField("extraImages")) mediaChanged.push("imágenes");

    if (textChanged.length) changed.push(...textChanged);
    if (priceChanged.length) changed.push(...priceChanged);
    if (metaChanged.length) changed.push(...metaChanged);
    if (mediaChanged.length) changed.push(...mediaChanged);

    // 4) Guardar
    (toSave as any).updatedAt = Date.now();
    await ctx.db.patch(gid, toSave as any);

    // 5) Notificar interesados (favoritos + transacciones del juego)
    if (changed.length > 0) {
      const interestedUserIds = new Set<Id<"profiles">>();

      // Favoritos por juego
      const favs = await ctx.db
        .query("favorites")
        .withIndex("by_game", (q) => q.eq("gameId", gid))
        .take(10000);
      for (const f of favs) interestedUserIds.add(f.userId);

      // Transacciones por juego
      const txs = await ctx.db
        .query("transactions")
        .withIndex("by_game", (q) => q.eq("gameId", gid))
        .take(10000);
      for (const t of txs) interestedUserIds.add(t.userId);

      if (interestedUserIds.size > 0) {
        const title = `Actualización: ${before.title ?? "Juego"}`;

        const hadMedia = mediaChanged.length > 0;
        const hadNonMedia = textChanged.length > 0 || priceChanged.length > 0 || metaChanged.length > 0;

        const makeMsg = () => {
          const parts: string[] = [];
          if (textChanged.length) parts.push(`texto (${textChanged.join(", ")})`);
          if (priceChanged.length) parts.push(`precios (${priceChanged.join(", ")})`);
          if (metaChanged.length) parts.push(`metadatos (${metaChanged.join(", ")})`);
          if (mediaChanged.length) parts.push(`multimedia (${mediaChanged.join(", ")})`);
          return `Se actualizaron: ${parts.join("; ")}.`;
        };

        const now = Date.now();

        // Insertar 1 notificación por usuario
        await Promise.all(
          Array.from(interestedUserIds).map((uid) => {
            const type = hadMedia && !hadNonMedia ? "media-added" : "game-update";
            return ctx.db.insert("notifications", {
              userId: uid,
              type: type as any,
              title,
              message: makeMsg(),
              gameId: gid,
              transactionId: undefined,
              isRead: false,
              readAt: undefined,
              createdAt: now,
              meta: {
                changed,
                mediaChanged,
                textChanged,
                priceChanged,
                metaChanged,
              },
            });
          })
        );
      }
    }

    return { ok: true, changed };
  },
});
