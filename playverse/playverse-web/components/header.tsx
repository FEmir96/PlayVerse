// playverse-web/components/header.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, User, LogOut } from "lucide-react"
import { FavoritesDropdown } from "./favorites-dropdown"
import { NotificationsDropdown } from "./notifications-dropdown"


// auth store
import { useAuthStore } from "@/lib/useAuthStore"
import type { AuthState } from "@/lib/useAuthStore"

// shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const router = useRouter()

  // ✅ fallback si pathname viniera null
  const pathname = usePathname() ?? "/"

  const [showFavorites, setShowFavorites] = useState(false)

  // ✅ selectores tipados (evita "implicitly any")
  const user = useAuthStore((s: AuthState) => s.user)
  const clearAuth = useAuthStore((s: AuthState) => s.clear)

  // 👉 estado controlado para abrir por hover o click
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const getLinkClasses = (href: string) => {
    const baseClasses = "font-medium transition-all duration-200 px-3 py-2 relative"
    if (isActiveLink(href)) {
      return `${baseClasses} text-orange-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-400 after:rounded-full after:font-bold`
    }
    return `${baseClasses} text-orange-400 hover:text-yellow-400`
  }

  const handleLogout = () => {
    clearAuth()
    localStorage.removeItem("pv_email")
    router.push("/auth/login")
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

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <NotificationsDropdown />

                {/* Favorites */}
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
              </>
            )}

            {/* Auth UI */}
            {!user ? (
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
              <DropdownMenu>
                {/* Abrir por hover o click */}
                <DropdownMenuTrigger asChild>
                  <div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-orange-400 hover:text-orange-300"
                      title={user.name}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="z-50 bg-slate-900 border border-slate-700 text-orange-400"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 text-sm">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/perfil" className="w-full">
                        <User className="w-4 h-4" />
                        Ver perfil
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
