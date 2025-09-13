"use client"
import Link from "next/link"
import Image from "next/image"

interface FavoriteGame {
  id: string
  title: string
  image: string
  description: string
  rentalPrice: string
  purchasePrice: string
}

const favoriteGames: FavoriteGame[] = [
  {
    id: "1",
    title: "Tomb Raider",
    image: "/tomb-raider-game-cover.jpg",
    description: "Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique",
    rentalPrice: "$2.99/mes",
    purchasePrice: "$19.99",
  },
  {
    id: "2",
    title: "Tomb Raider",
    image: "/tomb-raider-game-cover.jpg",
    description: "Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique",
    rentalPrice: "$2.99/mes",
    purchasePrice: "$19.99",
  },
]

interface FavoritesDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function FavoritesDropdown({ isOpen, onClose }: FavoritesDropdownProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-orange-400/30 rounded-lg shadow-xl z-50">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Mis Favoritos</h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {favoriteGames.map((game) => (
              <Link
                key={game.id}
                href={`/juego/${game.id}`}
                className="flex gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                onClick={onClose}
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm mb-1">{game.title}</h4>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{game.description}</p>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-teal-400">Alquiler</span>
                      <div className="text-white font-medium">{game.rentalPrice}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-teal-400">Compra</span>
                      <div className="text-white font-medium">{game.purchasePrice}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {favoriteGames.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <p>No tienes juegos favoritos aún</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
