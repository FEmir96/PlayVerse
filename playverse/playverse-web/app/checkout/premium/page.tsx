// playverse-web/app/checkout/premium/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";

// Convex
const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"].getUserByEmail as FunctionReference<"query">;

// Sanea "next" (solo rutas internas)
function safeInternalNext(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const dec = decodeURIComponent(raw);
    return dec.startsWith("/") ? dec : null;
  } catch {
    return null;
  }
}

export default function PremiumCheckoutRedirect() {
  const router = useRouter();
  const sp = useSearchParams();

  // tomamos plan/trial/next y preservamos todo
  const plan = sp?.get("plan") ?? "monthly";
  const trial = sp?.get("trial") ?? "";
  const nextParam = safeInternalNext(sp?.get("next") ?? null);

  // sesión / store
  const { data: session, status } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail =
    session?.user?.email?.toLowerCase() ||
    storeUser?.email?.toLowerCase() ||
    null;

  // esperar hidratación (evita parpadeos)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // perfil por email (cuando lo tengamos)
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : undefined
  ) as { _id?: string } | null | undefined;

  const redirectedOnce = useRef(false);

  useEffect(() => {
    if (!mounted) return;
    if (redirectedOnce.current) return;
    if (status === "loading") return;

    // sin login → ir al login con next a ESTA ruta (con los params actuales)
    if (!loginEmail) {
      redirectedOnce.current = true;
      const q = new URLSearchParams();
      q.set("plan", plan);
      if (trial) q.set("trial", trial);
      if (nextParam) q.set("next", nextParam);
      const backHere = `/checkout/premium?${q.toString()}`;
      router.replace(`/auth/login?next=${encodeURIComponent(backHere)}`);
      return;
    }

    // tenemos email: esperamos a que cargue el perfil
    if (typeof profile === "undefined") return;

    // si ya llegó el perfil con _id → mandamos al checkout con id
    if (profile?._id) {
      redirectedOnce.current = true;
      const q = new URLSearchParams();
      q.set("plan", plan);
      if (trial) q.set("trial", trial);
      if (nextParam) q.set("next", nextParam);
      router.replace(`/checkout/premium/${profile._id}?${q.toString()}`);
    }
    // si profile === null, aún no existe en DB; normalmente el callback de NextAuth lo crea.
    // Podés dejarlo esperar, o poner un fallback aquí si quisieras.
  }, [mounted, status, loginEmail, profile, plan, trial, nextParam, router]);

  // pequeño loader mientras redirige
  return (
    <div className="min-h-[50vh] grid place-items-center text-slate-300">
      Redirigiendo al checkout…
    </div>
  );
}
