"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ShoppingCart, PlaySquare } from "lucide-react";
import { useFavoritesStore } from "@/components/favoritesStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function FavoritesDropdown({ isOpen, onClose }: Props) {
  const { toast } = useToast();
  const items = useFavoritesStore((s) => s.items);
  const remove = useFavoritesStore((s) => s.remove);

  useEffect(() => {
    const handler = () => {};
    window.addEventListener("pv:favorites:changed", handler);
    return () => window.removeEventListener("pv:favorites:changed", handler);
  }, []);

  if (!isOpen) return null;

  const hasItems = items && items.length > 0;

  return (
    <div className="absolute right-0 mt-3 w-[380px] z-50">
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/50 via-orange-400/40 to-purple-500/40">
        <div className="rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300">
                Mis Favoritos
              </h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-400/20 text-orange-300 border border-orange-400/30">
                {items.length}
              </span>
            </div>
            {/* ❗Solo hover: glow suave */}
            <button
              onClick={onClose}
              className="text-slate-400 rounded-md transition-all duration-200
                         hover:text-orange-300 hover:bg-orange-400/10
                         hover:shadow-[0_0_12px_rgba(251,146,60,0.30)]
                         hover:ring-1 hover:ring-orange-400/30
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-800">
            {!hasItems ? (
              <div className="p-6 text-center text-slate-400">
                No agregaste juegos aún.
              </div>
            ) : (
              items.map((g) => (
                <div
                  key={g.id}
                  className="p-3 transition-all duration-200 rounded-none
                             hover:bg-slate-800/50 hover:shadow-[0_0_14px_rgba(251,146,60,0.15)]
                             hover:ring-1 hover:ring-orange-400/20"
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 rounded-lg overflow-hidden ring-1 ring-slate-700">
                      <Image
                        src={g.cover || "/placeholder.svg"}
                        alt={g.title}
                        width={56}
                        height={56}
                        className="object-cover w-14 h-14"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        {/* Título */}
                        <Link
                          href={`/juego/${g.id}`}
                          onClick={onClose}
                          className="text-orange-400 hover:text-orange-300 hover:underline font-medium truncate
                                     transition-colors"
                          title={g.title}
                        >
                          {g.title}
                        </Link>

                        {/* Papelera con glow en hover */}
                        <button
                          onClick={() => {
                            remove(g.id);
                            window.dispatchEvent(new Event("pv:favorites:changed"));
                            toast({
                              title: "Eliminado de favoritos",
                              description: `${g.title} se quitó de tu lista.`,
                            });
                          }}
                          className="text-slate-400 rounded-md transition-all duration-200
                                     hover:text-red-400 hover:bg-red-400/10
                                     hover:shadow-[0_0_12px_rgba(248,113,113,0.25)]
                                     hover:ring-1 hover:ring-red-400/30
                                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                          title="Quitar de favoritos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-between mt-2">
                        <Link
                          href={`/checkout/alquiler/${g.id}`}
                          onClick={onClose}
                          className="text-cyan-300 hover:text-cyan-200 text-sm inline-flex items-center gap-1
                                     transition-colors"
                        >
                          <PlaySquare className="w-4 h-4" />
                          Alquiler
                        </Link>
                        <Link
                          href={`/checkout/compra/${g.id}`}
                          onClick={onClose}
                          className="text-emerald-300 hover:text-emerald-200 text-sm inline-flex items-center gap-1
                                     transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Compra
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {hasItems && (
            <div className="px-4 py-3 bg-slate-900/80 flex justify-end">
              <Link href="/mis-juegos" onClick={onClose}>
                <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900">
                  Ver biblioteca
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
