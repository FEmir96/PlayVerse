"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sesión + store local
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/useAuthStore";

// Convex (perfil → rol)
import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";

const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"].getUserByEmail as FunctionReference<"query">;

// ───────────────────────────────────────────────────────────────────────────────
// Datos UI (idénticos a los que tenías)
// ───────────────────────────────────────────────────────────────────────────────
const premiumPlans = [
  {
    id: "monthly",
    name: "Mensual",
    price: "$9.99",
    period: "/mes",
    description: "Perfecto para probar la experiencia",
    popular: false,
    features: ["Acceso a toda la biblioteca", "Descuentos del 10%", "Cero publicidad", "Soporte prioritario"],
  },
  {
    id: "annual",
    name: "Anual",
    price: "$89.99",
    period: "/año",
    description: "Ahorra $30",
    popular: true,
    originalPrice: "$119.88",
    features: ["La más conveniente", "3 meses gratis", "Todo lo de mensual", "Acceso anticipado a juegos"],
  },
  // Renombrado desde "lifetime"
  {
    id: "quarterly",
    name: "Trimestral",
    price: "$24.99",
    period: "/3 meses",
    description: "Equilibrio perfecto entre precio y flexibilidad",
    popular: false,
    features: ["Mejor precio que mensual", "Todo lo de mensual", "Renovación cada 3 meses", "Sin permanencia"],
  },
];

const premiumBenefits = [
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
    title: "Acceso ilimitado",
    description: "Disfruta de toda nuestra biblioteca de juegos sin restricciones",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: "Cero publicidad",
    description: "Experiencia de juego sin interrupciones ni anuncios molestos",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: "Descuentos exclusivos",
    description: "Hasta 10% de descuento en compras y alquileres de juegos",
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname() || "/premium";

  // Estado UI (se mantiene aunque no sea estrictamente necesario)
  const [selectedPlan, setSelectedPlan] = useState("annual");

  // Sesión + store local
  const { data: session, status } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail =
    session?.user?.email?.toLowerCase() ||
    storeUser?.email?.toLowerCase() ||
    null;

  // Perfil para conocer rol (y _id para el checkout dinámico)
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as ({ _id: string; role?: "free" | "premium" | "admin" } | null | undefined);

  const role: "free" | "premium" | "admin" = (profile?.role as any) || "free";
  const profileLoaded = loginEmail ? profile !== undefined : true;

  // Lectura de intent del querystring
  const intent = search.get("intent") || null;
  const planParam = search.get("plan") || "monthly";
  const trial = search.get("trial") === "true";

  // Evitar dobles redirecciones en dev/StrictMode
  const redirectedOnce = useRef(false);

  // Redirección centralizada para el flujo de suscripción (PATCH aplicado)
  useEffect(() => {
    if (intent !== "subscribe") return;
    if (redirectedOnce.current) return;

    // Mientras carga la sesión, esperamos (evita parpadeo)
    if (status === "loading") return;

    // Si no hay sesión → mandar a login con next=esta misma URL (para continuar después)
    if (!loginEmail) {
      redirectedOnce.current = true;
      const nextUrl = `${pathname}?${search.toString()}`;
      router.replace(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    // Si hay sesión, esperamos a tener rol/_id
    if (!profileLoaded) return;

    // Con rol en mano: premium → Home | free/admin → Checkout Premium **dinámico por ID**
    redirectedOnce.current = true;
    if (role === "premium") {
      router.replace("/");
    } else {
      const pid = profile?._id;
      const qs = `plan=${planParam}${trial ? "&trial=true" : ""}`;
      if (pid) {
        router.replace(`/checkout/premium/${pid}?${qs}`);
      } else {
        // Fallback por si tu query no devuelve _id (no debería pasar)
        router.replace(`/checkout/premium?${qs}`);
      }
    }
  }, [intent, status, loginEmail, profileLoaded, role, planParam, trial, router, pathname, search, profile?._id]);

  // Guard anti-flash: no renderizar Premium mientras decide a dónde ir
  const isRedirecting =
    intent === "subscribe" &&
    (status === "loading" || !loginEmail || (loginEmail && !profileLoaded));

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-slate-900 grid place-items-center">
        <div className="text-slate-300">Redirigiendo…</div>
      </div>
    );
  }

  // Handlers (disparan el intent sin tocar el UI)
  const pushSubscribeIntent = (planId: string, withTrial = false) => {
    const q = new URLSearchParams({ intent: "subscribe", plan: planId });
    if (withTrial) q.set("trial", "true");
    router.push(`/premium?${q.toString()}`);
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    pushSubscribeIntent(planId, false);
  };

  const handleFreeTrial = () => {
    setSelectedPlan("monthly");
    pushSubscribeIntent("monthly", true);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render UI (idéntico al que compartiste)
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-teal-500/20 to-purple-600/20" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-400/20 border border-orange-400/30 rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-orange-400 font-medium">Premium</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Desbloquea el</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-teal-400 bg-clip-text text-transparent">
                poder del gaming
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Accede a toda nuestra biblioteca, disfruta de descuentos exclusivos y vive la mejor experiencia gaming sin
              límites ni interrupciones.
            </p>

            <Button
              onClick={handleFreeTrial}
              size="lg"
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8 py-4 text-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Prueba gratuita de 7 días
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">¿Por qué elegir Premium?</h2>
          <p className="text-slate-400 text-lg">Descubre todos los beneficios que tenemos para ti</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {premiumBenefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-400/20 border border-orange-400/30 rounded-full text-orange-400 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Elige tu plan</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {premiumPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-800/50 border rounded-xl p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-orange-400 shadow-lg shadow-orange-400/20"
                  : "border-slate-600 hover:border-orange-400/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-400 text-slate-900 px-4 py-1 font-semibold">Más popular</Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-teal-400">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                {"originalPrice" in plan && (plan as any).originalPrice && (
                  <div className="text-sm text-slate-500 line-through mb-1">{(plan as any).originalPrice}</div>
                )}
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full font-semibold py-3 ${
                  plan.popular
                    ? "bg-orange-400 hover:bg-orange-500 text-slate-900"
                    : "bg-transparent border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                Suscribirse
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-400/10 to-teal-400/10 border-t border-orange-400/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para la experiencia Premium?</h2>
            <p className="text-slate-300 mb-8 text-lg">
              Únete a miles de gamers que ya disfrutan de la mejor experiencia gaming sin límites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleFreeTrial}
                size="lg"
                className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8"
              >
                Comenzar prueba gratuita
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
