// playverse-web/app/mis-juegos/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, Clock, Filter, ArrowUpDown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import GameCard from "@/components/game-card";

type PurchaseRow = {
  _id: string;
  game?: { _id?: Id<"games">; title?: string; cover_url?: string };
  gameId?: Id<"games">;
  title?: string;
  createdAt?: number;
};

type RentalRow = {
  _id: string;
  game?: { _id?: Id<"games">; title?: string; cover_url?: string };
  gameId?: Id<"games">;
  expiresAt?: number | null;
};

type MinimalGame = {
  _id: Id<"games">;
  title: string;
  igdbId?: number | null;
  ageRatingLabel?: string | null;
};

const genres = ["Todos", "Acción", "RPG", "Carreras", "Shooter", "Sandbox", "Estrategia", "Deportes"];

export default function MisJuegosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"purchases" | "rentals">("purchases");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");

  // ===== Sesión (mismo patrón que en juego/[id]) =====
  const { data: session, status } = useSession();
  const email = useMemo(
    () => session?.user?.email?.toLowerCase() || null,
    [session?.user?.email]
  );
  const isLogged = Boolean(email);

  const profile = useQuery(
    api.queries.getUserByEmail.getUserByEmail as any,
    email ? { email } : "skip"
  ) as { _id: Id<"profiles">; role?: "free" | "premium" | "admin" } | null | undefined;

  // ✅ Traemos compras y alquileres
  const purchases = useQuery(
    api.queries.getUserPurchases.getUserPurchases as any,
    profile?._id ? { userId: profile._id } : "skip"
  ) as PurchaseRow[] | undefined;

  const rentals = useQuery(
    api.queries.getUserRentals.getUserRentals as any,
    profile?._id ? { userId: profile._id } : "skip"
  ) as RentalRow[] | undefined;

  // ✅ Listado mínimo de juegos para resolver id por título si hace falta
  const gamesMini =
    (useQuery(
      api.queries.listGamesMinimal.listGamesMinimal as any,
      {}
    ) as MinimalGame[] | undefined) || [];

  const titleLookup = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of gamesMini || []) {
      const key = String(g?.title || "").trim().toLowerCase();
      if (key) m.set(key, String(g._id));
    }
    return m;
  }, [gamesMini]);

  // Helper para obtener gid de manera robusta
  const resolveGameId = (explicitId?: Id<"games"> | string | null, titleMaybe?: string | null) => {
    if (explicitId) return String(explicitId);
    const key = String(titleMaybe || "").trim().toLowerCase();
    if (!key) return "";
    return titleLookup.get(key) || "";
  };

  const now = Date.now();
  const activeRentals =
    Array.isArray(rentals)
      ? rentals.filter((r) =>
          typeof r.expiresAt === "number" ? r.expiresAt > now : true
        )
      : [];

  // Filtrar compras por búsqueda
  const filteredPurchases = useMemo(() => {
    if (!purchases || !searchQuery.trim()) return purchases || [];
    const query = searchQuery.toLowerCase();
    return purchases.filter((p) => {
      const title = (p.game?.title || p.title || "").toLowerCase();
      return title.includes(query);
    });
  }, [purchases, searchQuery]);

  // Filtrar alquileres por búsqueda
  const filteredRentals = useMemo(() => {
    if (!activeRentals || !searchQuery.trim()) return activeRentals;
    const query = searchQuery.toLowerCase();
    return activeRentals.filter((r) => {
      const title = (r.game?.title || "").toLowerCase();
      return title.includes(query);
    });
  }, [activeRentals, searchQuery]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="min-h-[60vh] grid place-items-center text-slate-300">
          Cargando…
        </div>
      </div>
    );
  }

  if (!isLogged) {
    const goLogin = () => {
      const next =
        typeof window !== "undefined" ? window.location.pathname : "/mis-juegos";
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
    };

    return (
      <div className="min-h-screen bg-slate-900">
        {/* Header Section */}
        <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-4 tracking-wide">MIS JUEGOS</h1>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Tu biblioteca personal: títulos alquilados o comprados.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 max-w-3xl mx-auto text-center">
            <p className="text-slate-300 mb-6">
              Necesitás iniciar sesión para ver tus juegos.
            </p>
            <Button
              onClick={goLogin}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-4 tracking-wide">MIS JUEGOS</h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Tu biblioteca personal: títulos alquilados o comprados.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 justify-center mb-6">
            <Button
              variant={activeTab === "purchases" ? "default" : "outline"}
              onClick={() => setActiveTab("purchases")}
              className={`flex items-center gap-2 ${
                activeTab === "purchases"
                  ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                  : "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Mis compras
            </Button>
            <Button
              variant={activeTab === "rentals" ? "default" : "outline"}
              onClick={() => setActiveTab("rentals")}
              className={`flex items-center gap-2 ${
                activeTab === "rentals"
                  ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                  : "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              }`}
            >
              <Clock className="w-4 h-4" />
              Mis alquileres
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Ordenar
              </Button>
            </div>
          </div>

          {/* Genre filters */}
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={
                  selectedGenre === genre
                    ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                }
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {activeTab === "purchases" ? (
            <>
              {purchases === undefined ? (
                <div className="text-center text-slate-400">Cargando compras…</div>
              ) : !filteredPurchases.length ? (
                <div className="text-center text-slate-400">
                  {searchQuery ? "No se encontraron compras con ese nombre." : "No tienes compras todavía."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredPurchases.map((p) => {
                    const rawTitle = (p.game?.title || p.title || "Juego").toString().trim();
                    const gid = resolveGameId(
                      p.game?._id ?? p.gameId ?? null,
                      rawTitle
                    );
                    
                    // Crear un objeto game compatible con GameCard
                    const gameData: Doc<"games"> = {
                      _id: gid as Id<"games">,
                      title: rawTitle,
                      cover_url: p.game?.cover_url || "/placeholder.svg",
                      plan: "premium" as any,
                      genres: [],
                      createdAt: p.createdAt || Date.now(),
                      igdbId: null,
                      ageRatingLabel: null,
                      description: null,
                      trailer_url: null,
                      purchasePrice: null,
                      weeklyPrice: null,
                      isFree: false,
                      tags: ["Compra"],
                    } as any;

                    return (
                      <div key={p._id} className="relative">
                        <GameCard game={gameData} />
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                          Compra
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {rentals === undefined ? (
                <div className="text-center text-slate-400">Cargando alquileres…</div>
              ) : !filteredRentals.length ? (
                <div className="text-center text-slate-400">
                  {searchQuery ? "No se encontraron alquileres con ese nombre." : "No tienes alquileres activos."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredRentals.map((r) => {
                    const rawTitle = (r.game?.title || "Juego").toString().trim();
                    const gid = resolveGameId(
                      r.game?._id ?? r.gameId ?? null,
                      rawTitle
                    );
                    
                    // Crear un objeto game compatible con GameCard
                    const gameData: Doc<"games"> = {
                      _id: gid as Id<"games">,
                      title: rawTitle,
                      cover_url: r.game?.cover_url || "/placeholder.svg",
                      plan: "premium" as any,
                      genres: [],
                      createdAt: Date.now(),
                      igdbId: null,
                      ageRatingLabel: null,
                      description: null,
                      trailer_url: null,
                      purchasePrice: null,
                      weeklyPrice: null,
                      isFree: false,
                      tags: ["Alquiler"],
                    } as any;

                    return (
                      <div key={r._id} className="relative">
                        <GameCard game={gameData} />
                        <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                          Alquiler
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}