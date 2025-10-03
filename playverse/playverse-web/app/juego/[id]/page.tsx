// playverse-web/app/juego/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Copy,
  Check,
  Play,
  Star,
} from "lucide-react";

import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { useFavoritesStore } from "@/components/favoritesStore";

type MediaItem = { type: "image" | "video"; src: string; thumb?: string };

// ⬇️ Sólo activa favoritos del servidor si está seteado el flag
const ENABLE_SERVER_FAVORITES =
  process.env.NEXT_PUBLIC_USE_SERVER_FAVORITES === "1";

function toEmbed(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

/** ⭐ fila de estrellitas (0..5 con pasos 0.5 → mostramos número con una decimal) */
function StarRow({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  const full = Math.floor(rounded);
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className="w-4 h-4 text-orange-400"
          fill={i < full ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 text-orange-400 font-semibold">
        {rounded.toFixed(1)}/5
      </span>
    </div>
  );
}

export default function GameDetailPage() {
  const params = useParams() as { id?: string | string[] } | null;
  const router = useRouter();

  // UI state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHoverMain, setIsHoverMain] = useState(false);
  const thumbsPerView = 4;

  // Param estable
  const idParamRaw = params?.id;
  const idParam = Array.isArray(idParamRaw) ? (idParamRaw as string[])[0] : (idParamRaw as string | undefined);
  const hasId = Boolean(idParam);

  // Query de juego
  const game = useQuery(
    api.queries.getGameById.getGameById as any,
    hasId ? ({ id: idParam as Id<"games"> } as any) : "skip"
  ) as Doc<"games"> | null | undefined;

  // Action screenshots IGDB
  const fetchShots = useAction(
    api.actions.getIGDBScreenshots.getIGDBScreenshots as any
  );
  const [igdbUrls, setIgdbUrls] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!game?.title) return;
      try {
        const res = await fetchShots({
          title: game.title,
          limit: 8,
          size2x: true,
          minScore: 0.6,
          minScoreFallback: 0.45,
          includeVideo: false,
        } as any);
        if (!cancelled) {
          const urls = Array.isArray((res as any)?.urls) ? (res as any).urls : [];
          setIgdbUrls(urls);
        }
      } catch {
        if (!cancelled) setIgdbUrls([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [game?.title, fetchShots]);

  // Trailer de DB (si existe)
  const trailerEmbed = useMemo(() => {
    const url = (game as any)?.trailer_url ?? null;
    return toEmbed(url);
  }, [game?.trailer_url]);

  // Media combinada
  const media: MediaItem[] = useMemo(() => {
    const out: MediaItem[] = [];
    if (trailerEmbed) {
      out.push({
        type: "video",
        src: trailerEmbed,
        thumb: (game as any)?.cover_url || undefined,
      } as const);
    }
    if (Array.isArray(igdbUrls) && igdbUrls.length) {
      out.push(
        ...igdbUrls.map<MediaItem>((u) => ({ type: "image", src: u } as const))
      );
    }
    if (out.length === 0 && (game as any)?.cover_url) {
      out.push({ type: "image", src: (game as any).cover_url } as const);
    }
    return out;
  }, [trailerEmbed, igdbUrls, (game as any)?.cover_url]);

  // Asegurar índice válido
  useEffect(() => {
    if (selectedIndex >= media.length) setSelectedIndex(0);
  }, [media.length, selectedIndex]);

  // Slideshow auto con pausa en hover
  useEffect(() => {
    if (!media.length) return;
    if (isHoverMain) return;
    const t = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % media.length);
    }, 4000);
    return () => clearInterval(t);
  }, [media.length, isHoverMain]);

  const nextThumbs = () => {
    if (thumbStart + thumbsPerView < media.length) setThumbStart((p) => p + 1);
  };
  const prevThumbs = () => {
    if (thumbStart > 0) setThumbStart((p) => p - 1);
  };

  // ====== Sesión / Perfil / Validaciones ======
  const { data: session } = useSession();
  const localUser = useAuthStore((s) => s.user);
  const loggedEmail =
    session?.user?.email?.toLowerCase() || localUser?.email?.toLowerCase() || null;
  const isLogged = Boolean(loggedEmail);

  const profile = useQuery(
    api.queries.getUserByEmail.getUserByEmail as any,
    loggedEmail ? { email: loggedEmail } : "skip"
  ) as
    | (Doc<"profiles"> & { role?: "free" | "premium" | "admin" })
    | null
    | undefined;

  const rentals = useQuery(
    api.queries.getUserRentals.getUserRentals as any,
    profile?._id ? { userId: profile._id } : "skip"
  ) as
    | Array<{
        _id: string;
        game?: { _id?: Id<"games">; title?: string; cover_url?: string };
        gameId?: Id<"games">;
        expiresAt?: number | null;
      }>
    | undefined;

  const purchases = useQuery(
    api.queries.getUserPurchases.getUserPurchases as any,
    profile?._id ? { userId: profile._id } : "skip"
  ) as
    | Array<{
        _id: string;
        game?: { _id?: Id<"games">; title?: string; cover_url?: string };
        gameId?: Id<"games">;
        title?: string;
        createdAt?: number;
      }>
    | undefined;

  // ✅ (Opcional) Biblioteca
  const hasLibraryQuery =
    (api as any).queries?.getUserLibrary?.getUserLibrary ?? null;
  const library = useQuery(
    hasLibraryQuery as any,
    profile?._id && hasLibraryQuery ? { userId: profile._id } : "skip"
  ) as
    | Array<{
        game?: any;
        gameId?: Id<"games">;
        type?: string;
        kind?: string;
        owned?: boolean;
      }>
    | undefined;

  // ✅ (Opcional) Favoritos del servidor (sólo si el flag está activo)
  // ✅ Nunca pasamos null a useQuery; si no existe la query, usamos un fallback y "skip"
  const shouldRunServerFav =
    process.env.NEXT_PUBLIC_USE_SERVER_FAVORITES === "1" &&
    Boolean((api as any).queries?.getUserFavorites?.getUserFavorites) &&
    Boolean(profile?._id);

  // función a usar: la real si existe, o una cualquiera como fallback (no se ejecuta con "skip")
  const favoritesFnRef =
    shouldRunServerFav
      ? (api as any).queries.getUserFavorites.getUserFavorites
      : (api as any).queries.getGameById.getGameById; // fallback inocuo

  const serverFavorites = useQuery(
    favoritesFnRef as any,
    shouldRunServerFav ? ({ userId: (profile as any)._id } as any) : "skip"
  ) as
    | Array<{ game?: { _id?: Id<"games"> }; gameId?: Id<"games"> }>
    | undefined;

  const now = Date.now();

  // ── flags
  const isAdmin = profile?.role === "admin";
  const isPremiumPlan = (game as any)?.plan === "premium";
  const isFreePlan = (game as any)?.plan === "free";

  // Compras/Alquileres
  const hasPurchased = useMemo(() => {
    if (!game?._id) return false;
    const gid = String(game._id);
    const gtitle = String(game.title || "").trim().toLowerCase();

    const fromPurchases =
      Array.isArray(purchases) &&
      purchases.some((p) => {
        const pid = String(p?.game?._id ?? p?.gameId ?? "");
        if (pid && pid === gid) return true;
        const ptitle = String(p?.game?.title ?? p?.title ?? "")
          .trim()
          .toLowerCase();
        return !!gtitle && gtitle === ptitle;
      });

    const fromLibrary =
      Array.isArray(library) &&
      library.some((row) => {
        const idMatch = String(row?.game?._id ?? row?.gameId ?? "") === gid;
        const kind = String(row?.kind ?? row?.type ?? "").toLowerCase();
        return idMatch && (kind === "purchase" || row?.owned === true);
      });

    return !!fromPurchases || !!fromLibrary;
  }, [purchases, library, game?._id, game?.title]);

  const hasActiveRental = useMemo(() => {
    if (!game?._id || !Array.isArray(rentals)) return false;
    return rentals.some((r) => {
      const same = String(r?.game?._id ?? r?.gameId ?? "") === String(game._id);
      const active = typeof r.expiresAt === "number" ? r.expiresAt > now : true;
      return same && active;
    });
  }, [rentals, game?._id, now]);

  // ➜ ¿Es embebible?
  const isEmbeddable = useMemo(() => {
    const u = (game as any)?.embed_url ?? (game as any)?.embedUrl;
    return typeof u === "string" && u.trim().length > 0;
  }, [game]);

  // ====== NUEVO: permisos por suscripción premium ======
  const isPremiumSub = profile?.role === "premium";
  const canPlayBySubscription = isPremiumPlan && (isPremiumSub || isAdmin);
  const canPlayEffective = canPlayBySubscription || hasPurchased || hasActiveRental || isAdmin;

  const canExtend = !hasPurchased && hasActiveRental;
  const showBuyAndRent = !canPlayEffective;

  const requiresPremium =
    isPremiumPlan &&
    profile &&
    profile.role !== "premium" &&
    profile.role !== "admin";

  // ====== Toast & Favoritos ======
  const { toast } = useToast();
  const favItems = useFavoritesStore((s) => s.items);
  const addFav = useFavoritesStore((s) => s.add);
  const removeFav = useFavoritesStore((s) => s.remove);

  // Estado de favorito según servidor (si tenemos la query)
  const isFavServer = useMemo(() => {
    if (!serverFavorites || !game?._id) return undefined;
    const gid = String(game._id);
    return serverFavorites.some(
      (f) => String(f?.game?._id ?? f?.gameId ?? "") === gid
    );
  }, [serverFavorites, game?._id]);

  // Fallback: store local
  const isFavLocal = useMemo(() => {
    const byId = !!(game?._id && favItems.some((i) => i.id === String(game._id)));
    if (byId) return true;
    const title = String(game?.title || "").trim();
    return !!title && favItems.some((i) => i.title === title);
  }, [favItems, game?._id, game?.title]);

  // Valor final a usar en UI
  const isFav = (typeof isFavServer === "boolean" ? isFavServer : isFavLocal) as boolean;

  const [showAuthFav, setShowAuthFav] = useState(false);
  const [showAuthAction, setShowAuthAction] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // 🔁 Mutación Convex para favoritos
  const toggleFavoriteMutation = useMutation(
    api.mutations.toggleFavorite.toggleFavorite as any
  );

  // ========== HANDLERS ==========

  // Comprar → checkout, con tarifa plana si user FREE compra juego PREMIUM
  const handlePurchase = () => {
    if (!game?._id) return;
    const gid = String(game._id);

    if (hasPurchased) {
      toast({ title: "Ya lo tienes", description: "Este juego ya está en tu biblioteca." });
      router.push(`/juego/${gid}`);
      return;
    }

    // FREE comprando juego premium → checkout con tarifa plana
    if (isPremiumPlan && profile?.role === "free") {
      router.push(`/checkout/compra/${gid}?pricing=flat_premium`);
      return;
    }

    if (requiresPremium) {
      setShowPremiumModal(true);
      return;
    }

    router.push(`/checkout/compra/${gid}`);
  };

  // Alquilar
  const handleRental = () => {
    if (!game?._id) return;
    const gid = String(game._id);

    if (hasPurchased) {
      toast({ title: "Ya comprado", description: "Ya posees este título." });
      router.push(`/juego/${gid}`);
      return;
    }

    if (hasActiveRental) {
      toast({ title: "Alquiler activo", description: "Puedes extender tu alquiler." });
      router.push(`/checkout/extender/${gid}`);
      return;
    }

    if (requiresPremium) {
      setShowPremiumModal(true);
      return;
    }

    router.push(`/checkout/alquiler/${gid}`);
  };

  // Extender
  const handleExtend = () => {
    if (!game?._id) return;
    router.push(`/checkout/extender/${game._id}`);
  };

  /** ✅ “Jugar” */
  const handlePlay = () => {
    if (!game?._id) return;

    const playUrl = `/play/${game._id}`;

    if (isEmbeddable) {
      if (!isLogged) {
        router.push(`/auth/login?next=${encodeURIComponent(playUrl)}`);
        return;
      }
      if (isAdmin) {
        router.push(playUrl);
        return;
      }
      if (isFreePlan) {
        router.push(playUrl);
        return;
      }
      if (isPremiumPlan) {
        if (isPremiumSub) {
          router.push(playUrl);
          return;
        }
        if (!canPlayEffective) {
          toast({
            title: "No disponible",
            description: "Necesitás comprar o alquilar este juego para jugar.",
            variant: "destructive",
          });
          return;
        }
        router.push(playUrl);
        return;
      }
      router.push(playUrl);
      return;
    }

    // No embebible
    if (!isLogged) {
      setShowAuthAction(true);
      return;
    }
    if (!canPlayEffective) {
      toast({
        title: "No disponible",
        description: "Necesitás comprar o alquilar el juego para jugar.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Lanzando juego…", description: "¡Feliz gaming! 🎮" });
  };

  // ⭐ Favoritos (local + Convex) con alineación al resultado del server
  const onToggleFavorite = async () => {
    if (!game?._id) return;
    if (!isLogged || !profile?._id) {
      setShowAuthFav(true);
      return;
    }

    const item = {
      id: String(game._id),
      title: game.title ?? "Juego",
      cover: (game as any).cover_url ?? "/placeholder.svg",
      priceBuy: (game as any).price_buy ?? null,
      priceRent: (game as any).weekly_price ?? null,
    };

    let addedFromServer: boolean | undefined;

    try {
      const result = await toggleFavoriteMutation({
        userId: profile._id as Id<"profiles">,
        gameId: game._id as Id<"games">,
      } as any);

      // Soportar varias formas de respuesta
      if (typeof result === "boolean") {
        addedFromServer = result;
      } else if (result && typeof result === "object") {
        addedFromServer =
          (result.added === true) ||
          (result.status === "added") ||
          (result.result === "added");
      }
    } catch (err) {
      console.error("toggleFavorite Convex error:", err);
      toast({
        title: "No se pudo actualizar en el servidor",
        description: "Se intentará nuevamente más tarde.",
        variant: "destructive",
      });
    }

    // Fallback: si el server no dijo, invertimos el estado actual
    if (typeof addedFromServer !== "boolean") {
      addedFromServer = !isFav;
    }

    // Actualizar store local según lo que realmente pasó en server
    if (addedFromServer) {
      addFav(item);
      toast({
        title: "Añadido a favoritos",
        description: `${item.title} se agregó a tu lista.`,
      });
    } else {
      removeFav(item.id);
      toast({
        title: "Quitado de favoritos",
        description: `${item.title} se quitó de tu lista.`,
      });
    }

    // Notificar a otros componentes (dropdown, etc.)
    try {
      window.dispatchEvent(new Event("pv:favorites:changed"));
    } catch {}
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const isLoading = hasId && game === undefined;
  const notFound = hasId && game === null;
  const current = media[selectedIndex];

  // 🟠 ratings
  const igdbRating = (game as any)?.igdbRating as number | undefined;
  const igdbUserRating = (game as any)?.igdbUserRating as number | undefined;

  const score100 =
    typeof igdbUserRating === "number"
      ? igdbUserRating
      : typeof igdbRating === "number"
      ? igdbRating
      : undefined;

  const userStars =
    typeof score100 === "number" ? +(score100 / 20).toFixed(1) : undefined;

  // Fecha formateada
  const firstReleaseDate = (game as any)?.firstReleaseDate as number | undefined;
  const releaseStr =
    typeof firstReleaseDate === "number"
      ? new Date(firstReleaseDate).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : undefined;

  // Otros metadatos
  const developers = ((game as any)?.developers as string[] | undefined) ?? [];
  const publishers = ((game as any)?.publishers as string[] | undefined) ?? [];
  const languages = ((game as any)?.languages as string[] | undefined) ?? [];
  const ageRatingSystem = (game as any)?.ageRatingSystem as string | undefined;
  const ageRatingLabel = (game as any)?.ageRatingLabel as string | undefined;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {!hasId && (
          <div className="p-6 text-slate-300">Juego no encontrado.</div>
        )}
        {hasId && isLoading && (
          <div className="p-6 text-slate-300">Cargando…</div>
        )}
        {hasId && notFound && (
          <div className="p-6 text-slate-300">Juego no encontrado.</div>
        )}

        {hasId && game && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Columna izquierda (media) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Media box */}
              <div
                className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden"
                onMouseEnter={() => setIsHoverMain(true)}
                onMouseLeave={() => setIsHoverMain(false)}
              >
                {current?.type === "video" ? (
                  <iframe
                    src={current.src}
                    title={game.title}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <Image
                    src={current?.src || "/placeholder.svg"}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Franja fija: título + género */}
              <div className="bg-slate-800/70 border border-orange-400/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-orange-400">{game.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-400 text-slate-900 hover:bg-orange-500">
                    {(game as any).genres?.[0] || "Acción"}
                  </Badge>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={prevThumbs}
                    variant="outline"
                    size="icon"
                    disabled={thumbStart === 0}
                    className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {media
                      .slice(thumbStart, thumbStart + thumbsPerView)
                      .map((m, idx) => {
                        const i = thumbStart + idx;
                        const selected = i === selectedIndex;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                              selected ? "border-orange-400" : "border-slate-600"
                            }`}
                            title={
                              m.type === "video" ? "Trailer" : `Screenshot ${i + 1}`
                            }
                          >
                            {m.type === "video" ? (
                              <>
                                <Image
                                  src={
                                    m.thumb ||
                                    (game as any).cover_url ||
                                    "/placeholder.svg"
                                  }
                                  alt="Trailer"
                                  width={120}
                                  height={68}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 grid place-items-center">
                                  <div className="bg-white/90 text-slate-900 rounded-full p-1">
                                    <Play className="w-4 h-4" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <Image
                                src={m.src}
                                alt={`${game.title} screenshot ${i + 1}`}
                                width={120}
                                height={68}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </button>
                        );
                      })}
                  </div>

                  <Button
                    onClick={nextThumbs}
                    variant="outline"
                    size="icon"
                    disabled={thumbStart + thumbsPerView >= media.length}
                    className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-orange-400 mb-4">
                  Descripción
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {game.description ?? "Sin descripción"}
                </p>
              </div>
            </div>

            {/* Columna derecha (acciones + info) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Acciones */}
              <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
                <div className="text-center mb-4">
                  <p className="text-orange-400 text-sm">
                    ¡Suscribite a premium para más ventajas!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* ➜ Free + embebible → botón jugar directo */}
                  {isEmbeddable && (game as any).plan === "free" ? (
                    <Button
                      onClick={handlePlay}
                      className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold"
                    >
                      Jugar gratis
                    </Button>
                  ) : canPlayEffective ? (
                    <>
                      <Button
                        onClick={handlePlay}
                        className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold"
                      >
                        Jugar
                      </Button>
                      {canExtend && (
                        <Button
                          onClick={handleExtend}
                          variant="outline"
                          className="w-full border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                        >
                          Extender
                        </Button>
                      )}
                    </>
                  ) : (
                    showBuyAndRent && (
                      <>
                        <Button
                          onClick={handlePurchase}
                          className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold"
                        >
                          Comprar ahora
                        </Button>
                        <Button
                          onClick={handleRental}
                          variant="outline"
                          className="w-full border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                        >
                          Alquilar
                        </Button>
                      </>
                    )
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={onToggleFavorite}
                      variant="outline"
                      className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                    >
                      <Heart
                        className="w-4 h-4 mr-2"
                        fill={isFav ? "currentColor" : "none"}
                      />
                      {isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                    </Button>
                    <Button
                      onClick={() => setShowShareModal(true)}
                      variant="outline"
                      size="icon"
                      className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Información del juego */}
              <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-orange-400 mb-4">
                  Información del juego
                </h3>

                <div className="space-y-3 text-sm">
                  {/* ⭐ User rating */}
                  {typeof userStars === "number" && userStars > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">User rating:</span>
                      <StarRow value={userStars} />
                    </div>
                  )}

                  {/* Clasificación */}
                  {ageRatingLabel && ageRatingLabel !== "Not Rated" && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clasificación:</span>
                      <span className="text-orange-400 font-semibold">
                        {ageRatingSystem
                          ? `${ageRatingSystem} ${ageRatingLabel}`
                          : ageRatingLabel}
                      </span>
                    </div>
                  )}

                  {/* Fecha de lanzamiento */}
                  {releaseStr && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lanzamiento:</span>
                      <span className="text-white">{releaseStr}</span>
                    </div>
                  )}

                  {/* Desarrollador / Editor */}
                  {developers.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Desarrollador:</span>
                      <span className="text-white">{developers.join(", ")}</span>
                    </div>
                  )}
                  {publishers.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Editor:</span>
                      <span className="text-white">{publishers.join(", ")}</span>
                    </div>
                  )}

                  {/* Idiomas */}
                  {languages.length > 0 && (
                    <div className="">
                      <span className="block text-slate-400 mb-2">Idiomas:</span>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang, idx) => (
                          <Badge
                            key={idx}
                            className="bg-teal-500/20 border border-teal-400/30 text-teal-200 hover:bg-teal-500/30"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400/30 via-teal-500/30 to-purple-600/30 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">¿Quieres más?</h3>
                <p className="text-white/90 text-sm mb-4">
                  Con premium descubrí acceso ilimitado al catálogo y descuentos exclusivos
                </p>
                <Link href="/premium">
                  <Button className="bg-white text-violet-800 hover:bg-slate-100 font-semibold">
                    Descubre premium
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="bg-slate-800 border-orange-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-400 text-xl font-semibold">
              ¡Comparte este juego!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300 text-center">
              Comparte este increíble juego con tus amigos y que también disfruten de esta aventura épica.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-orange-400/20">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Link del juego:</p>
                  <p className="text-white text-sm font-mono bg-slate-900/50 p-2 rounded border truncate">
                    {typeof window !== "undefined" ? window.location.href : ""}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                } catch {}
              }}
              className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar link
                </>
              )}
            </Button>
            <p className="text-xs text-slate-400 text-center">
              El link se copió a tu portapapeles
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: login requerido (Favoritos) */}
      <Dialog open={showAuthFav} onOpenChange={setShowAuthFav}>
        <DialogContent className="bg-slate-800 border-orange-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-400 text-xl font-semibold">
              Inicia sesión para continuar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300 text-center">
              Para añadir a favoritos debes iniciar sesión o registrarte.
            </p>
          </div>
          {/* Footer original: alineado a la derecha */}
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAuthFav(false)}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const next =
                  typeof window !== "undefined"
                    ? window.location.pathname
                    : `/juego/${String(game?._id ?? "")}`;
                window.location.href = `/auth/login?next=${encodeURIComponent(
                  next
                )}`;
              }}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900"
            >
              Iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: login requerido (Comprar / Alquilar / Jugar) */}
      <Dialog open={showAuthAction} onOpenChange={setShowAuthAction}>
        <DialogContent className="bg-slate-800 border-orange-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-orange-400 text-xl font-semibold">
              Inicia sesión para continuar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300 text-center">
              Para continuar debes iniciar sesión o registrarte.
            </p>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAuthAction(false)}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const next =
                  typeof window !== "undefined"
                    ? window.location.pathname
                    : `/juego/${String(game?._id ?? "")}`;
                window.location.href = `/auth/login?next=${encodeURIComponent(
                  next
                )}`;
              }}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900"
            >
              Iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: requiere plan Premium */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
          <DialogContent className="bg-slate-800 border-orange-400/30 text-white max-w-md">
    {/* ⬇️ CENTRADO */}
    <DialogHeader className="text-center items-center">
      <DialogTitle className="text-orange-400 text-xl font-semibold text-center mx-auto">
        Se requiere PREMIUM
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <p className="text-slate-300 text-center">
        Para jugar o alquilar este título es necesario contar con la
        suscripción <span className="text-amber-300 font-semibold">PREMIUM</span> de PlayVerse.
      </p>
    </div>

          {/* ⬇️ Botones uno en cada punta */}
          <DialogFooter className="w-full">
            <div className="w-full flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPremiumModal(false)}
                className="rounded-xl px-5 py-2.5
                           bg-slate-800/40 text-slate-200
                           border border-slate-500/60
                           shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25)]
                           hover:text-white hover:bg-slate-700/50
                           hover:border-orange-400/60
                           hover:shadow-[0_0_0_3px_rgba(251,146,60,0.15)]
                           focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-orange-400/60
                           transition-colors"
              >
                Cancelar
              </Button>

              <Button
                onClick={() => {
                  window.location.href = "/checkout/premium?plan=monthly";
                }}
                className="rounded-xl px-5 py-2.5
                           bg-orange-400 text-slate-900 font-semibold
                           shadow-[0_8px_24px_rgba(251,146,60,0.35)]
                           hover:bg-orange-500
                           focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-orange-400/70
                           active:translate-y-[1px]
                           transition"
              >
                Upgrade Plan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
