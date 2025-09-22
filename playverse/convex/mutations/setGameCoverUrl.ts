import { mutation } from "../_generated/server";
import { v } from "convex/values";

// convex/mutations/setGameCoverUrl.ts
const ALLOWED = /^https:\/\/(images\.igdb\.com|image\.api\.playstation\.com|shared\.akamai\.steamstatic\.com|bnetcmsus-a\.akamaihd\.net|res\.cloudinary\.com)\//i;

export const setGameCoverUrl = mutation({
  args: { gameId: v.id("games"), coverUrl: v.string() },
  handler: async (ctx, { gameId, coverUrl }) => {
    if (!ALLOWED.test(coverUrl)) throw new Error("Dominio de imagen no permitido");
    await ctx.db.patch(gameId, { cover_url: coverUrl }); // 👈 snake_case según tu schema
    return { ok: true };
  },
});
