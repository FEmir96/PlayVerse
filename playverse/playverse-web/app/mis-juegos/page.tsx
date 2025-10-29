// playverse-web/app/mis-juegos/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingBag,
  Clock,
  Filter,
  ArrowUpDown,
  Play,
  Repeat2,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { CoverBox } from "@/components/CoverBox";

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
  genres?: string[] | null;
};

const genres = [
  "Todos",
  "Acción",
  "RPG",
  "Carreras",
  "Shooter",
  "Sandbox",
  "Estrategia",
  "Deportes",
];

const norm = (s?: string | null) => String(s || "").trim().toLowerCase();
function fmtDate(ts?: number | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

/* ────────────────── CARD ────────────────── */
type LibraryCardProps = {
  id: string;
  title: string;
  cover?: string | null;
  genre?: string | null;
  kind: "rental" | "purchase";
  expiresAt?: number | null;
};
function LibraryCard({
  id,
  title,
  cover,
  genre,
  kind,
  expiresAt,
}: LibraryCardProps) {
    // Obtener datos del juego para mostrar el badge de plan (free/premium)
    const gameDoc = useQuery(
      (api as any).queries.getGameById.getGameById as any,
      id ? ({ id } as any) : "skip"
    ) as (Doc<"games"> | null | undefined);
    const isPremiumPlan = (gameDoc as any)?.plan === "premium";
  const isRental = kind === "rental";
  const now = Date.now();
  const isExpired = isRental && typeof expiresAt === "number" && expiresAt <= now;

  const playHref = `/play/${id}`;
  const extendHref = `/checkout/extender/${id}`;

  return (
    <div
      className="
        rounded-2xl bg-slate-900 border border-slate-700
        hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10
        transition-all duration-200 overflow-hidden
      "
    >
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-400 text-slate-900 px-2 py-0.5">
              {genre || "Acción"}
            </Badge>
          </div>

          <div>
            <Badge className={`font-semibold px-2 py-0.5 text-xs ${
              isPremiumPlan
                ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-slate-900"
                : "bg-teal-400 text-slate-900"
            }`}>
              {isPremiumPlan ? "Premium" : "Free"}
            </Badge>
          </div>
        </div>
        <CoverBox
          src={cover || "/placeholder.svg"}
          alt={title}
          ratio="5/7"
          fit="cover"
          className="rounded-xl"
        />
      </div>

      <div className="px-5 pb-5 pt-4">
        <h3 className="text-slate-100 font-semibold text-xl">{title}</h3>

        {isRental ? (
          isExpired ? (
            <p className="mt-3 text-[13px] font-semibold text-rose-300">Caducado</p>
          ) : (
            <p className="mt-3 text-[13px] font-semibold text-emerald-300">
              Válido hasta el {fmtDate(expiresAt)}
            </p>
          )
        ) : (
          <p className="mt-3 text-[13px] text-slate-300">Compra permanente</p>
        )}

        <div className="mt-4 flex items-center gap-3">
          {/* Jugar (naranja) */}
          <Link href={playHref} className="flex-1">
            <Button
              className="
                w-full justify-center gap-2 rounded-xl
                bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold
                focus-visible:ring-2 focus-visible:ring-orange-400/70
              "
            >
              <Play className="w-4 h-4" />
              Jugar
            </Button>
          </Link>

          {/* Extender / Renovar (celeste claro, no se oscurece) */}
          {isRental && (
            <Link href={extendHref}>
              <Button
                variant="outline"
                className="
                  rounded-xl px-4
                  bg-sky-500/15 text-sky-200
                  border border-sky-400/40
                  hover:bg-sky-500/25 hover:text-white
                  focus-visible:ring-2 focus-visible:ring-sky-400/60
                "
              >
                <Repeat2 className="w-4 h-4 mr-2" />
                {isExpired ? "Renovar" : "Extender"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────── PAGE ────────────────── */
export default function MisJuegosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"purchases" | "rentals">("purchases");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");

  // ← Lee ?tab=... cuando cambia la URL (o al cargar)
  useEffect(() => {
    const t = (searchParams?.get("tab") || "").toLowerCase();
    if (t === "rentals" || t === "purchases") {
      setActiveTab(t as "purchases" | "rentals");
    }
  }, [searchParams]);

  // Helper para cambiar pestaña y reflejar en la URL sin recargar
  const setTab = (t: "purchases" | "rentals") => {
    setActiveTab(t);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", t);
    router.replace(`${pathname}?${params.toString()}`);
  };

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

  const purchases = useQuery(
    api.queries.getUserPurchases.getUserPurchases as any,
    profile?._id ? { userId: profile._id } : "skip"
  ) as PurchaseRow[] | undefined;

  const rentals = useQuery(
    api.queries.getUserRentals.getUserRentals as any,
    profile?._id ? { userId: profile._id } : "skip"
  ) as RentalRow[] | undefined;

  const gamesMini =
    (useQuery(api.queries.listGamesMinimal.listGamesMinimal as any, {}) as
      | MinimalGame[]
      | undefined) || [];

  const titleLookup = useMemo(() => {
    const m = new Map<string, { id: string; genre?: string | null }>();
    for (const g of gamesMini || []) {
      const key = norm(g?.title);
      if (key) m.set(key, { id: String(g._id), genre: g.genres?.[0] || null });
    }
    return m;
  }, [gamesMini]);

  const resolveGame = (
    explicitId?: Id<"games"> | string | null,
    titleMaybe?: string | null
  ) => {
    if (explicitId) return { id: String(explicitId), genre: null as string | null };
    const hit = titleLookup.get(norm(titleMaybe));
    return { id: hit?.id || "", genre: hit?.genre || null };
  };

  // Dedup compras
  const dedupePurchases = (rows: PurchaseRow[]) => {
    const seen = new Set<string>();
    const out: PurchaseRow[] = [];
    for (const p of rows) {
      const t = p.game?.title || p.title || "";
      const resolved = resolveGame(p.game?._id ?? p.gameId ?? null, t);
      const key = resolved.id || norm(t);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
    return out;
  };

  // Dedup alquileres (queda el de mayor vencimiento)
  const dedupeRentals = (rows: RentalRow[]) => {
    const best = new Map<string, RentalRow>();
    for (const r of rows) {
      const t = r.game?.title || "";
      const resolved = resolveGame(r.game?._id ?? r.gameId ?? null, t);
      const key = resolved.id || norm(t);
      if (!key) continue;
      const prev = best.get(key);
      if (!prev) best.set(key, r);
      else {
        const a = typeof (prev.expiresAt ?? 0) === "number" ? (prev.expiresAt as number) : 0;
        const b = typeof (r.expiresAt ?? 0) === "number" ? (r.expiresAt as number) : 0;
        if (b > a) best.set(key, r);
      }
    }
    return Array.from(best.values());
  };

  const now = Date.now();
  const activeRentals =
    Array.isArray(rentals)
      ? rentals.filter((r) =>
          typeof r.expiresAt === "number" ? r.expiresAt > now : true
        )
      : [];

  // Filtrar + dedup compras
  const filteredPurchases = useMemo(() => {
    const list = purchases || [];
    const deduped = dedupePurchases(list);
    if (!searchQuery.trim() && selectedGenre === "Todos") return deduped;
    const query = norm(searchQuery);
    return deduped.filter((p) => {
      const title = norm(p.game?.title || p.title);
      const { genre } = resolveGame(p.game?._id ?? p.gameId ?? null, title);
      const genreOk = selectedGenre === "Todos" || genre === selectedGenre;
      const queryOk = !query || title.includes(query);
      return genreOk && queryOk;
    });
  }, [purchases, searchQuery, selectedGenre]);

  // Filtrar + dedup alquileres
  const filteredRentals = useMemo(() => {
    const list = activeRentals;
    const deduped = dedupeRentals(list);
    if (!searchQuery.trim() && selectedGenre === "Todos") return deduped;
    const query = norm(searchQuery);
    return deduped.filter((r) => {
      const title = norm(r.game?.title);
      const { genre } = resolveGame(r.game?._id ?? r.gameId ?? null, title);
      const genreOk = selectedGenre === "Todos" || genre === selectedGenre;
      const queryOk = !query || title.includes(query);
      return genreOk && queryOk;
    });
  }, [activeRentals, searchQuery, selectedGenre]);

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

      {/* Tabs */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 justify-center mb-6">
            <Button
              variant={activeTab === "purchases" ? "default" : "outline"}
              onClick={() => setTab("purchases")}
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
              onClick={() => setTab("rentals")}
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

      {/* Search + filtros */}
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

      {/* Contenido */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {activeTab === "purchases" ? (
            <>
              {purchases === undefined ? (
                <div className="text-center text-slate-400">Cargando compras…</div>
              ) : !filteredPurchases.length ? (
                <div className="text-center text-slate-400">
                  {searchQuery
                    ? "No se encontraron compras con ese nombre."
                    : "No tienes compras todavía."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                  {filteredPurchases.map((p) => {
                    const rawTitle = (p.game?.title || p.title || "Juego")
                      .toString()
                      .trim();
                    const hitTitle = p.game?.title || p.title || "";
                    const { id: gid, genre } = resolveGame(
                      p.game?._id ?? p.gameId ?? null,
                      hitTitle
                    );

                    return (
                      <LibraryCard
                        key={p._id}
                        id={gid}
                        title={rawTitle}
                        cover={p.game?.cover_url}
                        genre={genre}
                        kind="purchase"
                      />
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
                  {searchQuery
                    ? "No se encontraron alquileres con ese nombre."
                    : "No tienes alquileres activos."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                  {filteredRentals.map((r) => {
                    const rawTitle = (r.game?.title || "Juego").toString().trim();
                    const hitTitle = r.game?.title || "";
                    const { id: gid, genre } = resolveGame(
                      r.game?._id ?? r.gameId ?? null,
                      hitTitle
                    );

                    return (
                      <LibraryCard
                        key={r._id}
                        id={gid}
                        title={rawTitle}
                        cover={r.game?.cover_url}
                        genre={genre}
                        kind="rental"
                        expiresAt={r.expiresAt ?? null}
                      />
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
