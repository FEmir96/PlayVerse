"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAction } from "convex/react"
import type { FunctionReference } from "convex/server"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@convex"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestReset = useAction(
    (api as any)["actions/passwordReset"]
      .requestPasswordReset as FunctionReference<"action">
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError("Ingresá un email válido.")
      return
    }

    setSubmitting(true)
    try {
      const result = await (requestReset as any)({
        email: trimmed,
        appUrl: typeof window !== "undefined" ? window.location.origin : undefined,
      })

      if (!result?.ok) {
        const code = result?.error
        if (code === "not_found") {
          setError("No encontramos una cuenta registrada con ese email.")
        } else if (code === "invalid_email") {
          setError("Ingresá un email válido.")
        } else {
          setError("No pudimos enviar el correo. Intentalo nuevamente en unos minutos.")
        }
        return
      }

      setIsSubmitted(true)
    } catch (err: any) {
      setError(err?.message ?? "Ocurrió un error inesperado. Probá nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
          </div>

          <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-orange-400 mb-2">¡Correo enviado!</h2>
            <p className="text-slate-300 mb-6">
              Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>
            </p>
            <Link href="/auth/login">
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold">
                Volver al login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <p className="text-slate-300">Recupera tu acceso</p>
        </div>

        <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-orange-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-orange-400">¿Olvidaste tu contraseña?</h2>
          </div>

          <p className="text-slate-400 text-center mb-6">
            Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {submitting ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-400">¿Recordaste tu contraseña? </span>
            <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
