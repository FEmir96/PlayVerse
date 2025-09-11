"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell, Heart, User, Key } from "lucide-react"
import { FavoritesDropdown } from "./favorites-dropdown"
import { KeyActivationModal } from "./key-activation-modal"

export function Header() {
  const [showFavorites, setShowFavorites] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would come from auth context in real app

  return (
    <header className="bg-slate-900 border-b border-slate-700 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/playverse-logo.png" alt="PlayVerse" width={80} height={40} className="h-10 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-orange-400 hover:text-orange-300 font-medium">
              Inicio
            </Link>
            <Link href="/catalogo" className="text-orange-400 hover:text-orange-300 font-medium">
              Catálogo
            </Link>
            <Link href="/mis-juegos" className="text-orange-400 hover:text-orange-300 font-medium">
              Mis juegos
            </Link>
            <Link href="/premium" className="text-orange-400 hover:text-orange-300 font-medium">
              Premium
            </Link>
            <Link href="/contacto" className="text-orange-400 hover:text-orange-300 font-medium">
              Contacto
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button size="icon" variant="ghost" className="text-orange-400 hover:text-orange-300">
              <Bell className="w-5 h-5" />
            </Button>

            {/* Favorites Button with Dropdown */}
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                className="text-orange-400 hover:text-orange-300"
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <Heart className="w-5 h-5" />
              </Button>
              <FavoritesDropdown isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
            </div>

            {/* Key Activation Button */}
            <Button
              size="icon"
              variant="ghost"
              className="text-orange-400 hover:text-orange-300"
              onClick={() => setShowKeyModal(true)}
              title="Activar clave de juego"
            >
              <Key className="w-5 h-5" />
            </Button>

            <Button size="icon" variant="ghost" className="text-orange-400 hover:text-orange-300">
              <User className="w-5 h-5" />
            </Button>

            {!isLoggedIn ? (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent hidden md:inline-flex"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium hidden md:inline-flex">
                    Registrarse
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="outline"
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent hidden md:inline-flex"
                onClick={() => setIsLoggedIn(false)}
              >
                Cerrar sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      <KeyActivationModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </header>
  )
}
