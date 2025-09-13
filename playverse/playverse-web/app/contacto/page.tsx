"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission here
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-6 tracking-wide">CONTACTO</h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti, contáctanos y te responderemos lo antes
            posible
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-slate-800 border-orange-400/30">
              <CardHeader>
                <CardTitle className="text-orange-400 text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Envíanos un mensaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-slate-300">
                      Nombre completo
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asunto" className="text-slate-300">
                      Asunto
                    </Label>
                    <Input
                      id="asunto"
                      name="asunto"
                      placeholder="¿En qué podemos ayudarte?"
                      value={formData.asunto}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensaje" className="text-slate-300">
                      Mensaje
                    </Label>
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      placeholder="Cuéntanos más detalles..."
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-32"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold"
                  >
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Email Section */}
              <Card className="bg-slate-800 border-orange-400/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-400 p-3 rounded-full">
                      <Mail className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-orange-400 font-semibold text-lg mb-2">Email</h3>
                      <p className="text-slate-300 mb-1">soporte@playverse.com</p>
                      <p className="text-slate-300">ventas@playverse.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone Section */}
              <Card className="bg-slate-800 border-orange-400/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-400 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-orange-400 font-semibold text-lg mb-2">Teléfono</h3>
                      <p className="text-slate-300 mb-1">+1 (555) 123-4567</p>
                      <p className="text-slate-400 text-sm">Lun - Vie: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="bg-slate-800 border-orange-400/30">
                <CardHeader>
                  <CardTitle className="text-orange-400 text-lg">Preguntas frecuentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FAQItem
                    question="¿Cómo funciona el alquiler de juegos?"
                    answer="Puedes alquilar cualquier juego por un período semanal y jugarlo las veces que quieras."
                  />
                  <FAQItem
                    question="¿Qué incluye la membresía Premium?"
                    answer="Acceso ilimitado a nuestra biblioteca, descuentos exclusivos y cero publicidad."
                  />
                  <FAQItem
                    question="¿Puedo cancelar mi suscripción?"
                    answer="Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil de usuario."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
        <span className="text-slate-300 font-medium text-left">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-orange-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange-400" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 py-2">
        <p className="text-slate-400 text-sm">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
