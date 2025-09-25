"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ShowLoginToast from "@/components/show-login-toast";
import { useAuthStore } from "@/lib/useAuthStore";

// rails
import FeaturedRail from "@/components/featured-rail";
import UpcomingRail from "@/components/upcoming-rail";

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* toasts login/logout */}
      <ShowLoginToast />

      {/* HERO con iconitos de fondo */}
      <section className="relative bg-gradient-to-b from-slate-800 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/images/hongo.png" alt="Mario Mushroom" className="absolute top-10 left-10 w-12 h-12" />
          <img src="/images/estrella.png" alt="Estrella" className="absolute top-20 right-20 w-10 h-10" />
          <img src="/images/control.png" alt="Mando de videojuego" className="absolute bottom-20 left-20 w-14 h-10" />
          <img src="/images/rob1.png" alt="Space Invader 1" className="absolute top-45 left-1/4 w-8 h-8" />
          <img src="/images/moneda.png" alt="Moneda" className="absolute bottom-50 right-1/4 w-10 h-10" />
          <img src="/images/rob2.png" alt="Space Invader 2" className="absolute top-60 right-10 w-12 h-10" />
          <img src="/images/hongo.png" alt="Mario Mushroom" className="absolute top-80 right-50 w-10 h-10" />
          <img src="/images/estrella.png" alt="Estrella" className="absolute top-30 left-60 w-8 h-8" />
          <img src="/images/control.png" alt="Mando de videojuego" className="absolute bottom-20 right-120 w-14 h-10" />
          <img src="/images/rob1.png" alt="Space Invader 1" className="absolute top-10 right-60 w-10 h-10" />
          <img src="/images/moneda.png" alt="Moneda" className="absolute bottom-10 left-80 w-10 h-10" />
          <img src="/images/rob2.png" alt="Space Invader 2" className="absolute top-10 left-110 w-12 h-10" />
        </div>

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

      {/* NUEVOS JUEGOS (datos reales) */}
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

      {/* PRÓXIMAMENTE */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">Próximamente</h2>
          </div>

          <UpcomingRail />
        </div>
      </section>

      {/* CTA Premium (idéntico al que tenías) */}
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
