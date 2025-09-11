import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell, Heart, User } from "lucide-react"

export function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
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
            <Link href="/contacto" className="text-orange-400 hover:text-orange-300 font-medium">
              Contacto
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button size="icon" variant="ghost" className="text-orange-400 hover:text-orange-300">
              <Bell className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-orange-400 hover:text-orange-300">
              <Heart className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-orange-400 hover:text-orange-300">
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent hidden md:inline-flex"
            >
              Iniciar sesión
            </Button>
            <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium hidden md:inline-flex">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
