// playverse-web/app/juego/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Heart, Copy, Check, Play } from "lucide-react";

import { useQuery, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

type MediaItem = { type: "image" | "video"; src: string; thumb?: string };

function toEmbed(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }
    // Vimeo
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [thumbStart, setThumbStart] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbsPerView = 4;

  // Param estable
  const idParamRaw = params?.id;
  const idParam = Array.isArray(idParamRaw) ? idParamRaw[0] : idParamRaw;
  const hasId = Boolean(idParam);

  // Query SIEMPRE; sin id → "skip"
  const game = useQuery(
    api.queries.getGameById.getGameById as any,
    hasId ? ({ id: idParam as Id<"games"> } as any) : "skip"
  ) as Doc<"games"> | null | undefined;

  // Action screenshots
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
      out.push({ type: "video", src: trailerEmbed, thumb: (game as any)?.cover_url || undefined } as const);
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

  const nextThumbs = () => {
    if (thumbStart + thumbsPerView < media.length) setThumbStart((p) => p + 1);
  };
  const prevThumbs = () => {
    if (thumbStart > 0) setThumbStart((p) => p - 1);
  };

  const handlePurchase = () => {
    if (game?._id) router.push(`/checkout/compra/${game._id}`);
  };
  const handleRental = () => {
    if (game?._id) router.push(`/checkout/alquiler/${game._id}`);
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
              <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
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

              {/* Franja fija: título + género (debajo del box) */}
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
                                src={m.thumb || game.cover_url || "/placeholder.svg"}
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
                <p className="text-slate-300 leading-relaxed">{game.description ?? "Sin descripción"}</p>
              </div>
            </div>

            {/* Columna derecha (acciones) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
                <div className="text-center mb-4">
                  <p className="text-orange-400 text-sm mb-2">¡Suscribite a premium para más ventajas!</p>
                  <div className="text-xl font-semibold text-teal-400 mt-2">Alquiler semanal</div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handlePurchase} className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold">
                    Comprar ahora
                  </Button>
                  <Button
                    onClick={handleRental}
                    variant="outline"
                    className="w-full border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                  >
                    Alquilar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsFavorite((v) => !v)}
                      variant="outline"
                      className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                      Favoritos
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
                <h3 className="text-xl font-semibold text-orange-400 mb-4">Información del juego</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="text-white">{(game as any).plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Géneros:</span>
                    <span className="text-white">{((game as any).genres ?? []).join(", ") || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400/30 via-teal-500/30 to-purple-600/30 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">¿Quieres más?</h3>
                <p className="text-white/90 text-sm mb-4">Con premium descubrí acceso ilimitado al catálogo y descuentos exclusivos</p>
                <Link href="/premium">
                  <Button className="bg-white text-violet-800 hover:bg-slate-100 font-semibold">Descubre premium</Button>
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
            <DialogTitle className="text-orange-400 text-xl font-semibold">¡Comparte este juego!</DialogTitle>
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
              {copied ? (<><Check className="w-4 h-4 mr-2" />¡Copiado!</>) : (<><Copy className="w-4 h-4 mr-2" />Copiar link</>)}
            </Button>
            <p className="text-xs text-slate-400 text-center">El link se copió a tu portapapeles</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
