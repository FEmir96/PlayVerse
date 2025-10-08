// app/auth/after/page.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

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

function safeInternalNext(raw: string | null | undefined): string {
  const def = "/";
  if (!raw) return def;
  try {
    const dec = decodeURIComponent(raw);
    return dec.startsWith("/") ? dec : def;
  } catch {
    return def;
  }
}

// acepta ?next=... o ?callbackUrl=...
function pickNextParam(sp: URLSearchParams): string | null {
  const directNext = sp.get("next");
  if (directNext) return directNext;

  const cb = sp.get("callbackUrl");
  if (!cb) return null;
  try {
    const u = new URL(
      decodeURIComponent(cb),
      typeof window !== "undefined" ? window.location.origin : "https://local"
    );
    const innerNext = u.searchParams.get("next");
    if (innerNext) return innerNext;
    const internal = u.pathname + u.search;
    return internal.startsWith("/") ? internal : null;
  } catch {
    return null;
  }
}

function withWelcomeFlags(nextPath: string, provider?: string) {
  try {
    const u = new URL(
      nextPath,
      typeof window !== "undefined" ? window.location.origin : "https://local"
    );
    // preserva post, gid, etc.
    u.searchParams.set("auth", "ok");
    if (provider) u.searchParams.set("provider", provider);
    return u.pathname + u.search;
  } catch {
    return nextPath;
  }
}

export default function AfterAuthPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data: session, status } = useSession();

  const email = session?.user?.email?.toLowerCase() || null;
  const rawNext = pickNextParam(sp);
  const next = useMemo(() => safeInternalNext(rawNext), [rawNext]);

  const authFlag = sp.get("auth");
  const provider = sp.get("provider") || undefined;

  // opcional: lo seguimos consultando, pero NO bloqueamos la navegación
  const profile = useQuery(
    api.queries.getUserByEmail.getUserByEmail as any,
    email ? { email } : "skip"
  ) as { role?: "free" | "premium" | "admin" } | null | undefined;

  const didNav = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (didNav.current) return;

    if (status === "unauthenticated") {
      didNav.current = true;
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // ✅ con sesión → navega YA (sin esperar profile) para evitar “hang”
    didNav.current = true;

    // Si querés evitar mandar premium a su propio checkout, podés descomentar esto:
    // const isPremiumCheckout = next.startsWith("/checkout/premium");
    // if (isPremiumCheckout && (profile?.role ?? "free") === "premium") {
    //   router.replace("/");
    //   setTimeout(() => router.refresh(), 0);
    //   return;
    // }

    const finalDest = authFlag === "ok" ? withWelcomeFlags(next, provider) : next;
    router.replace(finalDest);
    // refresco corto para que el Header levante la sesión
    setTimeout(() => {
      try { router.refresh(); } catch {}
    }, 0);
  }, [status, next, router, authFlag, provider, profile?.role]);

  return <ScreenLoader />;
}
