"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Lock,
  Edit2,
  Save,
  X,
  Crown,
  CreditCard,
  Gamepad2,
  Calendar,
  Star,
  Trash2,
  Plus,
  Settings,
} from "lucide-react"
import { useAuthStore } from "@/lib/useAuthStore"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || "")
  const [editedPassword, setEditedPassword] = useState("")

  // Mock data - replace with real data from Convex
  const mockGames = [
    { id: 1, title: "Cyberpunk 2077", type: "purchased", image: "/cyberpunk-game-cover.png", playTime: "45h" },
    { id: 2, title: "The Witcher 3", type: "rented", image: "/witcher-3-inspired-cover.png", expiresIn: "3 días" },
    {
      id: 3,
      title: "Red Dead Redemption 2",
      type: "purchased",
      image: "/red-dead-redemption-game-cover.jpg",
      playTime: "120h",
    },
  ]

  const mockPaymentMethods = [
    { id: 1, type: "visa", last4: "4242", expiryDate: "12/25" },
    { id: 2, type: "mastercard", last4: "8888", expiryDate: "08/26" },
  ]

  const handleSave = () => {
    // TODO: Implement save functionality with Convex
    console.log("Saving profile changes:", { name: editedName, password: editedPassword })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(user?.name || "")
    setEditedPassword("")
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-400 mb-2">{user?.name || "Usuario"}</h1>
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-400 text-slate-900">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* First Row - Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-orange-400">Información Personal</CardTitle>
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} className="bg-orange-400 hover:bg-orange-500 text-slate-900">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Nombre de usuario</Label>
                  {isEditing ? (
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  ) : (
                    <p className="text-white mt-1">{user?.name || "Usuario"}</p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-300">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-400">{user?.email || "email@ejemplo.com"}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Contraseña</Label>
                  {isEditing ? (
                    <Input
                      type="password"
                      placeholder="Nueva contraseña (opcional)"
                      value={editedPassword}
                      onChange={(e) => setEditedPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-400">••••••••</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-orange-400">Suscripción Premium</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Plan Premium</p>
                    <p className="text-slate-400 text-sm">Renovación: 15 de enero, 2025</p>
                  </div>
                  <Badge className="bg-orange-400 text-slate-900">Activo</Badge>
                </div>
                <Separator className="bg-slate-700" />
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent"
                >
                  Cancelar suscripción
                </Button>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-orange-400">Métodos de Pago</CardTitle>
                <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPaymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white text-sm">•••• {method.last4}</p>
                        <p className="text-slate-400 text-xs">Expira {method.expiryDate}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Games Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchased Games */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Juegos Comprados
                </CardTitle>
                <Link href="/mis-juegos">
                  <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                    <Settings className="w-4 h-4 mr-2" />
                    Administrar mis juegos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGames
                    .filter((game) => game.type === "purchased")
                    .map((game) => (
                      <div key={game.id} className="bg-slate-700 rounded-lg p-4 flex items-center gap-4">
                        <img
                          src={game.image || "/placeholder.svg"}
                          alt={game.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{game.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400 text-sm">{game.playTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Rented Games */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Juegos Alquilados
                </CardTitle>
                <Link href="/mis-juegos">
                  <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                    <Settings className="w-4 h-4 mr-2" />
                    Administrar mis juegos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGames
                    .filter((game) => game.type === "rented")
                    .map((game) => (
                      <div key={game.id} className="bg-slate-700 rounded-lg p-4 flex items-center gap-4">
                        <img
                          src={game.image || "/placeholder.svg"}
                          alt={game.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{game.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-red-400" />
                            <span className="text-red-400 text-sm">Expira en {game.expiresIn}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
