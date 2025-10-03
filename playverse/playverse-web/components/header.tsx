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

  const { toast } = useToast();
  const firedWelcome = useRef(false);

  // store local (email/password)
  const localUser = useAuthStore((s: AuthState) => s.user);
  const clearAuth = useAuthStore((s: AuthState) => s.clear);

  // sesión OAuth (Google / Microsoft / etc.)
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

  // Activo vs hover
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

  // Vincular scope de favoritos al email del usuario
  useEffect(() => {
    const scope = loginEmail ?? "__guest__";
    setFavoritesScope(scope);
  }, [loginEmail]);

  /**
   * Logout unificado:
   * - Limpia auth local
   * - signOut de NextAuth sin redirect
   * - Scope favoritos a invitado
   * - Navega a "/?logout=1"
   * - ❗Sin toast local (evita duplicado: queda solo el rojo global)
   */
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      clearAuth();
      try {
        localStorage.removeItem("pv_email");
      } catch {}

      setFavoritesScope("__guest__");

      if (status === "authenticated") {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
      }

      router.replace("/?logout=1");
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

  /**
   * Welcome toast después de login:
   * - Caso 1: query ?auth=ok&provider=google|xbox|credentials → muestra y limpia query
   * - Caso 2: si no viene query (p. ej. formulario), muestra 1 sola vez al detectar logged
   */
  useEffect(() => {
    if (firedWelcome.current) return;

    const auth = searchParams.get("auth");
    const provider = (searchParams.get("provider") || "").toLowerCase(); // "google" | "xbox" | "credentials"

    const showWelcome = (provLabel?: string) => {
      if (firedWelcome.current) return;
      firedWelcome.current = true;

      // Evitar repetir entre navegaciones de la misma sesión
      try {
        if (sessionStorage.getItem("pv_welcomed") === "1") return;
        sessionStorage.setItem("pv_welcomed", "1");
      } catch {}

      toast({
        title: `¡Bienvenido, ${displayName ?? "gamer"}!`,
        description: `Inicio de sesión con ${provLabel ?? "tu cuenta"} exitoso.`,
      });
    };

    if (auth === "ok" && logged) {
      const provLabel =
        provider === "xbox" ? "Xbox" :
        provider === "google" ? "Google" :
        provider === "credentials" ? "tu cuenta" :
        "tu cuenta";

      showWelcome(provLabel);

      // limpiar ?auth=ok&provider=...
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("provider");
      const nextUrl = pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(nextUrl);
      return;
    }

    // Fallback: si no hay query pero ya está logueado (ej. login por formulario sin qs)
    if (logged) {
      showWelcome(); // "tu cuenta"
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
                    className="relative text-orange-400 rounded-xl transition-all duration-200
                               hover:text-amber-300 hover:bg-orange-400/10
                               hover:shadow-[0_0_18px_rgba(251,146,60,0.35)]
                               hover:ring-1 hover:ring-orange-400/40
                               focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-orange-400/60"
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
                      className="relative text-orange-400 rounded-xl transition-all duration-200
                                 hover:text-amber-300 hover:bg-orange-400/10
                                 hover:shadow-[0_0_18px_rgba(251,146,60,0.35)]
                                 hover:ring-1 hover:ring-orange-400/40
                                 focus-visible:outline-none
                                 focus-visible:ring-2 focus-visible:ring-orange-400/60"
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

                  <DropdownMenuItem asChild>
                    <Link
                      href="/perfil"
                      className="cursor-pointer w-full flex items-center gap-2 rounded-md transition-all duration-200
                                hover:bg-orange-400/10 hover:text-amber-300
                                hover:shadow-[0_0_18px_rgba(251,146,60,0.35)]
                                hover:ring-1 hover:ring-orange-400/40
                                focus-visible:outline-none
                                focus-visible:ring-2 focus-visible:ring-orange-400/60"
                    >
                      <User className="w-4 h-4" />
                      Ver perfil
                    </Link>
                  </DropdownMenuItem>

                  {/* Solo admins ven el panel */}
                  {role === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/admin"
                        className="cursor-pointer w-full flex items-center gap-2 rounded-md transition-all duration-200
                                  hover:bg-orange-400/10 hover:text-amber-300
                                  hover:shadow-[0_0_18px_rgba(251,146,60,0.35)]
                                  hover:ring-1 hover:ring-orange-400/40
                                  focus-visible:outline-none
                                  focus-visible:ring-2 focus-visible:ring-orange-400/60"
                      >
                        <Shield className="w-4 h-4" />
                        Panel Administrador
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={`cursor-pointer rounded-md transition-all duration-200
                                text-red-400 focus:text-red-400
                                hover:bg-red-400/10
                                hover:shadow-[0_0_18px_rgba(248,113,113,0.35)]
                                hover:ring-1 hover:ring-red-400/40
                                focus-visible:outline-none
                                focus-visible:ring-2 focus-visible:ring-red-400/60
                                ${loggingOut ? "opacity-60 pointer-events-none" : ""}`}
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
