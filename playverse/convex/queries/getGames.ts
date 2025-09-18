// convex/functions/queries/getGames.ts
import { query } from "../_generated/server";
import { Id } from "../_generated/dataModel"; // 👈 Para tipar bien los _id

// Definimos el tipo del juego según lo que insertamos en "seed.ts"
export type Game = {
  _id: Id<"games">; // 👈 Mejor tipado que string
  title: string;
  description?: string;
  cover_url?: string;
  trailer_url?: string;
  plan: "free" | "premium";
  createdAt: number;
};

export const getGames = query(async ({ db }): Promise<Game[]> => {
  const games = await db.query("games").order("desc").collect(); 
  // 👆 opcional: order("desc") para que los últimos insertados aparezcan primero

  return games as Game[];
});
