// convex/functions/mutations/seed.ts
import { mutation } from "../../_generated/server";

export const seedGames = mutation(async ({ db }) => {
  const now = Date.now();

  // Catálogo de juegos con tipado estricto
  const games: { title: string; plan: "free" | "premium" }[] = [
    { title: "Resident Evil 9", plan: "premium" },
    { title: "Lego Horizon Adventures", plan: "premium" },
    { title: "Resident Evil Village", plan: "premium" },
    { title: "Grounded", plan: "premium" },
    { title: "Assassins Creed Mirage", plan: "premium" },
    { title: "Sid Meier's Civilization VI", plan: "premium" },
    { title: "MineCraft", plan: "premium" },
    { title: "Age Of Empires IV", plan: "premium" },
    { title: "Ori and the Will of the Wisps", plan: "premium" },
    { title: "Bluey: El VideoJuego", plan: "free" },
    { title: "Fallout Shelter", plan: "free" },
    { title: "Hades", plan: "premium" },
    { title: "Hello Neighbor 2", plan: "premium" },
    { title: "Hi Fi Rush", plan: "premium" },
    { title: "Halo The MasterChief Collection", plan: "premium" },
    { title: "Sea of Thieves", plan: "premium" },
    { title: "Lego Star Wars: The SkyWalker Saga", plan: "premium" },
    { title: "Rolling Hills: Make Sushi Make Friends", plan: "free" },
    { title: "Venba", plan: "premium" },
    { title: "Vampire Survivors", plan: "free" },
    { title: "Two Point Hospital", plan: "premium" },
    { title: "Twelve Minutes", plan: "premium" },
    { title: "World of Warcraft: The War Within", plan: "premium" },
    { title: "CupHead", plan: "premium" },
    { title: "Candy Crush", plan: "free" },
    { title: "Descenders", plan: "premium" },
    { title: "Destiny 2", plan: "premium" },
    { title: "Forza Motorsport", plan: "premium" },
    { title: "Forza Horizon 5", plan: "premium" },
    { title: "Return To Monkey Island", plan: "premium" },
    { title: "Sable", plan: "premium" },
    { title: "Among Us", plan: "free" },
    { title: "Indiana Jones and the Great Circle", plan: "premium" },
  ];

  for (const game of games) {
    await db.insert("games", {
      title: game.title,
      description: `Descripción de ${game.title} próximamente...`,
      cover_url: undefined, // se pueden cargar más tarde
      trailer_url: undefined,
      plan: game.plan, // ahora sí es "free" | "premium"
      createdAt: now,
    });
  }

  return { inserted: games.length };
});
