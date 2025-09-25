"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ShowLoginToast from "@/components/show-login-toast";
import { useAuthStore } from "@/lib/useAuthStore";

import FeaturedRail from "@/components/featured-rail";
import UpcomingRail from "@/components/upcoming-rail";
import FreeRail from "@/components/free-rail";
import HypeRail from "@/components/hype-rail";

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      <ShowLoginToast />

      {/* HERO */}
      <section className="relative bg-gradient-to-b from-slate-800 to-slate-900 py-20 overflow-hidden">
        {/* ... (tu deco con iconos tal cual) ... */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-extrabold italic text-orange-400 mb-6 tracking-wider">PLAYVERSE</h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Bienvenido al universo de los videojuegos. Alquila o compra tus favoritos en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo">
              <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8 py-3">
                Explorar
              </Button>
            </Link>
            {!user && (
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 bg-transparent"
                >
                  Registrarse
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* NUEVOS JUEGOS */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">Nuevos juegos</h2>
            <p className="text-slate-400">Explora la colección. ¡Encuentra tu próxima aventura!</p>
          </div>

          <FeaturedRail />

          <div className="text-center mt-8">
            <Link href="/catalogo">
              <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8">
                Ver todo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MÁS POPULARES GRATUITOS */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <FreeRail />
        </div>
      </section>

      {/* LOS MÁS ESPERADOS */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <HypeRail />
        </div>
      </section>

      {/* PRÓXIMAMENTE */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">Próximamente</h2>
          </div>
          <UpcomingRail />
        </div>
      </section>

      {/* CTA Premium */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-orange-400/30 via-teal-500/30 to-purple-600/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para una experiencia premium?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Catálogo ilimitado, descuentos exclusivos, cero publicidad y mucho más
            </p>
            <Link href="/premium">
              <Button size="lg" className="bg-white text-violet-800 hover:bg-gray-100 font-semibold px-8 py-3">
                Descubre premium
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
