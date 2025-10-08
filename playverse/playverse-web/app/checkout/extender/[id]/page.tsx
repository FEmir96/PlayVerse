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
  (api as any)["queries/getUserByEmail"].getUserByEmail as FunctionReference<"query">;

const HAS_PM_QUERY = Boolean((api as any)["queries/getPaymentMethods"]?.getPaymentMethods);
const getPaymentMethodsRef = (HAS_PM_QUERY
  ? (api as any)["queries/getPaymentMethods"].getPaymentMethods
  : (api as any)["queries/getUserByEmail"].getUserByEmail) as FunctionReference<"query">;

const HAS_GET_BY_ID = Boolean((api as any)["queries/getGameById"]?.getGameById);
const getGameByIdRef = (HAS_GET_BY_ID
  ? (api as any)["queries/getGameById"].getGameById
  : (api as any)["queries/getGames"]?.getGames) as FunctionReference<"query">;

const extendRentalRef = (api as any).transactions.extendRental as FunctionReference<"mutation">;
const savePaymentMethodRef = (api as any)["mutations/savePaymentMethod"].savePaymentMethod as FunctionReference<"mutation">;
const makePaymentRef = (api as any)["mutations/makePayment"].makePayment as FunctionReference<"mutation">;

type PM = {
  _id: string;
  brand: "visa" | "mastercard" | "amex" | "otro";
  last4: string;
  expMonth: number;
  expYear: number;
};

function UpgradeModal({
  open,
  onClose,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-400/30 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-amber-300">Solo para usuarios Premium</h3>
          <p className="text-slate-300 mt-2">
            Este juego es de categoría <span className="text-amber-300 font-semibold">Premium</span>. 
            Para <span className="font-semibold">extender el alquiler</span> necesitás ser Premium.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-200">
              Cancelar
            </Button>
            <Button onClick={onUpgrade} className="bg-orange-400 hover:bg-orange-500 text-slate-900">
              Mejorar a Premium
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === TÍTULO === */
function CheckoutTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center mb-6">
      <h1
        className="
          text-3xl md:text-4xl font-black tracking-tight
          bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300
          bg-clip-text text-transparent
          drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]
        "
      >
        {children}
      </h1>
      <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
    </div>
  );
}

export default function ExtendCheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Identidad
  const { data: session, status } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const loginEmail = session?.user?.email?.toLowerCase() || storeUser?.email?.toLowerCase() || null;

  // Guard de sesión
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
  ) as { _id: Id<"profiles">; role?: "free" | "premium" | "admin" } | null | undefined;

  const userRole = (profile?.role ?? "free") as "free" | "premium" | "admin";

  // Juego
  const game = useQuery(
    getGameByIdRef as any,
    HAS_GET_BY_ID ? ({ id: params.id as Id<"games"> } as any) : (undefined as any)
  ) as
    | {
        _id: Id<"games">;
        title?: string;
        cover_url?: string;
        weekly_price?: number;
        is_premium?: boolean;
        category?: string;
        categories?: string[];
        tier?: string;
        access?: string;
      }
    | null
    | undefined;

  const isGamePremium = useMemo(() => {
    const g: any = game;
    if (!g) return false;
    if (typeof g.is_premium === "boolean") return g.is_premium;
    const fromStr = (v: any) => String(v ?? "").toLowerCase();
    if (Array.isArray(g.categories) && g.categories.some((c: any) => fromStr(c).includes("premium"))) return true;
    const guess = [g.category, g.tier, g.access].map(fromStr).join("|");
    return /premium/.test(guess);
  }, [game]);

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

  const [showUpgrade, setShowUpgrade] = useState(false);

  const weeklyPrice = useMemo(() => {
    if (typeof (game as any)?.weekly_price === "number") return (game as any).weekly_price;
    return 14.99;
  }, [game]);

  const total = useMemo(() => weeklyPrice * weeks, [weeklyPrice, weeks]);

  const normalizeBrand = (b?: string): PM["brand"] => {
    const s = (b || "").toLowerCase();
    if (s.includes("visa")) return "visa";
    if (s.includes("master")) return "mastercard";
    if (s.includes("amex") || s.includes("american")) return "amex";
    return "otro";
  };

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

    // 🚫 Si el juego es Premium y el usuario es FREE → modal
    if (isGamePremium && userRole === "free") {
      setShowUpgrade(true);
      return;
    }

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

      // 1) Registrar pago en payments
      await makePayment({
        userId: profile._id,
        amount: total,
        currency: "USD",
        provider: "manual",
      });

      // 2) Extender alquiler
      await extendRental({
        userId: profile._id,
        gameId: game._id,
        weeks,
        weeklyPrice,
      });

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

  const goUpgrade = () => {
    if (!profile?._id) return;
    const next = pathname ?? "/";
    router.push(`/checkout/premium/${profile._id}?plan=monthly&next=${encodeURIComponent(next)}`);
  };

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
      <CheckoutTitle>Extender alquiler</CheckoutTitle>
      <p className="text-slate-300 text-center mb-8">Seleccione semanas adicionales:</p>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Izquierda */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-sm mb-4">{title}</h2>
          <div className="mx-auto max-w-[380px] md:max-w-[420px]">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/60" style={{ aspectRatio: "3 / 4" }}>
              <img src={cover} alt={title} className="absolute inset-0 w-full h-full object-contain" draggable={false} />
            </div>
          </div>

          {isGamePremium && userRole === "free" && (
            <div className="mt-4 bg-amber-500/10 border border-amber-400/30 text-amber-300 rounded-xl p-3 text-sm">
              Este juego es de categoría Premium. Necesitas Premium para <b>extender</b> el alquiler.
            </div>
          )}
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

          {/* Pago (igual que antes) */}
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

          <Button onClick={onExtend} className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 text-lg py-6 font-bold">
            Pagar {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </Button>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={goUpgrade}
      />
    </div>
  );
}
