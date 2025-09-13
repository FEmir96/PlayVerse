"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Search, Filter, ArrowUpDown, Play, Clock, Download, ShoppingCart, RotateCcw, Plus } from "lucide-react"
import { KeyActivationModal } from "@/components/key-activation-modal"

const genres = ["Todos", "Acción", "RPG", "Carreras", "Shooter", "Sandbox", "Estrategia", "Deportes"]

export default function MisJuegosPage() {
  const [selectedGenre, setSelectedGenre] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("compras")
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-4 tracking-wide">MIS JUEGOS</h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            Tu arsenal personal de aventuras. ¡Selecciona tu próxima misión!
          </p>

          {/* Add Key Section */}
          <div className="max-w-md mx-auto">
            <Button
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold mb-4"
              onClick={() => setIsKeyModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ingresar clave
            </Button>
            <p className="text-slate-400 text-sm">
              Ingresa tu clave de activación temporal o perpetua para añadir tus juegos
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8 bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="bg-slate-800 border border-slate-600">
                <TabsTrigger
                  value="compras"
                  className="data-[state=active]:bg-orange-400 data-[state=active]:text-slate-900 text-orange-400"
                >
                  Mis compras
                </TabsTrigger>
                <TabsTrigger
                  value="alquileres"
                  className="data-[state=active]:bg-orange-400 data-[state=active]:text-slate-900 text-orange-400"
                >
                  Mis alquileres
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search and Filters */}
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
            <div className="flex flex-wrap gap-2 mb-8">
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

            {/* Games Content */}
            <TabsContent value="compras" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MyGameCard
                    key={i}
                    type="compra"
                    status={i < 2 ? "active" : i < 4 ? "expired" : "expired-discount"}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alquileres" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MyGameCard
                    key={i}
                    type="alquiler"
                    status={i < 2 ? "active" : i < 4 ? "expired" : "expired-discount"}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Key Activation Modal */}
      <KeyActivationModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </div>
  )
}

function MyGameCard({
  type,
  status,
}: { type: "compra" | "alquiler"; status: "active" | "expired" | "expired-discount" }) {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <div className="relative">
        <Badge className="absolute top-3 left-3 bg-orange-400 text-slate-900 font-semibold z-10">Acción</Badge>
        <div className="aspect-[4/3] bg-slate-700 relative overflow-hidden">
          <img src="/tomb-raider-game-cover.jpg" alt="Tomb Raider" className="w-full h-full object-cover" />
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

        {status === "active" && (
          <>
            <p className="text-cyan-400 font-medium mb-4">Válido hasta el 20/07/2025</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                <Play className="w-4 h-4 mr-1" />
                Jugar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Clock className="w-4 h-4 mr-1" />
                Extender
              </Button>
            </div>
          </>
        )}

        {status === "expired" && (
          <>
            <p className="text-red-400 font-medium mb-4">Válido hasta el 20/07/2025</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                <Download className="w-4 h-4 mr-1" />
                Descargar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Clock className="w-4 h-4 mr-1" />
                Extender
              </Button>
            </div>
          </>
        )}

        {status === "expired-discount" && (
          <>
            <p className="text-red-400 font-medium mb-4">Caducado</p>
            <div className="flex gap-2 mb-2">
              <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Comprar con descuento
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Renovar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
