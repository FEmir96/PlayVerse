"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Heart, Eye, EyeOff, Copy, Check } from "lucide-react";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

export default function GameDetailPage() {
  const params = useParams() as { id?: string } | null;
  const router = useRouter();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbnailsPerView = 4;

  const idParam = params?.id;
  if (!idParam) {
    return <div className="p-6">Juego no encontrado.</div>;
  }

  const gameId = idParam as Id<"games">;

  // 👇 archivo: convex/queries/getGameById.ts
  const game = useQuery(api.queries.getGameById.getGameById, { id: gameId }) as
    | Doc<"games">
    | null
    | undefined;

  if (game === undefined) {
    return <div className="p-6">Cargando...</div>;
  }

  if (game === null) {
    return <div className="p-6">Juego no encontrado.</div>;
  }

  const images = [game.cover_url, game.cover_url, game.cover_url, game.cover_url].filter(Boolean) as string[];

  const handlePurchase = () => {
    router.push(`/checkout/compra/${game._id}`);
  };

  const handleRental = () => {
    router.push(`/checkout/alquiler/${game._id}`);
  };

  const toggleFavorite = () => setIsFavorite((v) => !v);
  const nextThumbnails = () => {
    if (thumbnailStartIndex + thumbnailsPerView < images.length) {
      setThumbnailStartIndex((prev) => prev + 1);
    }
  };
  const prevThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex((prev) => prev - 1);
    }
  };
  const toggleOverlay = () => setShowOverlay((v) => !v);
  const handleShare = () => setShowShareModal(true);
  const copyToClipboard = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Gallery (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImageIndex] || "/placeholder.svg"}
                alt={game.title}
                fill
                className="object-cover"
              />

              <Button
                onClick={toggleOverlay}
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 border-white/30 text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm"
              >
                {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>

              {showOverlay && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{game.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-400 text-slate-900 hover:bg-orange-500">
                      {(game.genres && game.genres[0]) || "Acción"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center gap-2">
                <Button
                  onClick={prevThumbnails}
                  variant="outline"
                  size="icon"
                  disabled={thumbnailStartIndex === 0}
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 grid grid-cols-4 gap-2">
                  {images.slice(thumbnailStartIndex, thumbnailStartIndex + thumbnailsPerView).map((image, index) => {
                    const actualIndex = thumbnailStartIndex + index;
                    return (
                      <button
                        key={actualIndex}
                        onClick={() => setSelectedImageIndex(actualIndex)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === actualIndex ? "border-orange-400" : "border-slate-600"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${game.title} screenshot ${actualIndex + 1}`}
                          width={120}
                          height={68}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={nextThumbnails}
                  variant="outline"
                  size="icon"
                  disabled={thumbnailStartIndex + thumbnailsPerView >= images.length}
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Descripción</h3>
              <p className="text-slate-300 leading-relaxed">{game.description ?? "Sin descripción"}</p>
            </div>
          </div>

          {/* Right Column - Game Info and Actions (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing and Actions */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <div className="text-center mb-4">
                <p className="text-orange-400 text-sm mb-2">¡Suscribite a premium para más ventajas!</p>
                <div className="text-xl font-semibold text-teal-400 mt-2">Alquiler semanal</div>
              </div>

              <div className="space-y-3">
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

                <div className="flex gap-2">
                  <Button
                    onClick={toggleFavorite}
                    variant="outline"
                    className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    Favoritos
                  </Button>

                  <Button
                    onClick={handleShare}
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

            {/* Game Information (demo) */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Información del juego</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="text-white">{game.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Géneros:</span>
                  <span className="text-white">{(game.genres ?? []).join(", ") || "—"}</span>
                </div>
              </div>
            </div>

            {/* Premium CTA */}
            <div className="bg-gradient-to-br from-orange-400/30 via-teal-500/30 to-purple-600/30 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">¿Quieres más?</h3>
              <p className="text-white/90 text-sm mb-4">Con premium descubrí acceso ilimitado al catálogo y descuentos exclusivos</p>
              <Link href="/premium">
                <Button className="bg-white text-violet-800 hover:bg-slate-100 font-semibold">Descubre premium</Button>
              </Link>
            </div>
          </div>
        </div>
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
              onClick={copyToClipboard}
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
              El link se copiará a tu portapapeles para que puedas compartirlo fácilmente
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
