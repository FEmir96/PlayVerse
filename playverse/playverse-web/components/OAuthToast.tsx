"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function OAuthToast() {
  const { toast } = useToast();
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const prov = search?.get("oauth");
    if (!prov) return;

    const nice =
      prov === "google" ? "Google" :
      prov === "xbox"   ? "Xbox"   :
      "tu cuenta";

    toast({
      title: `¡Bienvenido!`,
      description: `Inicio de sesión con ${nice} exitoso.`,
    });

    // limpiar la query para que no se repita el toast
    const params = new URLSearchParams(search!.toString());
    params.delete("oauth");
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pathname]);

  return null;
}
