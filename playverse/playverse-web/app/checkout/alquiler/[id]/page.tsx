// playverse-web/app/checkout/alquiler/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
// ⚠️ No usamos el store como fallback de email en checkouts para evitar “arrastre” entre sesiones
// import { useAuthStore } from "@/lib/useAuthStore";

// —— Refs
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

// Rentals del usuario (ya la tenés)
const HAS_USER_RENTALS = Boolean((api as any)["queries/getUserRentals"]?.getUserRentals);
const getUserRentalsRef = HAS_USER_RENTALS
  ? ((api as any)["queries/getUserRentals"].getUserRentals as FunctionReference<"query">)
  : undefined;

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

function computeIsPremium(g: any): { premium: boolean; reason: string } {
  if (!g) return { premium: false, reason: "game=null" };
  const boolCandidates = [
    { key: "is_premium", val: g?.is_premium },
    { key: "isPremium", val: g?.isPremium },
    { key: "premium", val: g?.premium },
    { key: "requiresPremium", val: g?.requiresPremium },
    { key: "only_premium", val: g?.only_premium },
  ];
  const hitBool = boolCandidates.find((c) => c.val === true);
  if (hitBool) return { premium: true, reason: `bool:${hitBool.key}=true` };

  const norm = (v: any) => String(v ?? "").toLowerCase();
  const strFields = ["category", "tier", "access", "plan", "level", "type", "status"];
  for (const f of strFields) if (norm(g?.[f]).includes("premium")) return { premium: true, reason: `str:${f}~premium` };
  const arrFields = ["categories", "tags", "labels", "flags"];
  for (const f of arrFields) {
    const arr = g?.[f];
    if (Array.isArray(arr) && arr.some((x: any) => norm(x).includes("premium"))) return { premium: true, reason: `arr:${f} has premium` };
  }
  try {
    const flatText = Object.values(g).filter((v: any) => typeof v === "string").map((v: string) => v.toLowerCase()).join("|");
    if (flatText.includes("premium")) return { premium: true, reason: "flat:string contains premium" };
  } catch {}
  return { premium: false, reason: "no-premium-field-detected" };
}

export default function RentCheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const forcePremium = sp?.get("forcePremium") === "1";
  const { toast } = useToast();

  const { data: session, status } = useSession();

  // ✅ Solo confiamos en session (usuario actual). Si no está autenticado → null
  const loginEmail = useMemo(
    () => (status === "authenticated" ? session?.user?.email?.toLowerCase() ?? null : null),
    [status, session?.user?.email]
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!loginEmail) {
      // ✅ Siempre al Home después del login
      router.replace(`/auth/login?next=%2F`);
    }
  }, [status, loginEmail, router]);

  // Perfil
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as | { _id: Id<"profiles">; role?: "free" | "premium" | "admin" } | null | undefined;

  // Juego
  const game = useQuery(
    getGameByIdRef as any,
    HAS_GET_BY_ID ? ({ id: params.id as Id<"games"> } as any) : (undefined as any)
  ) as any | null | undefined;

  // Premium detection
  const { isGamePremium } = useMemo(() => {
    if (forcePremium) return { isGamePremium: true };
    const { premium } = computeIsPremium(game as any);
    return { isGamePremium: premium };
  }, [game, forcePremium]);

  const userRole = (profile?.role ?? "free") as "free" | "premium" | "admin";
  const payDisabled = isGamePremium && userRole === "free";

  // Rentals del usuario (para evitar doble alquiler)
  const rentalsByUser = HAS_USER_RENTALS
    ? ((useQuery(
        getUserRentalsRef!,
        profile?._id ? { userId: profile._id } : "skip"
      ) as any[]) || undefined)
    : undefined;

  const hasActiveRental = useMemo(() => {
    if (!Array.isArray(rentalsByUser)) return false;
    const now = Date.now();
    return rentalsByUser.some((r: any) => {
      if (String(r.gameId) !== String(params.id)) return false;
      const end = r.expiresAt ?? r.endAt ?? r.endsAt ?? r.expires_at;
      return typeof end === "number" && end > now;
    });
  }, [rentalsByUser, params.id]);

  // Redirección si ya está alquilado → extender
  const redirectedToExtend = useRef(false);
  useEffect(() => {
    if (!profile?._id) return;
    if (typeof game === "undefined") return;
    if (redirectedToExtend.current) return;
    if (hasActiveRental) {
      redirectedToExtend.current = true;
      router.replace(`/checkout/extender/${params.id}?next=%2F`);
    }
  }, [hasActiveRental, profile?._id, game, router, params.id]);

  // Métodos guardados
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

  const [processing, setProcessing] = useState(false);

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

  const onRent = async () => {
    if (processing) return;
    if (!profile?._id || !game?._id) return;

    if (hasActiveRental) {
      router.replace(`/checkout/extender/${params.id}?next=%2F`);
      return;
    }
    if (payDisabled) {
      return;
    }

    try {
      setProcessing(true);

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
        weeklyPrice,
        currency: "USD",
      });

      toast({ title: "Alquiler confirmado", description: "¡Te enviamos el comprobante por email!" });

      // ✅ Redirección SIEMPRE al Home
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
      setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }, 600);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("ALREADY_RENTED_ACTIVE")) {
        router.replace(`/checkout/extender/${params.id}?next=%2F`);
        return;
      }
      toast({
        title: "No se pudo iniciar el alquiler",
        description: e?.message ?? "Intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
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
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Izquierda */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-sm mb-4">{title}</h2>
          <div className="mx-auto max-w-[380px] md:max-w-[420px]">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/60" style={{ aspectRatio: "3 / 4" }}>
              <img src={cover} alt={title} className="absolute inset-0 w-full h-full object-contain" draggable={false} />
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-2">
              Semanas de alquiler: <span className="text-white font-semibold">{weeks}</span>
            </p>
            <Slider value={[weeks]} min={1} max={12} step={1} onValueChange={(v) => setWeeks(v[0] ?? 1)} />
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-amber-400">
                Total: {(weeklyPrice * weeks).toLocaleString("en-US", { style: "currency", currency: "USD" })}
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
                    <p className="text-slate-400 text-xs">Expira {String(primaryPM.expMonth).padStart(2, "0")}/{String(primaryPM.expYear).slice(-2)}</p>
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

          <Button
            onClick={onRent}
            disabled={payDisabled || processing}
            className={`w-full text-slate-900 text-lg py-6 font-bold ${payDisabled || processing ? "bg-slate-600 cursor-not-allowed" : "bg-orange-400 hover:bg-orange-500"}`}
          >
            {processing ? "Procesando…" : `Pagar ${(weeklyPrice * weeks).toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
