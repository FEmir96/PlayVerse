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
} from "lucide-react";

import { useQuery, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { useFavoritesStore } from "@/components/favoritesStore";

type MediaItem = { type: "image" | "video"; src: string; thumb?: string };

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
  theId: {
  }
  const idParam = Array.isArray(idParamRaw) ? idParamRaw[0] : idParamRaw;
  const hasId = Boolean(idParam);

  // Query de juego
  const game = useQuery(
    api.queries.getGameById.getGameById as any,
    hasId ? ({ id: idParam as Id<"games"> } as any) : "skip"
  ) as Doc<"games"> | null | undefined;

  // Action screenshots IGDB
  const fetchShots = useAction(api.actions.getIGDBScreenshots.getIGDBScreenshots as any);
  const [igdbUrls, setIgdbUrls] = useState<string[] | null>(null);

  // Cargar screenshots IGDB cuando haya título
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
      out.push(...igdbUrls.map<MediaItem>((u) => ({ type: "image", src: u } as const)));
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
      setSelectedIndex((prev) => ((prev + 1) % media.length));
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

  // ✅ (Opcional) Biblioteca para reforzar "comprado" si tu backend la expone
  const hasLibraryQuery =
    (api as any).queries?.getUserLibrary?.getUserLibrary ?? null;
  const library = useQuery(
    hasLibraryQuery as any,
    profile?._id && hasLibraryQuery ? { userId: profile._id } : "skip"
  ) as
    | Array<{ game?: any; gameId?: Id<"games">; type?: string; kind?: string; owned?: boolean }>
    | undefined;

  const now = Date.now();

  // 🧠 Match robusto para "comprado": por id, por título y/o por biblioteca
  const hasPurchased = useMemo(() => {
    if (!game?._id) return false;
    const gid = String(game._id);
    const gtitle = String(game.title || "").trim().toLowerCase();

    const fromPurchases =
      Array.isArray(purchases) &&
      purchases.some((p) => {
        const pid = String(p?.game?._id ?? p?.gameId ?? "");
        if (pid && pid === gid) return true;
        const ptitle = String(p?.game?.title ?? p?.title ?? "").trim().toLowerCase();
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

  // Reglas de UI
  const canPlay = hasPurchased || hasActiveRental;
  const canExtend = !hasPurchased && hasActiveRental;
  const showBuyAndRent = !hasPurchased && !hasActiveRental;

  const requiresPremium =
    (game as any)?.plan === "premium" &&
    profile &&
    profile.role !== "premium" &&
    profile.role !== "admin";

  // ====== Toast & Favoritos ======
  const { toast } = useToast();
  const favItems = useFavoritesStore((s) => s.items);
  const addFav = useFavoritesStore((s) => s.add);
  const removeFav = useFavoritesStore((s) => s.remove);

  // Estado reactivo: si está en favoritos
  const isFav = useMemo(() => {
    const byId = !!(game?._id && favItems.some((i) => i.id === String(game._id)));
    if (byId) return true;
    const title = String(game?.title || "").trim();
    return !!title && favItems.some((i) => i.title === title);
  }, [favItems, game?._id, game?.title]);

  const [showAuthFav, setShowAuthFav] = useState(false);
  const [showAuthAction, setShowAuthAction] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Handlers navegación
  const handlePurchase = () => {
    if (!game?._id) return;
    if (!isLogged) return setShowAuthAction(true);
    if (requiresPremium) return setShowPremiumModal(true);
    router.push(`/checkout/compra/${game._id}`);
  };

  const handleRental = () => {
    if (!game?._id) return;
    if (!isLogged) return setShowAuthAction(true);
    if (requiresPremium) return setShowPremiumModal(true);
    router.push(`/checkout/alquiler/${game._id}`);
  };

  const handleExtend = () => {
    if (!game?._id) return;
    if (!isLogged) return setShowAuthAction(true);
    // 👉 a la página de extender
    router.push(`/checkout/extender/${game._id}`);
  };

  const handlePlay = () => {
    if (!isLogged) return setShowAuthAction(true);
    if (!canPlay) {
      toast({
        title: "No disponible",
        description: "Necesitás comprar o alquilar el juego para jugar.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Lanzando juego…", description: "¡Feliz gaming! 🎮" });
  };

  const onToggleFavorite = () => {
    if (!game?._id) return;
    if (!isLogged) return setShowAuthFav(true);

    const item = {
      id: String(game._id),
      title: game.title ?? "Juego",
      cover: (game as any).cover_url ?? "/placeholder.svg",
      priceBuy: (game as any).price_buy ?? null,
      priceRent: (game as any).weekly_price ?? null,
    };

    if (isFav) {
      removeFav(item.id);
      toast({ title: "Quitado de favoritos", description: `${item.title} se quitó de tu lista.` });
    } else {
      addFav(item);
      toast({ title: "Añadido a favoritos", description: `${item.title} se agregó a tu lista.` });
    }
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {!hasId && <div className="p-6 text-slate-300">Juego no encontrado.</div>}
        {hasId && isLoading && <div className="p-6 text-slate-300">Cargando…</div>}
        {hasId && notFound && <div className="p-6 text-slate-300">Juego no encontrado.</div>}

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
                <h1 className="text-2xl font-bold text-white">{game.title}</h1>
                <Badge className="bg-orange-400 text-slate-900 hover:bg-orange-500">
                  {(game.genres && game.genres[0]) || "Acción"}
                </Badge>
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
                    {media.slice(thumbStart, thumbStart + thumbsPerView).map((m, idx) => {
                      const i = thumbStart + idx;
                      const selected = i === selectedIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedIndex(i)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                            selected ? "border-orange-400" : "border-slate-600"
                          }`}
                          title={m.type === "video" ? "Trailer" : `Screenshot ${i + 1}`}
                        >
                          {m.type === "video" ? (
                            <>
                              <Image
                                src={m.thumb || (game as any).cover_url || "/placeholder.svg"}
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
                <h3 className="text-xl font-semibold text-orange-400 mb-4">Descripción</h3>
                <p className="text-slate-300 leading-relaxed">
                  {game.description ?? "Sin descripción"}
                </p>
              </div>
            </div>

            {/* Columna derecha (acciones) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
                <div className="text-center mb-4">
                  <p className="text-orange-400 text-sm">
                    ¡Suscribite a premium para más ventajas!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* SOLO JUGAR si está comprado */}
                  {hasPurchased ? (
                    <Button
                      onClick={handlePlay}
                      className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold"
                    >
                      Jugar
                    </Button>
                  ) : canPlay ? (
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

              <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-orange-400 mb-4">
                  Información del juego
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="text-white">{(game as any).plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Géneros:</span>
                    <span className="text-white">
                      {((game as any).genres ?? []).join(", ") || "—"}
                    </span>
                  </div>
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
                window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
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
                window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
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
          <DialogHeader>
            <DialogTitle className="text-orange-400 text-xl font-semibold">
              Se requiere PREMIUM
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300 text-center">
              Para jugar o alquilar este título es necesario contar con la
              suscripción <span className="text-amber-300 font-semibold">PREMIUM</span> de PlayVerse.
            </p>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPremiumModal(false)}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/checkout/premium?plan=monthly";
              }}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900"
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
