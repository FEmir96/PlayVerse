// convex/functions/mutations/createGame.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createGame = mutation(
  async ({ db }, { title, description, cover_url, trailer_url, plan }: 
  { 
    title: string; 
    description?: string; 
    cover_url?: string; 
    trailer_url?: string; 
    plan: "free" | "premium"; // 👈 obligatorio ahora
  }) => {
    const now = Date.now();
    await db.insert("games", {
      title,
      description,
      cover_url,
      trailer_url,
      createdAt: now,
      plan, // 👈 agregado
    });
  }
);
