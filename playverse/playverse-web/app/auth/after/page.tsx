// app/auth/after/page.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Convex
import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";

// Auth local (si lo usás para recordar email y tal; no crea sesión nueva)
import { useAuthStore } from "@/lib/useAuthStore";
import type { AuthState } from "@/lib/useAuthStore";

// Pequeño loader visual
function ScreenLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-slate-900 text-slate-300">
      <div className="flex items-center gap-3">
        <span className="inline-block h-3 w-3 rounded-full bg-orange-400 animate-pulse" />
        <span>Completando inicio de sesión…</span>
      </div>
    </div>
  );
}

// (1) referenciamos tu query de perfil
const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"]
    .getUserByEmail as FunctionReference<"query">;

// (2) saneamos la url "next" para evitar rutas externas
function safeInternalNext(raw: string | null | undefined): string {
  const def = "/";
  if (!raw) return def;
  try {
    const dec = decodeURIComponent(raw);
    if (dec.startsWith("/")) return dec; // solo rutas internas
    return def;
  } catch {
    return def;
  }
}

// (3) helper: detecta si el next apunta a checkout premium
function isPremiumCheckout(nextPath: string) {
  if (!nextPath.startsWith("/checkout/premium")) return false;
  try {
    const u = new URL(
      nextPath,
      typeof window !== "undefined" ? window.location.origin : "https://local"
    );
    const plan = u.searchParams.get("plan");
    return plan === "monthly" || plan === "quarterly" || plan === "annual";
  } catch {
    return false;
  }
}

// (4) anexar flags de bienvenida (para que Header dispare el toast)
function withWelcomeFlags(nextPath: string, provider?: string) {
  try {
    const u = new URL(
      nextPath,
      typeof window !== "undefined" ? window.location.origin : "https://local"
    );
    u.searchParams.set("auth", "ok");
    if (provider) u.searchParams.set("provider", provider);
    return u.pathname + u.search;
  } catch {
    // si falla por ser ruta relativa sin base, devolvemos tal cual
    return nextPath;
  }
}

export default function AfterAuthPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // sesión NextAuth
  const { data: session, status } = useSession();

  // Auth local (por si recordás email, etc.)
  const localUser = useAuthStore((s: AuthState) => s.user);

  // email con el que buscar el perfil en Convex
  const loginEmail =
    session?.user?.email?.toLowerCase() ||
    localUser?.email?.toLowerCase() ||
    null;

  // next deseado
  const rawNext = sp.get("next");
  const next = useMemo(() => safeInternalNext(rawNext), [rawNext]);

  // flags para toast
  const authFlag = sp.get("auth");        // "ok" si viene de login
  const provider = sp.get("provider") || undefined;

  // perfil (rol) desde Convex
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as { role?: "free" | "premium" | "admin" } | null | undefined;

  // Evitar doble navegación (Strict Mode / back button)
  const didNav = useRef(false);

  // redirección según reglas:
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      if (didNav.current) return;
      didNav.current = true;
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // tenemos sesión. Si aún no llegó el perfil desde Convex, esperamos.
    if (typeof profile === "undefined") return;

    if (didNav.current) return;
    didNav.current = true;

    const role = (profile?.role ?? "free") as "free" | "premium" | "admin";

    // destino base
    let dest = next;

    if (isPremiumCheckout(next)) {
      // premium ya no necesita ir a checkout → home
      if (role === "premium") dest = "/";
    }

    // si venimos de login, propagamos flags para que Header muestre el toast
    const finalDest = authFlag === "ok" ? withWelcomeFlags(dest, provider) : dest;

    router.replace(finalDest);
  }, [status, profile, next, router, authFlag, provider]);

  // pantalla de transición
  return <ScreenLoader />;
}
