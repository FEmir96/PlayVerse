// playverse-web/app/mis-juegos/page.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Import RELATIVO para evitar el error del alias en esta ruta
import FavoritesGrid from "../../components/FavoritesGrid";

import { useAuthStore } from "@/lib/useAuthStore";

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

function GameCard({
  title,
  cover,
  badge,
  href,
}: {
  title: string;
  cover?: string | null;
  badge?: string | null;
  href?: string;
}) {
  const content = (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden transition-transform duration-150 group-hover:-translate-y-0.5">
      <div className="relative aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white line-clamp-2">
            {title}
          </h3>
          {badge && (
            <Badge className="bg-orange-400 text-slate-900">{badge}</Badge>
          )}
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="group block focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-xl"
    >
      {content}
    </Link>
  ) : (
    <div className="group">{content}</div>
  );
}

export default function MisJuegosPage() {
  const router = useRouter();

  // ===== Sesión (mismo patrón que en juego/[id]) =====
  const { data: session, status } = useSession();
  const localUser = useAuthStore((s) => s.user);
  const email = useMemo(
    () =>
      session?.user?.email?.toLowerCase() ||
      localUser?.email?.toLowerCase() ||
      null,
    [session?.user?.email, localUser?.email]
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

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] grid place-items-center text-slate-300">
        Cargando…
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
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 text-center mb-3">
            MIS JUEGOS
          </h1>
          <p className="text-center text-slate-300 mb-8">
            Tu biblioteca personal: títulos alquilados o comprados.
          </p>

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

          <div className="max-w-5xl mx-auto mt-10">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Buscar por título..."
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 bg-transparent"
              >
                Filtros
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 bg-transparent"
              >
                Ordenar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "Todos",
                "Acción",
                "RPG",
                "Carreras",
                "Shooter",
                "Sandbox",
                "Estrategia",
                "Deportes",
              ].map((g) => (
                <Badge
                  key={g}
                  className={`${
                    g === "Todos"
                      ? "bg-yellow-500 text-slate-900"
                      : "bg-slate-800 border border-slate-700 text-slate-300"
                  } cursor-default`}
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-center text-slate-400 mt-10">
            Iniciá sesión para ver tu biblioteca.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 text-center mb-3">
          MIS JUEGOS
        </h1>
        <p className="text-center text-slate-300 mb-8">
          Tu biblioteca personal: títulos alquilados o comprados.
        </p>

        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Buscar por título..."
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 bg-transparent"
            >
              Filtros
            </Button>
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 bg-transparent"
            >
              Ordenar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Todos",
              "Acción",
              "RPG",
              "Carreras",
              "Shooter",
              "Sandbox",
              "Estrategia",
              "Deportes",
            ].map((g) => (
              <Badge
                key={g}
                className={`${
                  g === "Todos"
                    ? "bg-yellow-500 text-slate-900"
                    : "bg-slate-800 border border-slate-700 text-slate-300"
                } cursor-default`}
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>

        {/* FAVORITOS (a /juego/[id]) */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-orange-400">Favoritos</h2>
          </div>
          <FavoritesGrid userId={profile?._id} />
        </section>

        {/* COMPRADOS → /juego/[id] (con fallback por título) */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-orange-400">Comprados</h2>
          </div>

          {purchases === undefined ? (
            <div className="text-slate-400">Cargando compras…</div>
          ) : !purchases.length ? (
            <div className="text-slate-400">No hay compras todavía.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {purchases.map((p) => {
                const rawTitle = (p.game?.title || p.title || "Juego").toString().trim();
                const gid = resolveGameId(
                  p.game?._id ?? p.gameId ?? null,
                  rawTitle
                );
                const cover = p.game?.cover_url || "/placeholder.svg";
                const href = gid ? `/juego/${gid}` : undefined;

                return (
                  <GameCard
                    key={p._id}
                    title={rawTitle}
                    cover={cover}
                    badge="Compra"
                    href={href}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ALQUILERES ACTIVOS → /juego/[id] (también con fallback por título por si acaso) */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-orange-400">
              Alquileres activos
            </h2>
          </div>

          {rentals === undefined ? (
            <div className="text-slate-400">Cargando alquileres…</div>
          ) : !activeRentals.length ? (
            <div className="text-slate-400">No tienes alquileres activos.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {activeRentals.map((r) => {
                const rawTitle = (r.game?.title || "Juego").toString().trim();
                const gid = resolveGameId(
                  r.game?._id ?? r.gameId ?? null,
                  rawTitle
                );
                const cover = r.game?.cover_url || "/placeholder.svg";
                const href = gid ? `/juego/${gid}` : undefined;

                return (
                  <GameCard
                    key={r._id}
                    title={rawTitle}
                    cover={cover}
                    badge="Alquiler"
                    href={href}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
