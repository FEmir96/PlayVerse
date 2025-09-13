"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const premiumPlans = {
  monthly: {
    name: "Premium Mensual",
    price: "$9.99",
    period: "/mes",
    description: "Perfecto para probar la experiencia",
    features: ["Acceso a toda la biblioteca", "Descuentos del 27%", "Cero publicidad"],
  },
  annual: {
    name: "Premium Anual",
    price: "$89.99",
    period: "/año",
    description: "Ahorra $30",
    features: ["La más conveniente", "3 meses gratis", "Todo lo de mensual"],
  },
  lifetime: {
    name: "Premium Lifetime",
    price: "$239.99",
    period: " único pago",
    description: "Acceso de por vida a todas las funciones Premium",
    features: ["Acceso ilimitado de por vida", "Todos los beneficios"],
  },
}

export default function PremiumCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get("plan") || "monthly"
  const selectedPlan = premiumPlans[planType as keyof typeof premiumPlans]

  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    savePaymentMethod: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle premium subscription logic here
    console.log("Processing premium subscription:", { ...formData, plan: planType })
    // Redirect to success page
    router.push("/premium/success")
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900"
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
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Checkout premium</h1>
            <p className="text-slate-400">Estas a un paso de desbloquear la mejor experiencia gaming</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-400 mb-6">Resumen de tu plan</h2>

              <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedPlan.name}</h3>
                <div className="text-3xl font-bold text-teal-400 mb-2">
                  {selectedPlan.price}
                  <span className="text-lg text-slate-400">{selectedPlan.period}</span>
                </div>
                <p className="text-slate-400 mb-4">{selectedPlan.description}</p>

                <div className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
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

              <div className="text-sm text-slate-400 mb-4">
                Tu suscripción se renovará automáticamente. Puedes cancelarla en cualquier momento desde tu perfil.
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
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
                  Pagar {selectedPlan.price} y suscribirse
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
