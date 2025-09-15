import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Clock } from "lucide-react"
import Link from "next/link"
import GameCard from "@/components/game-card"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-800 to-slate-900 py-20 overflow-hidden">
        {/* Gaming Icons Background */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="/images/hongo.png"
            alt="Mario Mushroom"
            className="absolute top-10 left-10 w-12 h-12"
          />
          <img
            src="/images/estrella.png"
            alt="Estrella"
            className="absolute top-20 right-20 w-10 h-10"
          />
          <img
            src="/images/control.png"
            alt="Mando de videojuego"
            className="absolute bottom-20 left-20 w-14 h-10"
          />
          <img
            src="/images/rob1.png"
            alt="Space Invader 1"
            className="absolute top-45 left-1/4 w-8 h-8"
          />
          <img
            src="/images/moneda.png"
            alt="Moneda"
            className="absolute bottom-50 right-1/4 w-10 h-10"
          />
          <img
            src="/images/rob2.png"
            alt="Space Invader 2"
            className="absolute top-60 right-10 w-12 h-10"
          />
          <img
            src="/images/hongo.png"
            alt="Mario Mushroom"
            className="absolute top-80 right-50 w-10 h-10"
          />
          <img
            src="/images/estrella.png"
            alt="Estrella"
            className="absolute top-30 left-60 w-8 h-8"
          />
          <img
            src="/images/control.png"
            alt="Mando de videojuego"
            className="absolute bottom-20 right-120 w-14 h-10"
          />
          <img
            src="/images/rob1.png"
            alt="Space Invader 1"
            className="absolute top-10 right-60 w-10 h-10"
          />
          <img
            src="/images/moneda.png"
            alt="Moneda"
            className="absolute bottom-10 left-80 w-10 h-10"
          />
          <img
            src="/images/rob2.png"
            alt="Space Invader 2"
            className="absolute top-10 left-110 w-12 h-10"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-extrabold italic text-orange-400 mb-6 tracking-wider">PLAYVERSE</h1>
          <p className="text-slate-300 text-lg md:tex t-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Bienvenido al universo de los videojuegos. Alquila o compra tus favoritos en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo">
              <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8 py-3">
                Explorar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 bg-transparent"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Nuevos Juegos Section */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4">Nuevos juegos</h2>
            <p className="text-slate-400 text-lg">Explora la colección. ¡Encuentra tu próxima aventura!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <GameCard key={i} gameId={`${i + 1}`} isPremium={i === 1 || i === 3} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/catalogo">
              <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8">Ver todo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Próximamente Section */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4">Próximamente</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ComingSoonCard key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
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
  )
}


function ComingSoonCard() {
  return (
    <Card className="bg-slate-800 border-slate-700 gap-1 p-0 overflow-hidden">
      <div className="relative">
        <Badge className="absolute top-3 left-3 bg-orange-400 text-slate-900 font-semibold z-10">Acción</Badge>
        <div className="aspect-[4/4] bg-slate-700 relative overflow-hidden">
          <img src="/tomb-raider-game-cover.jpg" alt="Tomb Raider" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <div className="bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Próximamente</span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
          <span className="text-orange-400 font-semibold">4.5</span>
        </div>
        <h3 className="text-orange-400 font-semibold text-lg mb-2">Tomb Raider</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique
        </p>
        <p className="text-cyan-400 font-semibold mb-3">Llega el 20/07/2025</p>
      </CardContent>
    </Card>
  )
}
