"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

// Mock game data
const gameData = {
  id: "1",
  title: "Tomb Raider",
  image: "/tomb-raider-game-cover.jpg",
  description:
    "Embárcate en una aventura épica llena de misterios antiguos, tesoros perdidos y peligros mortales. Lara Croft regresa en su aventura más emocionante hasta la fecha, explorando tumbas olvidadas y enfrentándose a enemigos que pondrán a prueba todas sus habilidades.",
  weeklyPrice: 2.99,
  premiumDiscount: "Podrías ahorrarte un 10% suscribiéndote a premium, ¡No te lo pierdas!",
}

export default function RentalCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [weeks, setWeeks] = useState([2])
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    savePaymentMethod: false,
  })

  const totalPrice = (gameData.weeklyPrice * weeks[0]).toFixed(2)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + weeks[0] * 7)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle rental logic here
    console.log("Processing rental:", { ...formData, weeks: weeks[0], totalPrice })
    // Redirect to success page or game library
    router.push("/mis-juegos")
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-orange-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Confirmar alquiler</h1>
            <p className="text-slate-400">Estas alquilando:</p>
          </div>

          <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">{gameData.title}</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Game Info */}
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <Image
                    src={gameData.image || "/placeholder.svg"}
                    alt={gameData.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover rounded-lg mb-4"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-slate-300 leading-relaxed">{gameData.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Rental Duration Slider */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-xl font-semibold text-teal-400 mb-2">
                    ${gameData.weeklyPrice}/sem
                  </div>
                  <p className="text-orange-400 text-sm">{gameData.premiumDiscount}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Semanas de alquiler: {weeks[0]}
                  </label>
                  <Slider value={weeks} onValueChange={setWeeks} max={12} min={1} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>1 semana</span>
                    <span>12 semanas</span>
                  </div>
                </div>

                {/* Total and Expiry */}
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">Total: ${totalPrice}</div>
                  <div className="text-sm text-slate-400">
                    Vencimiento:{" "}
                    {expiryDate.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del titular</label>
                    <Input
                      type="text"
                      placeholder="Nombre en la tarjeta"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Número de tarjeta</label>
                    <Input
                      type="text"
                      placeholder="**** **** **** 1234"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Fecha de expiración</label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">CVC</label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={formData.cvc}
                        onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="savePayment"
                      checked={formData.savePaymentMethod}
                      onCheckedChange={(checked) => setFormData({ ...formData, savePaymentMethod: checked as boolean })}
                      className="border-slate-600 data-[state=checked]:bg-orange-400 data-[state=checked]:border-orange-400"
                    />
                    <label htmlFor="savePayment" className="text-sm text-slate-300">
                      Guardar método de pago
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3 text-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    Alquilar por ${totalPrice}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
