"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function AddGamePage() {
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const [languages, setLanguages] = useState(["Idioma 1", "Idioma 2", "Idioma 3"])

  const addLanguage = () => {
    setLanguages([...languages, `Idioma ${languages.length + 1}`])
  }

  const screenshots = Array(4).fill(null)

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
            <h1 className="text-4xl font-bold text-orange-400">Añadir juego</h1>
          </div>
          <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold">Añadir</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Main Image */}
            <div>
              <Label className="text-orange-400 text-lg font-semibold mb-4 block">Imagen principal</Label>
              <div className="aspect-video bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-orange-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Subir imagen principal</p>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-slate-900 rounded-lg border border-orange-400 p-6 space-y-4">
              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Título</Label>
                <Input
                  placeholder="Ingrese un título"
                  className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Categoría</Label>
                <Input
                  placeholder="Ingrese una categoría"
                  className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Precio de venta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">$</span>
                  <Input
                    placeholder="Precio"
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500 pl-8"
                  />
                </div>
              </div>

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Precio de alquiler</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Alquiler"
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
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
                  <Input
                    placeholder="Desarrollador..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-1 block">Editor:</Label>
                  <Input
                    placeholder="Editor..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-1 block">Fecha de lanzamiento:</Label>
                  <Input
                    placeholder="MM/DD/AA"
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-1 block">Clasificación etaria:</Label>
                  <Input
                    placeholder="Clasificación..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-1 block">Tamaño:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tamaño..."
                      className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                    />
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
                  {screenshots.map((_, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-orange-400 transition-colors cursor-pointer"
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <p className="text-slate-400 text-sm">Subir imagen o video</p>
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
                placeholder="Ingrese una descripción..."
                className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500 min-h-[100px]"
              />

              <div>
                <Label className="text-orange-400 text-lg font-semibold mb-2 block">Características principales</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Ingrese característica 1..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                  <Input
                    placeholder="Ingrese característica 3..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                  <Input
                    placeholder="Ingrese característica 2..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                  <Input
                    placeholder="Ingrese característica 4..."
                    className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-slate-900 rounded-lg border border-orange-400 p-6 space-y-4">
              <Label className="text-orange-400 text-lg font-semibold block">Requisitos del sistema</Label>

              <div>
                <Label className="text-slate-300 mb-2 block">Mínimos</Label>
                <Textarea
                  placeholder="Ingrese los requisitos mínimos del sistema..."
                  className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500 min-h-[80px]"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Recomendados</Label>
                <Textarea
                  placeholder="Ingrese los requisitos mínimos del sistema..."
                  className="bg-slate-800 border-slate-700 text-orange-400 placeholder:text-slate-500 min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
