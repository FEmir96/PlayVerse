"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Heart, Eye, EyeOff } from "lucide-react"

// Mock data - in a real app this would come from an API
const gameData = {
  id: "1",
  title: "Tomb Raider",
  rating: 4.5,
  genre: "Acción",
  images: [
    "/images/tombraider-ingame.png",
    "/images/tombraider-ingame2.png",
    "/images/tombraider-ingame.png",
    "/images/tombraider-ingame2.png",
    "/images/tombraider-ingame.png",
    "/images/tombraider-ingame2.png",
    "/images/tombraider-ingame.png",
    "/images/tombraider-ingame2.png",
  ],
  description:
    "Embárcate en una aventura épica llena de misterios antiguos, tesoros perdidos y peligros mortales. Lara Croft regresa en su aventura más emocionante hasta la fecha, explorando tumbas olvidadas y enfrentándose a enemigos que pondrán a prueba todas sus habilidades.",
  purchasePrice: "$19.99",
  rentalPrice: "$2.99/sem",
  premiumDiscount: "¡Disfruta un 10% de descuento si te suscribes a premium!",
  developer: "Crystal Dynamics",
  publisher: "Square Enix",
  releaseDate: "15 de Marzo, 2024",
  rating_esrb: "T (Teen)",
  size: "45 GB",
  languages: ["Español", "Inglés", "Francés", "Alemán"],
  features: [
    "Modo historia épico de 20+ horas",
    "Gráficos 4K Ultra HD",
    "Soporte para 120 FPS",
    "Modo cooperativo online",
  ],
  systemRequirements: {
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-8400 / AMD Ryzen 5 2600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GTX 1060 / AMD RX 580",
      storage: "45 GB",
    },
    recommended: {
      os: "Windows 11 64-bit",
      processor: "Intel Core i7-10700K / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA RTX 3070 / AMD RX 6700 XT",
      storage: "45 GB SSD",
    },
  },
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0)
  const thumbnailsPerView = 4

  const handlePurchase = () => {
    router.push(`/checkout/compra/${params.id}`)
  }

  const handleRental = () => {
    router.push(`/checkout/alquiler/${params.id}`)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const nextThumbnails = () => {
    if (thumbnailStartIndex + thumbnailsPerView < gameData.images.length) {
      setThumbnailStartIndex((prev) => prev + 1)
    }
  }

  const prevThumbnails = () => {
    if (thumbnailStartIndex > 0) {
      setThumbnailStartIndex((prev) => prev - 1)
    }
  }

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Volver
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Gallery (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
              <Image
                src={gameData.images[selectedImageIndex] || "/placeholder.svg"}
                alt={gameData.title}
                fill
                className="object-cover"
              />

              <Button
                onClick={toggleOverlay}
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 border-white/30 text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm"
              >
                {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>

              {showOverlay && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{gameData.title}</h1>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(gameData.rating) ? "text-yellow-400" : "text-slate-600"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-white text-sm ml-1">{gameData.rating}</span>
                    </div>
                    <Badge className="bg-orange-400 text-slate-900 hover:bg-orange-500">{gameData.genre}</Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center gap-2">
                <Button
                  onClick={prevThumbnails}
                  variant="outline"
                  size="icon"
                  disabled={thumbnailStartIndex === 0}
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 grid grid-cols-4 gap-2">
                  {gameData.images
                    .slice(thumbnailStartIndex, thumbnailStartIndex + thumbnailsPerView)
                    .map((image, index) => {
                      const actualIndex = thumbnailStartIndex + index
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => setSelectedImageIndex(actualIndex)}
                          className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === actualIndex ? "border-orange-400" : "border-slate-600"
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${gameData.title} screenshot ${actualIndex + 1}`}
                            width={120}
                            height={68}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )
                    })}
                </div>

                <Button
                  onClick={nextThumbnails}
                  variant="outline"
                  size="icon"
                  disabled={thumbnailStartIndex + thumbnailsPerView >= gameData.images.length}
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Descripción</h3>
              <p className="text-slate-300 leading-relaxed">{gameData.description}</p>
            </div>

            {/* Features */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Características principales</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {gameData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Requisitos del sistema</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Mínimos</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">SO:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.minimum.os}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Procesador:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.minimum.processor}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Memoria:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.minimum.memory}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Gráficos:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.minimum.graphics}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Almacenamiento:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.minimum.storage}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Recomendados</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">SO:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.recommended.os}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Procesador:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.recommended.processor}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Memoria:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.recommended.memory}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Gráficos:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.recommended.graphics}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Almacenamiento:</span>{" "}
                      <span className="text-white">{gameData.systemRequirements.recommended.storage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Game Info and Actions (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing and Actions */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <div className="text-center mb-4">
                <p className="text-orange-400 text-sm mb-2">{gameData.premiumDiscount}</p>
                <div className="text-3xl font-bold text-teal-400 mb-2">{gameData.purchasePrice}</div>
                <p className="text-slate-400">Precio de compra</p>
                <div className="text-xl font-semibold text-teal-400 mt-2">{gameData.rentalPrice}</div>
                <p className="text-slate-400 text-sm">Alquiler mensual</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Comprar ahora
                </Button>

                <Button
                  onClick={handleRental}
                  variant="outline"
                  className="w-full border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Alquilar
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={toggleFavorite}
                    variant="outline"
                    className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    Favoritos
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Game Information */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Información del juego</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Desarrollador:</span>
                  <span className="text-white">{gameData.developer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Editor:</span>
                  <span className="text-white">{gameData.publisher}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha de lanzamiento:</span>
                  <span className="text-white">{gameData.releaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clasificación:</span>
                  <span className="text-white">{gameData.rating_esrb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tamaño:</span>
                  <span className="text-white">{gameData.size}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Idiomas:</span>
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {gameData.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs bg-teal-600 text-white">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium CTA */}
            <div className="bg-gradient-to-br from-orange-400/30 via-teal-500/30 to-purple-600/30 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">¿Quiere más?</h3>
              <p className="text-white/90 text-sm mb-4">
                Con premium descubrí acceso ilimitado al catálogo y descuentos exclusivos
              </p>
              <Link href="/premium">
                <Button className="bg-white text-violet-800 hover:bg-slate-100 font-semibold">Descubre premium</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
