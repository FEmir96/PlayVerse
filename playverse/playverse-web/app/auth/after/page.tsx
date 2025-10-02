// playverse-web/app/auth/after/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function AfterAuthPage() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let tries = 0;
      let s = await getSession();
      while (!cancelled && (!s || !s.user) && tries < 6) {
        await new Promise(r => setTimeout(r, 180));
        s = await getSession();
        tries++;
      }
      const next = sp.get("next");
      const role = (s?.user as any)?.role ?? "free";

      if (next && next.startsWith("/")) {
        router.replace(next);
      } else if (role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    })();

    return () => { cancelled = true; };
  }, [router, sp]);

  return <div className="min-h-[60vh] grid place-items-center text-slate-300">Entrando…</div>;
}
