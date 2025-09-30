// playverse-web/app/checkout/premium/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";

const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"].getUserByEmail as FunctionReference<"query">;

export default function PremiumCheckoutRedirect() {
  const router = useRouter();
  const sp = useSearchParams();
  const plan = sp?.get("plan") ?? "monthly";
  const trial = sp?.get("trial") ?? "";

  const { data: session, status } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail =
    session?.user?.email?.toLowerCase() || storeUser?.email?.toLowerCase() || null;

  // Esperar a que el store hidrate
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as any;

  const redirectedOnce = useRef(false);

  useEffect(() => {
    if (!mounted) return;
    if (redirectedOnce.current) return;
    if (status === "loading") return;

    // Si ya conocemos el perfil → directo al checkout con id
    if (loginEmail && profile?._id) {
      redirectedOnce.current = true;
      const q = new URLSearchParams();
      q.set("plan", plan);
      if (trial) q.set("trial", trial);
      router.replace(`/checkout/premium/${profile._id}?${q.toString()}`);
      return;
    }

    // Si no hay email tras montar → ir al login con next a este redirector
    if (!loginEmail) {
      redirectedOnce.current = true;
      const next = `/checkout/premium?plan=${encodeURIComponent(plan)}${trial ? `&trial=${trial}` : ""}`;
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }, [mounted, status, loginEmail, profile?._id, plan, trial, router]);

  return null;
}
