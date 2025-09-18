// convex/functions/queries/getPremiumGames.ts
import { query } from "../_generated/server";

type Game = {
  _id: string;
  title: string;
  description: string;
  cover_url?: string;
  trailer_url?: string;
  plan: "free" | "premium";
  createdAt: number;
};

export const getPremiumGames = query(async ({ db }): Promise<Game[]> => {
  const games = await db.query("games").collect();
  return games.filter((game) => game.plan === "premium") as Game[];
});
