import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-800 to-slate-900 py-20 overflow-hidden">
        {/* Gaming Icons Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-8 h-8 bg-orange-400 rounded-full"></div>
          <div className="absolute top-20 right-20 w-6 h-6 bg-orange-300 rotate-45"></div>
          <div className="absolute bottom-20 left-20 w-10 h-10 bg-orange-500 rounded"></div>
          <div className="absolute top-40 left-1/4 w-4 h-4 bg-orange-400"></div>
          <div className="absolute bottom-40 right-1/4 w-6 h-6 bg-orange-300 rounded-full"></div>
          <div className="absolute top-60 right-10 w-8 h-8 bg-orange-400 rotate-12"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold text-orange-400 mb-6 tracking-wider">PLAYVERSE</h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8 py-3">
              Explorar
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 bg-transparent"
            >
              Registrarse
            </Button>
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
            {Array.from({ length: 8 }).map((_, i) => (
              <GameCard key={i} />
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8">Ver todo</Button>
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
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para una experiencia premium?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Catálogo ilimitado, descuentos exclusivos, cero publicidad y mucho más
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3">
              Descubre premium
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function GameCard() {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden group hover:border-orange-400/50 transition-colors">
      <div className="relative">
        <Badge className="absolute top-3 left-3 bg-orange-400 text-slate-900 font-semibold z-10">Acción</Badge>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 text-slate-400 hover:text-orange-400 z-10"
        >
          <Heart className="w-4 h-4" />
        </Button>
        <div className="aspect-[4/4] bg-slate-700 relative overflow-hidden">
          <img
            src="/tomb-raider-game-cover.jpg"
            alt="Tomb Raider"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-slate-400 text-sm">Alquiler</p>
            <p className="text-white font-semibold">$2.99/sem</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Compra</p>
            <p className="text-white font-semibold">$19.99</p>
          </div>
        </div>
        <p className="text-cyan-400 text-xs mb-3">10% de descuento con PlayVerse premium</p>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
            Alquilar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
          >
            Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ComingSoonCard() {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
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
