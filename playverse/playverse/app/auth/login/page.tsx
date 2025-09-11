"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-600 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/playverse-logo.png"
              alt="PlayVerse"
              width={120}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-orange-400 mb-2">PLAYVERSE</h1>
          <p className="text-slate-300">Únete y elige tu próxima aventura</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-orange-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-orange-400">Iniciar sesión</h2>
          </div>

          <p className="text-slate-400 text-center mb-6">Bienvenido de vuelta, gamer</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <Input
                type="password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                  className="border-slate-600 data-[state=checked]:bg-orange-400 data-[state=checked]:border-orange-400"
                />
                <label htmlFor="remember" className="text-sm text-slate-300">
                  Recordarme
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-orange-400 hover:text-orange-300">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Ingresar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-400">¿No tienes una cuenta? </span>
            <Link href="/auth/register" className="text-orange-400 hover:text-orange-300 font-medium">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
