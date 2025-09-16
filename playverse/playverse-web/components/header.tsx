"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation" // Added usePathname import
import { Button } from "@/components/ui/button"
import { Heart, User } from "lucide-react"
import { FavoritesDropdown } from "./favorites-dropdown"
import { NotificationsDropdown } from "./notifications-dropdown"

export function Header() {
  const [showFavorites, setShowFavorites] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would come from auth context in real app
  const pathname = usePathname() // Added pathname hook to detect current page

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const getLinkClasses = (href: string) => {
    const baseClasses = "font-medium transition-all duration-200 px-3 py-2 relative"
    if (isActiveLink(href)) {
      return `${baseClasses} text-orange-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-400 after:rounded-full after:font-bold`
    }
    return `${baseClasses} text-orange-400 hover:text-yellow-400`
  }

  return (
    <header className="bg-slate-900 border-b border-slate-700 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/playverse-logo.png" alt="PlayVerse" width={80} height={40} className="h-10 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={getLinkClasses("/")}>
              Inicio
            </Link>
            <Link href="/catalogo" className={getLinkClasses("/catalogo")}>
              Catálogo
            </Link>
            <Link href="/mis-juegos" className={getLinkClasses("/mis-juegos")}>
              Mis juegos
            </Link>
            <Link href="/premium" className={getLinkClasses("/premium")}>
              Premium
            </Link>
            <Link href="/contacto" className={getLinkClasses("/contacto")}>
              Contacto
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <NotificationsDropdown />

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
    </header>
  )
}
