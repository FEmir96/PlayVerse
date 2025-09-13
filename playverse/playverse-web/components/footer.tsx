import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image src="/images/playverse-logo.png" alt="PlayVerse" width={80} height={40} className="h-10 w-auto" />
            </Link>
            <p className="text-slate-400 text-sm">
              Tu portal al universo de los juegos. Alquila o compra, ¡La diversión te espera!
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4">
              <div className="w-6 h-6 bg-slate-700 rounded"></div>
              <div className="w-6 h-6 bg-slate-700 rounded"></div>
              <div className="w-6 h-6 bg-slate-700 rounded"></div>
              <div className="w-6 h-6 bg-slate-700 rounded"></div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-medium mb-4">Navegación</h3>
            <div className="flex flex-col space-y-2 items-start">
              <Link href="/" className="inline text-slate-400 hover:text-orange-400 text-sm">
                Inicio
              </Link>
              <Link href="/catalogo" className="inline text-slate-400 hover:text-orange-400 text-sm">
                Catálogo
              </Link>
              <Link href="/mis-juegos" className="inline text-slate-400 hover:text-orange-400 text-sm">
                Mis juegos
              </Link>
              <Link href="/premium" className="inline text-slate-400 hover:text-orange-400 text-sm">
                Házte premium!
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-medium mb-4">Soporte</h3>
            <div className="flex flex-col space-y-2 items-start">
              <Link href="/contacto" className="inline text-slate-400 hover:text-orange-400 text-sm">
                Preguntas frecuentes
              </Link>
              <Link href="/contacto" className="inline text-slate-400 hover:text-orange-400 text-sm">
                Contacto
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-medium mb-4">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-4">¡Nuevos juegos y ofertas exclusivas directo a tu email!</p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Tu@email.com"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium">Anotarme</Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <p className="text-slate-400 text-sm text-center">© 2025 PlayVerse. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
