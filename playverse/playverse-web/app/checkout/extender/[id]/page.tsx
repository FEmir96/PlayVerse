// app/checkout/extend/[id]/page.tsx
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

// —— Refs robustas
const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"]
    .getUserByEmail as FunctionReference<"query">;

const HAS_PM_QUERY = Boolean(
  (api as any)["queries/getPaymentMethods"]?.getPaymentMethods
);
const getPaymentMethodsRef = (HAS_PM_QUERY
  ? (api as any)["queries/getPaymentMethods"].getPaymentMethods
  : (api as any)["queries/getUserByEmail"].getUserByEmail) as FunctionReference<"query">;

const HAS_GET_BY_ID = Boolean((api as any)["queries/getGameById"]?.getGameById);
const getGameByIdRef = (HAS_GET_BY_ID
  ? (api as any)["queries/getGameById"].getGameById
  : (api as any)["queries/getGames"]?.getGames) as FunctionReference<"query">;

const extendRentalRef =
  (api as any).transactions.extendRental as FunctionReference<"mutation">;

const savePaymentMethodRef =
  (api as any)["mutations/savePaymentMethod"]
    .savePaymentMethod as FunctionReference<"mutation">;

const makePaymentRef =
  (api as any)["mutations/makePayment"]
    .makePayment as FunctionReference<"mutation">;

type PM = {
  _id: string;
  brand: "visa" | "mastercard" | "amex" | "otro";
  last4: string;
  expMonth: number;
  expYear: number;
};

export default function ExtendCheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Identidad
  const { data: session, status } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail =
    session?.user?.email?.toLowerCase() ||
    storeUser?.email?.toLowerCase() ||
    null;

  // Guard de sesión: no patear al login mientras carga
  useEffect(() => {
    if (status === "loading") return;
    if (!loginEmail) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname ?? "/")}`);
    }
  }, [loginEmail, router, pathname, status]);

  // Perfil
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as any;

  // Juego
  const game = useQuery(
    getGameByIdRef as any,
    HAS_GET_BY_ID
      ? ({ id: params.id as Id<"games"> } as any)
      : (undefined as any)
  ) as { _id: Id<"games">; title?: string; cover_url?: string; weekly_price?: number } | null | undefined;

  // Métodos guardados
  const methods = useQuery(
    getPaymentMethodsRef as any,
    HAS_PM_QUERY && profile?._id ? { userId: profile._id } : undefined
  ) as PM[] | undefined;

  const savePaymentMethod = useMutation(savePaymentMethodRef);
  const extendRental = useMutation(extendRentalRef);
  const makePayment = useMutation(makePaymentRef);

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
    return 14.99;
  }, [game]);

  const total = useMemo(() => weeklyPrice * weeks, [weeklyPrice, weeks]);

  // helper normalizar marca
  const normalizeBrand = (b?: string): PM["brand"] => {
    const s = (b || "").toLowerCase();
    if (s.includes("visa")) return "visa";
    if (s.includes("master")) return "mastercard";
    if (s.includes("amex") || s.includes("american")) return "amex";
    return "otro";
  };

  // fallback: método del perfil si no hay tabla de PM
  const pmFromProfile: PM | null = useMemo(() => {
    const p: any = profile;
    if (!p) return null;

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

  const primaryPM = (methods && methods.length > 0 ? methods[0] : null) ?? pmFromProfile;

  const onExtend = async () => {
    if (!profile?._id || !game?._id) return;

    try {
      // Guardar nuevo método si corresponde
      if (!useSaved && rememberNew) {
        await savePaymentMethod({
          userId: profile._id,
          fullNumber: number,
          exp,
          cvv: cvc,
          brand: undefined,
        });
      }

      // 1) Registrar pago (tabla payments) – SIN amountCents ni extra fields
      await makePayment({
        userId: profile._id,
        amount: total,
        currency: "USD",
        provider: "manual",
      });

      // 2) Extender alquiler (esto actualiza expiresAt y registra transacción "rental")
      await extendRental({
        userId: profile._id,
        gameId: game._id,
        weeks,
        weeklyPrice,
        currency: "USD",
      });

      // OK
      toast({
        title: "Alquiler extendido",
        description: "Actualizamos la fecha de vencimiento correctamente.",
      });
      router.replace("/mis-juegos");
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      toast({
        title: "No se pudo extender el alquiler",
        description: msg || "Intentá nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Mientras no haya email (o está cargando) mostramos pantalla simple
  if (!loginEmail || status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-slate-300">Redirigiendo o cargando sesión…</p>
      </div>
    );
  }

  const title = game?.title ?? "Juego";
  const cover = game?.cover_url ?? "/placeholder.svg";

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 text-center mb-2">Extender alquiler</h1>
      <p className="text-slate-300 text-center mb-8">Seleccione semanas adicionales:</p>

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
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-2">
              Semanas adicionales: <span className="text-white font-semibold">{weeks}</span>
            </p>
            <Slider value={[weeks]} min={1} max={12} step={1} onValueChange={(v) => setWeeks(v[0] ?? 1)} />
          </div>

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
                    <p className="text-slate-200 text-sm">
                      {primaryPM.brand.toUpperCase()} •••• {primaryPM.last4}
                    </p>
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
                      <Input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="123"
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                      />
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
                  <Input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="123"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox checked={rememberNew} onCheckedChange={(v) => setRememberNew(v === true)} />
                <span className="text-slate-300 text-sm">Guardar método de pago</span>
              </div>
            </div>
          )}

          <Button
            onClick={onExtend}
            className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 text-lg py-6 font-bold"
          >
            Pagar {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
