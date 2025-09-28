"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";

const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"]
    .getUserByEmail as FunctionReference<"query">;

// Si ya tenés otra mutación distinta, dejá esto sin usar.
// Lo dejo tipado por si lo necesitás:
const upgradePlanRef =
  (api as any)["mutations/upgradePlan"]
    ?.upgradePlan as FunctionReference<"mutation"> | undefined;

export default function PremiumCheckoutPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const plan = (sp.get("plan") as "monthly" | "quarterly" | "annual") || "monthly";

  const { data: session, status } = useSession();
  const loginEmail = useMemo(
    () => session?.user?.email?.toLowerCase() ?? null,
    [session?.user?.email]
  );

  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as { _id: string; role?: "free" | "premium" | "admin" } | null | undefined;

  // (opcional) si usás realmente upgradePlan desde acá:
  const upgradePlan = upgradePlanRef ? useMutation(upgradePlanRef) : null;

  // Guard 1: Si no hay sesión, ir a login y volver acá
  useEffect(() => {
    if (status === "loading") return;
    if (!loginEmail) {
      const nextUrl = `/checkout/premium/${params.id}?plan=${plan}`;
      window.location.href = `/auth/login?next=${encodeURIComponent(nextUrl)}`;
    }
  }, [status, loginEmail, params.id, plan]);

  // Guard 2: Si el usuario YA ES premium, prohibir checkout
  useEffect(() => {
    const r = (profile?.role ?? "free");
    if (r === "premium") {
      router.replace("/"); // o "/perfil" si querés
    }
  }, [profile?.role, router]);

  // Render sencillo; mantené tu UI existente si ya la tenés.
  // Acá no toco estilos, sólo un layout básico coherente con el resto del sitio.
  async function onConfirm() {
    // Si usás mutation real:
    // if (upgradePlan && profile?._id) {
    //   await upgradePlan({ userId: profile._id, plan });
    // }
    router.replace("/perfil"); // o donde sea tu success
  }

  if (!loginEmail || (profile && profile.role === "premium")) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-slate-300">Redirigiendo…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 text-center mb-2">
          Confirmar suscripción Premium
        </h1>
        <p className="text-slate-300 text-center mb-8">
          Plan seleccionado: <span className="text-white font-semibold">{plan}</span>
        </p>

        <div className="max-w-lg mx-auto bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <ul className="text-slate-300 text-sm space-y-2 mb-6">
            <li>• Acceso premium completo</li>
            <li>• Descuentos exclusivos</li>
            <li>• Soporte prioritario</li>
          </ul>

          <button
            onClick={onConfirm}
            className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold rounded-lg py-3 transition-colors"
          >
            Suscribirme ahora
          </button>

          <p className="text-center text-slate-400 text-xs mt-3">
            Al continuar aceptás los Términos y Condiciones.
          </p>
        </div>
      </div>
    </div>
  );
}
