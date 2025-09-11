"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Star, Heart, Search, Filter, ArrowUpDown } from "lucide-react"

const genres = ["Todos", "Acción", "RPG", "Carreras", "Shooter", "Sandbox", "Estrategia", "Deportes"]

export default function CatalogoPage() {
  const [selectedGenre, setSelectedGenre] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-4 tracking-wide">CATÁLOGO DE JUEGOS</h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            ¡Sumérgete en el PlayVerse! Encuentra tu próxima obsesión entre nuestra vasta colección de títulos retro y
            modernos.
          </p>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-8 bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Ordenar
              </Button>
            </div>
          </div>

          {/* Genre Filters */}
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={
                  selectedGenre === genre
                    ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                }
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <CatalogGameCard key={i} isPremium={i >= 6} />
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center">
            <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8">Cargar más</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function CatalogGameCard({ isPremium = false }: { isPremium?: boolean }) {
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

        {!isPremium ? (
          <>
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
          </>
        ) : (
          <>
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
            <Button size="sm" className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 mb-3" disabled>
              Catálogo premium
            </Button>
            <p className="text-cyan-400 text-xs text-center">10% de descuento con PlayVerse premium</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
