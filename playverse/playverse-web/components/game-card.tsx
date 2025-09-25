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

// Heurística simple: si la URL suena a screenshot/banner la tratamos como landscape.
function isLandscapeFromUrl(url?: string) {
  if (!url) return false;
  return /screenshot|artwork|banner|widescreen|hero|landscape/i.test(url);
}

export default function GameCard({ game }: Props) {
  const isPremium = game.plan === "premium";
  const primaryGenre = (game.genres && game.genres[0]) || "General";
  const href = `/juego/${game._id}`; // Id<"games"> -> string por template literal

  const landscape = isLandscapeFromUrl(game.cover_url);
  const aspectClass = landscape ? "aspect-video" : "aspect-[3/4]";
  const objectClass = landscape ? "object-cover" : "object-contain";

  return (
    <Link href={href}>
      <Card className="bg-slate-800 border-slate-700 gap-1 p-0 overflow-hidden hover:shadow-lg hover:shadow-orange-400/10 transition">
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

          {/* Portada con manejo de orientación */}
          <div className={`relative w-full ${aspectClass} bg-slate-800 overflow-hidden`}>
            {/* Fondo blur para portrait (evita “cajas” vacías) */}
            {!landscape && game.cover_url && (
              <div
                className="absolute inset-0 blur-xl opacity-30 scale-110"
                style={{
                  backgroundImage: `url(${game.cover_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.cover_url || "/placeholder_game.jpg"}
              alt={game.title}
              className={`relative z-[1] w-full h-full ${objectClass}`}
              loading="lazy"
            />
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span className="text-orange-400 font-semibold">4.5</span>
          </div>

          <h3 className="text-orange-400 font-semibold text-lg mb-1 line-clamp-1">
            {game.title}
          </h3>

          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {game.description || "Sin descripción por ahora."}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-300">
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
