"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import GameCard from "@/components/game-card";
import { useAuthStore } from "@/lib/useAuthStore";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useSession } from "next-auth/react";

const GENRES = ["Todos", "Acción", "RPG", "Carreras", "Shooter", "Sandbox", "Estrategia", "Deportes"];

export default function MisJuegosPage() {
  const { user } = useAuthStore();
  const { data: session, status } = useSession();

  // ✅ email efectivo: primero sesión de Google, si no, el del store
  const loginEmail = useMemo(
    () =>
      (session?.user?.email?.toLowerCase() ||
        user?.email?.toLowerCase() ||
        null),
    [session?.user?.email, user?.email]
  );

  // ✅ flag de login (sirve para la UI de “iniciar sesión”)
  const isLogged = Boolean(loginEmail);

  // ✅ perfil Convex: se skippea hasta tener email
  const profile =
    useQuery(
      api.queries.getUserByEmail.getUserByEmail as any,
      loginEmail ? { email: loginEmail } : undefined
    ) ?? null;

  // ✅ biblioteca: se skippea hasta tener _id de usuario
  const library =
    useQuery(
      api.queries.getUserLibrary.getUserLibrary as any,
      profile?._id ? { userId: profile._id } : undefined
    ) ?? [];

  // 🔒 DEDUPE: normalizamos y deduplicamos por _id de juego
  const uniqueLibrary: Doc<"games">[] = useMemo(() => {
    const arr = Array.isArray(library) ? (library as any[]) : [];
    const seen = new Set<string>();
    const out: Doc<"games">[] = [];

    for (const row of arr) {
      // Por si la query devuelve objetos “library” con { game } o { gameId }:
      const g = (row?.game ?? row) as any;
      const id =
        String(g?._id ?? row?.gameId ?? row?.id ?? "").trim();

      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(g as Doc<"games">);
    }
    return out;
  }, [library]);

  // UI state
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtros en memoria (sobre la lista YA deduplicada)
  const filtered: Doc<"games">[] = useMemo(() => {
    let items = uniqueLibrary;

    if (selectedGenre !== "Todos") {
      items = items.filter((g) => (g.genres ?? []).includes(selectedGenre));
    }
    if (searchQuery.trim()) {
      const n = searchQuery.toLowerCase();
      items = items.filter((g) => (g.title ?? "").toLowerCase().includes(n));
    }
    return items;
  }, [uniqueLibrary, selectedGenre, searchQuery]);

  // Estado cargando: sesión (next-auth) o queries (Convex)
  const isLoading = status === "loading" || profile === undefined || library === undefined;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-4 tracking-wide">
            MIS JUEGOS
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Tu biblioteca personal: títulos alquilados o comprados.
          </p>
        </div>
      </section>

      {/* Si no hay sesión, CTA para loguearse */}
      {!isLogged && (
        <div className="container mx-auto px-4 mt-8">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-slate-300 mb-4">
              Necesitás iniciar sesión para ver tus juegos.
            </p>
            <a href="/auth/login">
              <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold">
                Iniciar sesión
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* Barra de búsqueda / filtros */}
      <section className="py-8 bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Ordenar
              </Button>
            </div>
          </div>

          {/* Géneros */}
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {GENRES.map((g) => (
              <Button
                key={g}
                variant={selectedGenre === g ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(g)}
                className={
                  selectedGenre === g
                    ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                }
              >
                {g}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <p className="text-slate-400">Cargando tu biblioteca…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-400">
              {isLogged
                ? "Todavía no tenés juegos alquilados o comprados."
                : "Iniciá sesión para ver tu biblioteca."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {filtered.map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
