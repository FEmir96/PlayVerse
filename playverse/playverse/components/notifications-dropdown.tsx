"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Clock, Star, Gift, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: "rental" | "new-game" | "discount" | "achievement"
  title: string
  message: string
  time: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "rental",
    title: "Alquiler por vencer",
    message: "Tu alquiler de Tomb Raider vencerá en 2 días",
    time: "Hace 1 hora",
    isRead: false,
  },
  {
    id: "2",
    type: "new-game",
    title: "Nuevo juego disponible",
    message: "Cyberpunk 2077 ya está disponible para alquilar",
    time: "Hace 3 horas",
    isRead: false,
  },
  {
    id: "3",
    type: "discount",
    title: "Descuento especial",
    message: "50% de descuento en juegos de acción esta semana",
    time: "Hace 1 día",
    isRead: true,
  },
  {
    id: "4",
    type: "new-game",
    title: "Próximo lanzamiento",
    message: "GTA VI estará disponible la próxima semana",
    time: "Hace 2 días",
    isRead: true,
  },
  {
    id: "5",
    type: "achievement",
    title: "Logro desbloqueado",
    message: "Has completado 10 juegos este mes",
    time: "Hace 3 días",
    isRead: true,
  },
]

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "rental":
        return <Clock className="w-4 h-4 text-orange-400" />
      case "new-game":
        return <Gamepad2 className="w-4 h-4 text-cyan-400" />
      case "discount":
        return <Gift className="w-4 h-4 text-purple-400" />
      case "achievement":
        return <Star className="w-4 h-4 text-yellow-400" />
      default:
        return <Bell className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-orange-400 hover:text-orange-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-orange-400 text-slate-900 border-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-orange-400 font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-orange-400"
                onClick={markAllAsRead}
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 last:border-b-0 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-slate-750 hover:bg-slate-700" : "hover:bg-slate-750"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.isRead ? "text-orange-400" : "text-slate-300"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-400 mb-1">{notification.message}</p>
                      <p className="text-xs text-slate-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 text-center">
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 text-sm">
                Ver todas las notificaciones
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
