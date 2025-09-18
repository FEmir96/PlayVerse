// convex/functions/queries/getFreeGames.ts
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

export const getFreeGames = query(async ({ db }): Promise<Game[]> => {
  const games = await db.query("games").collect();
  return games.filter((game) => game.plan === "free") as Game[];
});
