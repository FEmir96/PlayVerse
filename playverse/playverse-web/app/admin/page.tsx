"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Users, Gamepad2 } from "lucide-react"
import { useAuthStore } from "@/lib/useAuthStore"
import type { AuthState } from "@/lib/useAuthStore"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"games" | "users">("games")
  const [searchTerm, setSearchTerm] = useState("")

  const user = useAuthStore((s: AuthState) => s.user)

  // Mock data for games
  const mockGames = [
    { id: 1, title: "Tomb Raider", category: "Acción", purchasePrice: 19.99, rentalPrice: 2.99 },
    { id: 2, title: "The Witcher 3", category: "RPG", purchasePrice: 29.99, rentalPrice: 4.99 },
    { id: 3, title: "Cyberpunk 2077", category: "RPG", purchasePrice: 39.99, rentalPrice: 6.99 },
    { id: 4, title: "GTA V", category: "Acción", purchasePrice: 24.99, rentalPrice: 3.99 },
    { id: 5, title: "Red Dead Redemption 2", category: "Acción", purchasePrice: 34.99, rentalPrice: 5.99 },
  ]

  // Mock data for users
  const mockUsers = [
    { id: 1, name: "Eros Bianchini", email: "eros@gmail.com", role: "free", status: "Activo" },
    { id: 2, name: "Fernando Faour", email: "fernando@gmail.com", role: "admin", status: "Baneado" },
    { id: 3, name: "María García", email: "maria@gmail.com", role: "premium", status: "Activo" },
    { id: 4, name: "Carlos López", email: "carlos@gmail.com", role: "premium", status: "Activo" },
    { id: 5, name: "Ana Martínez", email: "ana@gmail.com", role: "admin", status: "Activo" },
  ]

  const filteredGames = mockGames.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-orange-400 text-center">Panel de Administración</h1>
                <p className="text-slate-400 mt-1 text-center">
                  Gestiona los usuarios y el catálogo de juegos de PlayVerse
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 justify-center">
          <Button
            variant={activeTab === "games" ? "default" : "outline"}
            onClick={() => setActiveTab("games")}
            className={`flex items-center gap-2 ${
              activeTab === "games"
                ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                : "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Gestionar juegos
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-orange-400 text-slate-900 hover:bg-orange-500"
                : "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 bg-transparent"
            }`}
          >
            <Users className="w-4 h-4" />
            Gestionar usuarios
          </Button>
        </div>

        {/* Games Management */}
        {activeTab === "games" && (
          <div className="space-y-6">
            {/* Search and Add */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-orange-400 placeholder:text-slate-500"
                />
              </div>
              <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir juego
              </Button>
            </div>

            {/* Games Table */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">Título</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Categoría</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Precio compra</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Precio alquiler</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.map((game) => (
                      <tr
                        key={game.id}
                        className="border-b border-slate-700 hover:bg-slate-800/50"
                      >
                        <td className="p-4 text-orange-400 font-medium">{game.title}</td>
                        <td className="p-4 text-slate-300">{game.category}</td>
                        <td className="p-4 text-slate-300">${game.purchasePrice}</td>
                        <td className="p-4 text-slate-300">${game.rentalPrice}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Add */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-orange-400 placeholder:text-slate-500"
                />
              </div>
              <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir usuario
              </Button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">Nombre de usuario</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Email</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Rol</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Estado</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-700 hover:bg-slate-800/50"
                      >
                        <td className="p-4 text-orange-400 font-medium">{user.name}</td>
                        <td className="p-4 text-slate-300">{user.email}</td>
                        <td className="p-4">
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={
                              user.role === "admin"
                                ? "bg-orange-400 text-slate-900"
                                : "bg-slate-700 text-slate-300"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={user.status === "Activo" ? "default" : "destructive"}
                            className={
                              user.status === "Activo"
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
