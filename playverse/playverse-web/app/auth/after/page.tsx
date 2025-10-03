// app/auth/after/page.tsx
"use client";

import { useEffect, useMemo } from "react";
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
    // solo permitimos rutas internas
    if (dec.startsWith("/")) return dec;
    return def;
  } catch {
    return def;
  }
}

// (3) helper: detecta si el next apunta a checkout premium
function isPremiumCheckout(nextPath: string) {
  // /checkout/premium?plan=monthly|quarterly|annual
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

  // perfil (rol) desde Convex
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as { role?: "free" | "premium" | "admin" } | null | undefined;

  // redirección según reglas:
  useEffect(() => {
    // 1) si todavía no hay sesión, no hacemos nada
    if (status === "loading") return;

    // 2) sin sesión -> volvemos a login (manteniendo el next)
    if (status === "unauthenticated") {
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // 3) tenemos sesión. Si aún no llegó el perfil desde Convex, esperamos.
    if (typeof profile === "undefined") return;

    // 4) ya tenemos todo: decidimos
    const role = (profile?.role ?? "free") as "free" | "premium" | "admin";

    // si el destino es checkout premium:
    if (isPremiumCheckout(next)) {
      // - premium: no necesita pasar por checkout → home sin parpadeo
      if (role === "premium") {
        router.replace("/");
        return;
      }
      // - free o admin: lo dejamos ir al checkout del plan elegido
      router.replace(next);
      return;
    }

    // si NO es un checkout premium, simplemente vamos a `next`
    router.replace(next);
  }, [status, profile, next, router]);

  // pantalla de transición
  return <ScreenLoader />;
}
