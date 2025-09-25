// playverse-web/components/featured-rail.tsx
"use client";

import { useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import GameCard from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FeaturedRail() {
  const list = useQuery(api.queries.getGames.getGames, {}) as Doc<"games">[] | undefined;

  if (!list) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const featured = [...list]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 12);

  return <HorizontalCarousel items={featured} />;
}

function HorizontalCarousel({ items }: { items: Doc<"games">[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const delta = dir === "left" ? -el.clientWidth : el.clientWidth;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Seleccionados</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollBy("left")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollBy("right")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {items.map((g) => (
          <div key={g._id} className="min-w-[260px] snap-start">
            <GameCard game={g} />
          </div>
        ))}
      </div>
    </div>
  );
}
