// playverse-web/app/checkout/premium/page.tsx
"use client";

import { useEffect } from "react";
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

  const { data: session } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail =
    session?.user?.email?.toLowerCase() || storeUser?.email?.toLowerCase() || null;

  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as any;

  useEffect(() => {
    if (!loginEmail) {
      const next = `/checkout/premium?plan=${encodeURIComponent(plan)}${trial ? `&trial=${trial}` : ""}`;
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (profile?._id) {
      const q = new URLSearchParams();
      q.set("plan", plan);
      if (trial) q.set("trial", trial);
      router.replace(`/checkout/premium/${profile._id}?${q.toString()}`);
    }
  }, [loginEmail, profile?._id, plan, trial, router]);

  return null;
}
