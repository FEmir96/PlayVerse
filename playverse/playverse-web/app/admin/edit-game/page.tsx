"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function EditGamePage({ params }: { params: { id: string } }) {
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const [languages, setLanguages] = useState(["Español", "Inglés", "Francés"])

  // Mock data - in real app this would come from API
  const gameData = {
    title: "Tomb Raider",
    category: "Acción",
    purchasePrice: "19.99",
    rentalPrice: "2.99",
    developer: "Crystal Dynamics",
    editor: "Square Enix",
    releaseDate: "15/03/2024",
    rating: "T (Teen)",
    size: "45",
    description:
      "Embárcate en una aventura épica llena de misterios antiguos, tesoros perdidos y peligros mortales. Lara Croft regresa en su aventura más emocionante hasta la fecha, explorando tumbas olvidadas y enfrentándose a enemigos que pondrán a prueba todas sus habilidades.",
    features: [
      "Modo historia épica de 20+ horas",
      "Ray Tracing avanzado",
      "Gráficos de Ultra HD",
      "Soporte para 120 FPS",
    ],
    minRequirements: `SO: Windows 10 64-bit
Procesador: Intel Core i5-8400 / AMD Ryzen 5 2600
Memoria: 8 GB RAM
Gráficos: NVIDIA GTX 1060 / AMD RX 580
Almacenamiento: 45 GB`,
    recRequirements: `SO: Windows 11 64-bit
Procesador: Intel Core i7-10700K / AMD Ryzen 7 3700X
Memoria: 16 GB RAM
Gráficos: NVIDIA RTX 3070 / AMD RX 6700 XT
Almacenamiento: 45 GB SSD`,
  }

  const addLanguage = () => {
    setLanguages([...languages, `Idioma ${languages.length + 1}`])
  }

  const screenshots = Array(4).fill("/tomb-raider-screenshot.jpg")

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-orange-400">Editar juego</h1>
          </div>
          <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold">Guardar</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Main Image */}
            <div>
              <Label className="text-orange-400 text-lg font-semibold mb-4 block">Imagen principal</Label>
              <div className="relative aspect-video bg-slate-700 rounded-lg overflow-hidden">
                <img src="/tomb-raider-game-cover.jpg" alt="Game cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-white">Modificar imagen principal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-slate-900 rounded-lg border border-orange-400 p-6 space-y-4">
              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Título</Label>
                <Input defaultValue={gameData.title} className="bg-slate-800 border-slate-700 text-orange-400" />
              </div>

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Categoría</Label>
                <Input defaultValue={gameData.category} className="bg-slate-800 border-slate-700 text-orange-400" />
              </div>

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Precio de venta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">$</span>
                  <Input
                    defaultValue={gameData.purchasePrice}
                    className="bg-slate-800 border-slate-700 text-orange-400 pl-8"
                  />
                </div>
              </div>

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Precio de alquiler</Label>
                <div className="flex items-center gap-2">
                  <Input
                    defaultValue={gameData.rentalPrice}
                    className="bg-slate-800 border-slate-700 text-orange-400"
                  />
                  <span className="text-orange-400 italic">/sem</span>
                </div>
              </div>
            </div>

            {/* Game Details */}
            <div className="bg-slate-900 rounded-lg border border-orange-400 p-6 space-y-4">
              <Label className="text-orange-400 text-lg font-semibold block">Información del juego</Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-1 block">Desarrollador:</Label>
                  <Input defaultValue={gameData.developer} className="bg-slate-800 border-slate-700 text-orange-400" />
                </div>
                <div>
                  <Label className="text-slate-300 mb-1 block">Editor:</Label>
                  <Input defaultValue={gameData.editor} className="bg-slate-800 border-slate-700 text-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-1 block">Fecha de lanzamiento:</Label>
                  <Input
                    defaultValue={gameData.releaseDate}
                    className="bg-slate-800 border-slate-700 text-orange-400"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-1 block">Clasificación etaria:</Label>
                  <Input defaultValue={gameData.rating} className="bg-slate-800 border-slate-700 text-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-1 block">Tamaño:</Label>
                  <div className="flex items-center gap-2">
                    <Input defaultValue={gameData.size} className="bg-slate-800 border-slate-700 text-orange-400" />
                    <span className="text-orange-400">GB</span>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300 mb-1 block">Idiomas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <div key={index} className="bg-slate-800 px-2 py-1 rounded text-orange-400 text-sm">
                        {lang}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={addLanguage}
                      className="bg-orange-400 hover:bg-orange-500 text-slate-900 h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Screenshots */}
            <div>
              <Label className="text-orange-400 text-lg font-semibold mb-4 block">Capturas de pantalla</Label>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {screenshots.map((screenshot, index) => (
                    <div key={index} className="relative aspect-video bg-slate-700 rounded-lg overflow-hidden group">
                      <img
                        src={screenshot || "/placeholder.svg"}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-slate-900 mb-2">
                          <Upload className="w-4 h-4 mr-1" />
                          Reemplazar imagen
                        </Button>
                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                          Eliminar imagen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button size="sm" variant="ghost" className="text-orange-400">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-orange-400">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900 rounded-lg border border-orange-400 p-6 space-y-4">
              <Label className="text-orange-400 text-lg font-semibold block">Descripción</Label>
              <Textarea
                defaultValue={gameData.description}
                className="bg-slate-800 border-slate-700 text-orange-400 min-h-[100px]"
              />

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Características principales</Label>
                <div className="grid grid-cols-2 gap-2">
                  {gameData.features.map((feature, index) => (
                    <Input
                      key={index}
                      defaultValue={feature}
                      className="bg-slate-800 border-slate-700 text-orange-400"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-slate-900 rounded-lg border border-orange-400 p-6 space-y-4">
              <Label className="text-orange-400 text-lg font-semibold block">Requisitos del sistema</Label>

              <div>
                <Label className="text-slate-300 mb-2 block">Mínimos</Label>
                <Textarea
                  defaultValue={gameData.minRequirements}
                  className="bg-slate-800 border-slate-700 text-orange-400 min-h-[120px]"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Recomendados</Label>
                <Textarea
                  defaultValue={gameData.recRequirements}
                  className="bg-slate-800 border-slate-700 text-orange-400 min-h-[120px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
