import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Crown } from "lucide-react"
import Link from "next/link"

function GameCard({ gameId, isPremium = false }: { gameId: string; isPremium?: boolean }) {
  return (
    <Link href={`/juego/${gameId}`} className="block">
      <Card className="bg-slate-800 border-slate-700 overflow-hidden group hover:border-orange-400/50 transition-colors gap-1 p-0 cursor-pointer">
        <div className="relative">
          <Badge className="absolute top-3 left-3 bg-orange-400 text-slate-900 font-semibold z-10">Acción</Badge>
          {isPremium && (
            <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-2 shadow-lg">
              <Crown className="w-4 h-4 text-yellow-900" />
            </div>
          )}
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
          <p className="text-cyan-400 text-xs text-center"> "10% de descuento con PlayVerse premium" </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default GameCard
