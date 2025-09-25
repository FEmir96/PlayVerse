"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";
import type { Id } from "@convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/useAuthStore";

// —— Refs (robustas) ——
const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"].getUserByEmail as FunctionReference<"query">;

const HAS_PM_QUERY = Boolean((api as any)["queries/getPaymentMethods"]?.getPaymentMethods);
const getPaymentMethodsRef = (HAS_PM_QUERY
  ? (api as any)["queries/getPaymentMethods"].getPaymentMethods
  : (api as any)["queries/getUserByEmail"].getUserByEmail) as FunctionReference<"query">;

const getGameByIdRef = ((api as any)["queries/getGameById"]?.getGameById ||
  (api as any)["queries/getGames"]?.getGames) as FunctionReference<"query">;

const startRentalRef = (api as any).transactions.startRental as FunctionReference<"mutation">;
const savePaymentMethodRef =
  (api as any)["mutations/savePaymentMethod"].savePaymentMethod as FunctionReference<"mutation">;

type PM = {
  _id: string;
  brand: "visa" | "mastercard" | "amex" | "otro";
  last4: string;
  expMonth: number;
  expYear: number;
};

export default function RentCheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Identidad
  const { data: session } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail = session?.user?.email?.toLowerCase() || storeUser?.email?.toLowerCase() || null;

  useEffect(() => {
    if (!loginEmail) {
router.replace(`/auth/login?next=${encodeURIComponent(pathname ?? "/")}`);
    }
  }, [loginEmail, router, pathname]);

  // Perfil (usar undefined para skip)
  const profile = useQuery(getUserByEmailRef, loginEmail ? { email: loginEmail } : undefined);

  // Juego (usar undefined para skip)
// Juego (evitar comparar refs por identidad)
const HAS_GET_BY_ID = Boolean((api as any)["queries/getGameById"]?.getGameById);

const game = useQuery(
  (HAS_GET_BY_ID
    ? (api as any)["queries/getGameById"].getGameById
    : (api as any)["queries/getGames"]?.getGames) as any,
  (HAS_GET_BY_ID ? ({ id: params.id as Id<"games"> } as any) : undefined) as any
) as
  | { _id: Id<"games">; title?: string; cover_url?: string; weekly_price?: number }
  | null
  | undefined;


  // Métodos guardados (usar undefined para skip)
  const methods = useQuery(
    getPaymentMethodsRef as any,
    HAS_PM_QUERY && profile?._id ? { userId: profile._id } : undefined
  ) as PM[] | undefined;

  const savePaymentMethod = useMutation(savePaymentMethodRef);
  const startRental = useMutation(startRentalRef);

  // UI
  const [weeks, setWeeks] = useState(2);
  const [useSaved, setUseSaved] = useState(true);
  const [rememberNew, setRememberNew] = useState(false);

  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const weeklyPrice = useMemo(() => {
    if (typeof (game as any)?.weekly_price === "number") return (game as any).weekly_price;
    return 14.99; // fallback
  }, [game]);

  const total = useMemo(() => weeklyPrice * weeks, [weeklyPrice, weeks]);
// ——— helper para normalizar marca (por si quedó con otro casing) ———
const normalizeBrand = (b?: string): PM["brand"] => {
  const s = (b || "").toLowerCase();
  if (s.includes("visa")) return "visa";
  if (s.includes("master")) return "mastercard";
  if (s.includes("amex") || s.includes("american")) return "amex";
  return "otro";
};

// ——— fallback: si no hay métodos en la tabla, uso el guardado en el perfil ———
const pmFromProfile: PM | null = useMemo(() => {
  const p: any = profile;
  if (!p) return null;

  // 1) Si el perfil tiene un arreglo embebido de métodos:
  const arr = p.paymentMethods ?? p.payment_methods;
  if (Array.isArray(arr) && arr.length > 0) {
    const m = arr[0] || {};
    return {
      _id: m._id ?? "profile",
      brand: normalizeBrand(m.brand),
      last4: String(m.last4 ?? "").slice(-4),
      expMonth: Number(m.expMonth ?? m.exp_month ?? 0),
      expYear: Number(m.expYear ?? m.exp_year ?? 0),
    };
  }

  // 2) Si el perfil tiene campos planos:
  const last4 = p.pmLast4 ?? p.cardLast4 ?? p.last4;
  const expMonth = p.pmExpMonth ?? p.cardExpMonth ?? p.expMonth;
  const expYear = p.pmExpYear ?? p.cardExpYear ?? p.expYear;
  const brand = p.pmBrand ?? p.cardBrand ?? p.brand;

  if (last4 && expMonth && expYear && brand) {
    return {
      _id: "profile",
      brand: normalizeBrand(brand),
      last4: String(last4).slice(-4),
      expMonth: Number(expMonth),
      expYear: Number(expYear),
    };
  }
  return null;
}, [profile]);

// ——— prioridad: tabla payment_methods; si no hay, uso el del perfil ———
const primaryPM = (methods && methods.length > 0 ? methods[0] : null) ?? pmFromProfile;

  const onRent = async () => {
    if (!profile?._id || !game?._id) return;
    try {
      if (!useSaved && rememberNew) {
        await savePaymentMethod({
          userId: profile._id,
          fullNumber: number,
          exp,
          cvv: cvc,
          brand: undefined,
        });
      }

      await startRental({
        userId: profile._id,
        gameId: game._id,
        weeks,
        weeklyPrice, // registra pago + email
      });

      toast({ title: "Alquiler confirmado", description: "Te enviamos un email con los detalles." });
      router.replace("/mis-juegos");
    } catch (e: any) {
      toast({
        title: "No se pudo completar el alquiler",
        description: e?.message ?? "Intentá nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (!loginEmail) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-slate-300">Redirigiendo al login…</p>
      </div>
    );
  }

  const title = game?.title ?? "Juego";
  const cover = game?.cover_url ?? "/placeholder.svg";

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 text-center mb-2">
        Confirmar alquiler
      </h1>
      <p className="text-slate-300 text-center mb-8">Estás alquilando:</p>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Izquierda */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
          <div className="rounded-xl overflow-hidden bg-slate-700">
            <img src={cover} alt={title} className="w-full h-[420px] object-cover" />
          </div>
        </div>

        {/* Derecha */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl font-black text-emerald-300">
              {weeklyPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              <span className="text-slate-300 text-base font-medium">/sem</span>
            </div>
            <p className="text-sm text-amber-400 mt-2">
              Podrías ahorrarte un 10% suscribiéndote a premium, ¡no te lo pierdas!
            </p>
          </div>

          {/* Semanas */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-2">
              Semanas de alquiler: <span className="text-white font-semibold">{weeks}</span>
            </p>
            <Slider value={[weeks]} min={1} max={12} step={1} onValueChange={(v) => setWeeks(v[0] ?? 1)} />
          </div>

          {/* Total */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-amber-400">
                Total: {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </div>
            </div>
          </div>

          {/* Pago */}
          {primaryPM ? (
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">Método de pago</p>
                <div className="flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={useSaved} onCheckedChange={(v) => setUseSaved(v === true)} />
                    Usar tarjeta guardada
                  </label>
                </div>
              </div>

              {useSaved ? (
                <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
                  <div>
                    <p className="text-slate-200 text-sm">{primaryPM.brand.toUpperCase()} •••• {primaryPM.last4}</p>
                    <p className="text-slate-400 text-xs">
                      Expira {String(primaryPM.expMonth).padStart(2, "0")}/{String(primaryPM.expYear).slice(-2)}
                    </p>
                  </div>
                  <span className="text-xs text-emerald-300">Seleccionada</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-slate-300 text-sm">Nombre del titular</label>
                    <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nombre en la tarjeta" className="bg-slate-700 border-slate-600 text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm">Número de tarjeta</label>
                    <Input
                      value={number}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 19);
                        setNumber(d.replace(/(\d{4})(?=\d)/g, "$1 ").trim());
                      }}
                      placeholder="4111 1111 1111 1111"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 text-sm">Fecha de expiración</label>
                      <Input
                        value={exp}
                        onChange={(e) => {
                          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setExp(d.length <= 2 ? d : d.slice(0, 2) + "/" + d.slice(2));
                        }}
                        placeholder="MM/YY"
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm">CVC</label>
                      <Input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" className="bg-slate-700 border-slate-600 text-white mt-1" inputMode="numeric" autoComplete="cc-csc" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox checked={rememberNew} onCheckedChange={(v) => setRememberNew(v === true)} />
                    <span className="text-slate-300 text-sm">Guardar método de pago</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-slate-300 text-sm">Nombre del titular</label>
                <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nombre en la tarjeta" className="bg-slate-700 border-slate-600 text-white mt-1" />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Número de tarjeta</label>
                <Input
                  value={number}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 19);
                    setNumber(d.replace(/(\d{4})(?=\d)/g, "$1 ").trim());
                  }}
                  placeholder="4111 1111 1111 1111"
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-sm">Fecha de expiración</label>
                  <Input
                    value={exp}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setExp(d.length <= 2 ? d : d.slice(0, 2) + "/" + d.slice(2));
                    }}
                    placeholder="MM/YY"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">CVC</label>
                  <Input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" className="bg-slate-700 border-slate-600 text-white mt-1" inputMode="numeric" autoComplete="cc-csc" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox checked={rememberNew} onCheckedChange={(v) => setRememberNew(v === true)} />
                <span className="text-slate-300 text-sm">Guardar método de pago</span>
              </div>
            </div>
          )}

          <Button onClick={onRent} className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 text-lg py-6 font-bold">
            Pagar {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
