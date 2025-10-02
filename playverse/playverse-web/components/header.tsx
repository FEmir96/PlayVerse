// app/(tu-layout)/Header.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut, Shield } from "lucide-react";
import { FavoritesDropdown } from "./favorites-dropdown";
import { NotificationsDropdown } from "./notifications-dropdown";

// auth store (email/password)
import { useAuthStore } from "@/lib/useAuthStore";
import type { AuthState } from "@/lib/useAuthStore";

// next-auth
import { useSession } from "next-auth/react";

// shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ✅ favoritos
import { useFavoritesStore, setFavoritesScope } from "@/components/favoritesStore";

// ✅ Convex: perfil para saber el rol
import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";

// ✅ toast
import { useToast } from "@/hooks/use-toast";

const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"]
    .getUserByEmail as FunctionReference<"query">;

export function Header() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [showFavorites, setShowFavorites] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // toast
  const { toast } = useToast();
  const firedWelcome = useRef(false);

  // store local (email/password)
  const localUser = useAuthStore((s: AuthState) => s.user);
  const clearAuth = useAuthStore((s: AuthState) => s.clear);

  // sesión OAuth (Google / Microsoft)
  const { data: session, status } = useSession();

  // logged: true si hay sesión de NextAuth o local
  const logged = useMemo(
    () => status === "authenticated" || Boolean(localUser),
    [status, localUser]
  );

  const displayName = session?.user?.name ?? localUser?.name ?? undefined;
  const displayEmail = session?.user?.email ?? localUser?.email ?? undefined;

  const loginEmail =
    session?.user?.email?.toLowerCase() ||
    localUser?.email?.toLowerCase() ||
    null;

  // Traer perfil para conocer rol
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as { role?: "free" | "premium" | "admin" } | null | undefined;

  const role: "free" | "premium" | "admin" =
    (profile?.role as any) || "free";

  // Mostrar “Premium” sólo para FREE, ADMIN o visitantes
  const shouldShowPremium = !logged || role === "free" || role === "admin";

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // ✅ Activo: subrayado discreto (sin glow persistente)
  // ✅ Hover: glow anaranjado sólo mientras el mouse está encima
  const getLinkClasses = (href: string) => {
    const base =
      "font-medium transition-all duration-200 px-3 py-2 relative rounded-md text-orange-400";
    if (isActiveLink(href)) {
      return [
        base,
        "after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-orange-400 after:rounded-full",
      ].join(" ");
    }
    return [
      base,
      "hover:text-amber-300",
      "hover:bg-orange-400/10 hover:shadow-[0_0_12px_rgba(251,146,60,0.25)]",
    ].join(" ");
  };

  /**
   * ✅ Vincula el scope de favoritos al email del usuario.
   * - Cuando cambia `loginEmail`, cambia el namespace de favoritos.
   * - Si no hay usuario → usa scope de invitado.
   */
  useEffect(() => {
    const scope = loginEmail ?? "__guest__";
    setFavoritesScope(scope);
  }, [loginEmail]);

  /**
   * ✅ Logout unificado en 1 click:
   * - Limpia SIEMPRE la sesión local (Zustand)
   * - Si hay sesión NextAuth, hace signOut SIN redirect (redirect: false)
   * - Resetea scope de favoritos a invitado
   * - Navega con replace al home con ?logout=1
   * - Deshabilita el botón mientras corre para evitar doble click
   */
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // 1) limpiar siempre auth local
      clearAuth();
      try {
        localStorage.removeItem("pv_email");
      } catch {}

      // 2) resetear scope de favoritos a invitado (para no “heredar” favoritos)
      setFavoritesScope("__guest__");

      // 3) si hay sesión NextAuth → signOut sin redirect
      if (status === "authenticated") {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
      }

      // 4) navegar (replace) para refrescar UI y quitar cualquier query
      router.replace("/?logout=1");

      // 5) feedback
      toast({
        title: "Sesión cerrada",
        description: "¡Hasta la próxima! 👋",
      });
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/?logout=1";
      }
    } finally {
      setLoggingOut(false);
    }
  };

  // contador favoritos
  const favCount = useFavoritesStore((s) => s.items.length);

  // 🔔 Mostrar toast de bienvenida después de OAuth (Google/Xbox) y limpiar query
  useEffect(() => {
    if (firedWelcome.current) return;

    const auth = searchParams.get("auth");
    const provider = searchParams.get("provider"); // "google" | "xbox" (nuestro valor)
    if (auth === "ok" && logged) {
      firedWelcome.current = true;

      const provLabel =
        provider === "xbox" ? "Xbox" : provider === "google" ? "Google" : "tu cuenta";

      toast({
        title: `¡Bienvenido, ${displayName ?? "gamer"}!`,
        description: `Inicio de sesión con ${provLabel} exitoso.`,
      });

      // limpiar ?auth=ok&provider=...
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("provider");

      const nextUrl = pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(nextUrl);
    }
  }, [searchParams, logged, pathname, router, toast, displayName]);

  return (
    <header className="bg-slate-900 border-b border-slate-700 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/playverse-logo.png"
              alt="PlayVerse"
              width={80}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/" className={getLinkClasses("/")}>
              Inicio
            </Link>
            <Link href="/catalogo" className={getLinkClasses("/catalogo")}>
              Catálogo
            </Link>
            <Link href="/mis-juegos" className={getLinkClasses("/mis-juegos")}>
              Mis juegos
            </Link>

            {shouldShowPremium && (
              <Link href="/premium" className={getLinkClasses("/premium")}>
                Premium
              </Link>
            )}

            <Link href="/contacto" className={getLinkClasses("/contacto")}>
              Contacto
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {logged && (
              <>
                <NotificationsDropdown />

                {/* Favorites */}
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="relative text-orange-400 hover:text-orange-300"
                    onClick={() => setShowFavorites(!showFavorites)}
                    title="Favoritos"
                  >
                    <Heart className="w-5 h-5" />
                    {favCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-400 text-slate-900 text-[11px] font-extrabold grid place-items-center leading-[18px]">
                        {favCount > 99 ? "99+" : favCount}
                      </span>
                    )}
                  </Button>
                  <FavoritesDropdown
                    isOpen={showFavorites}
                    onClose={() => setShowFavorites(false)}
                  />
                </div>
              </>
            )}

            {/* Auth UI */}
            {!logged ? (
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
                <DropdownMenuTrigger asChild>
                  <div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-orange-400 hover:text-orange-300"
                      title={displayName}
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="z-50 bg-slate-900 border border-slate-700 text-orange-400"
                >
                  <div className="px-3 py-2 text-sm">
                    {displayName && (
                      <div className="font-semibold">{displayName}</div>
                    )}
                    {displayEmail && (
                      <div className="text-xs text-slate-400">{displayEmail}</div>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/perfil" className="w-full flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Ver perfil
                    </Link>
                  </DropdownMenuItem>

                  {/* Solo admins ven el panel */}
                  {role === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="w-full flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Panel Administrador
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={`text-red-400 focus:text-red-400 cursor-pointer ${loggingOut ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? "Cerrando..." : "Cerrar sesión"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
