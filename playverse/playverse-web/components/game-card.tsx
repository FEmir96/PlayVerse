// playverse-web/components/game-card.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";

type Props = {
  game: Doc<"games">;
};

/** Convierte ratings 0..100 → estrellas /5 con 1 decimal.
 *  Fallback: igdbUserRating → igdbRating → popscore.
 */
function getUserStars(g: any): number | null {
  const igdbUserRating = typeof g?.igdbUserRating === "number" ? g.igdbUserRating : undefined;
  const igdbRating = typeof g?.igdbRating === "number" ? g.igdbRating : undefined;
  const popscore = typeof g?.popscore === "number" ? g.popscore : undefined;

  const score100 =
    typeof igdbUserRating === "number"
      ? igdbUserRating
      : typeof igdbRating === "number"
      ? igdbRating
      : typeof popscore === "number"
      ? popscore
      : undefined;

  if (typeof score100 !== "number") return null;
  const stars = Math.round((score100 / 20) * 10) / 10; // 0..5, 1 decimal
  return stars > 0 ? stars : null;
}

export default function GameCard({ game }: Props) {
  const isPremium = (game as any).plan === "premium";
  const primaryGenre =
    (Array.isArray((game as any).genres) && (game as any).genres[0]) || "General";
  const href = `/juego/${game._id}`;

  // Ratio fijo para TODAS las portadas (consistencia visual).
  // IGDB cover_big ~ 2:3; pero 3/4 también funciona. Elegimos 2/3.
  const ASPECT = "aspect-[2/3]";

  // ⭐ rating de usuario (como en detalle)
  const userStars = getUserStars(game);

  return (
    <Link href={href}>
      <Card className="bg-slate-800 border-slate-700 gap-1 p-0 overflow-hidden hover:shadow-lg hover:shadow-orange-400/10 transition h-full flex flex-col">
        <div className="relative">
          {/* Género */}
          <Badge className="absolute top-3 left-3 bg-orange-400 text-slate-900 font-semibold z-10">
            {primaryGenre}
          </Badge>

          {/* Sello premium */}
          {isPremium && (
            <div className="absolute top-3 right-3 z-10">
              <div className="w-8 h-8 rounded-full bg-yellow-400/90 text-slate-900 grid place-items-center font-bold">
                ★
              </div>
            </div>
          )}

          {/* Portada: contenedor con ratio fijo + imagen cubriendo siempre */}
          <div className={`relative w-full ${ASPECT} bg-slate-800 overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(game as any).cover_url || "/placeholder_game.jpg"}
              alt={game.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* ⭐ fila rating (solo si hay dato) */}
          {typeof userStars === "number" && userStars > 0 && (
            <div
              className="flex items-center gap-1 mb-2"
              title={`User rating: ${userStars.toFixed(1)}/5`}
            >
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span className="text-orange-400 font-semibold">
                {userStars.toFixed(1)}
              </span>
            </div>
          )}

          <h3 className="text-orange-400 font-semibold text-lg mb-1 line-clamp-1">
            {game.title}
          </h3>

          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {game.description || "Sin descripción por ahora."}
          </p>

          <div className="mt-auto flex items-center justify-between text-sm text-slate-300">
            <span>Plan</span>
            <span className={isPremium ? "text-yellow-300" : "text-teal-300"}>
              {isPremium ? "Premium" : "Free"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
