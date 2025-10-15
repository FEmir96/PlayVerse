// playverse-web/app/checkout/compra/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Detectar premium
function isPremiumFromGame(g: any): boolean {
  if (!g) return false;
  if (typeof g.is_premium === "boolean") return g.is_premium;
  const s = (v: any) => String(v ?? "").toLowerCase();
  if (Array.isArray(g.categories) && g.categories.some((c: any) => s(c).includes("premium"))) return true;
  const guess = [g.category, g.tier, g.access].map(s).join("|");
  return /premium/.test(guess);
}

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

type PM = {
  _id: string;
  brand: "visa" | "mastercard" | "amex" | "otro";
  last4: string;
  expMonth: number;
  expYear: number;
};

export default function PurchaseCheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();

  const { data: session, status } = useSession();

  const loginEmail = useMemo(
    () => (status === "authenticated" ? session?.user?.email?.toLowerCase() ?? null : null),
    [status, session?.user?.email]
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!loginEmail) {
      router.replace(`/auth/login?next=%2F`);
    }
  }, [status, loginEmail, router]);

  // Perfil + rol
  const profile = useQuery(api.queries.getUserByEmail.getUserByEmail as any, loginEmail ? { email: loginEmail } : "skip") as
    | { _id: Id<"profiles">; role?: "free" | "premium" | "admin" }
    | null
    | undefined;
  const userRole = (profile?.role ?? "free") as "free" | "premium" | "admin";

  // Juego
  const game = useQuery(
    api.queries.getGameById?.getGameById as any,
    api.queries.getGameById?.getGameById ? ({ id: params.id as Id<"games"> } as any) : "skip"
  ) as
    | {
        _id: Id<"games">;
        title?: string;
        cover_url?: string;
        price_buy?: number;
        is_premium?: boolean;
        category?: string;
        categories?: string[];
        tier?: string;
        access?: string;
      }
    | null
    | undefined;

  const isGamePremium = useMemo(() => isPremiumFromGame(game), [game]);

  // Métodos guardados (si hay query)
  const pmSupported = Boolean(api.queries.getPaymentMethods?.getPaymentMethods);
  const methods = useQuery(
    (api.queries.getPaymentMethods?.getPaymentMethods as any) || (null as any),
    pmSupported && profile?._id ? { userId: profile._id } : "skip"
  ) as PM[] | undefined;

  // Biblioteca
  const library = useQuery(
    api.queries.getUserLibrary?.getUserLibrary as any,
    profile?._id && api.queries.getUserLibrary?.getUserLibrary ? { userId: profile._id } : "skip"
  ) as any[] | undefined;

  const savePaymentMethod = useMutation(api.mutations.savePaymentMethod?.savePaymentMethod as any);
  const purchaseGame = useMutation(api.transactions.purchaseGame as any);

  // UI
  const [useSaved, setUseSaved] = useState(true);
  const [rememberNew, setRememberNew] = useState(false);

  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const price = useMemo(() => {
    const base = typeof (game as any)?.price_buy === "number" ? (game as any).price_buy : 49.99;
    return base;
  }, [game]);

  const formatMoney = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

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

  /** ¿Ya es dueño del juego? */
  const alreadyOwned = useMemo(() => {
    if (!library || !game?._id) return false;
    const gid = String(game._id);
    return library.some((row: any) => {
      const g = row?.game ?? row;
      const id = String(g?._id ?? row?.gameId ?? "");
      const kind = String(row?.kind ?? row?.type ?? "purchase").toLowerCase();
      return id === gid && (kind === "purchase" || kind === "buy" || row?.owned === true);
    });
  }, [library, game?._id]);

  const ownedToastShownRef = useRef(false);
  const suppressOwnedToastRef = useRef(false);

  useEffect(() => {
    if (alreadyOwned && game?.title && !ownedToastShownRef.current && !suppressOwnedToastRef.current) {
      ownedToastShownRef.current = true;
      toast({
        title: "Ya tienes este juego",
        description: `“${game.title}” ya está en tu catálogo.`,
      });
    }
  }, [alreadyOwned, game?.title, toast]);

  const onPay = async () => {
    if (!profile?._id || !game?._id) return;

    if (alreadyOwned) {
      toast({
        title: "Compra no necesaria",
        description: "Ya tienes este producto en tu catálogo.",
      });
      return;
    }

    try {
      suppressOwnedToastRef.current = true;

      if (!useSaved && rememberNew && api.mutations.savePaymentMethod?.savePaymentMethod) {
        await savePaymentMethod({
          userId: profile._id,
          fullNumber: number,
          exp,
          cvv: cvc,
          brand: undefined,
        } as any);
      }

      await purchaseGame({ userId: profile._id, gameId: game._id, amount: price } as any);

      toast({ title: "Compra confirmada", description: "Te enviamos un email con los detalles." });

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
      suppressOwnedToastRef.current = false;

      const msg = String(e?.message || "");
      if (msg.includes("ALREADY_OWNED")) {
        toast({ title: "Ya tienes este juego", description: "No es necesario volver a comprarlo." });
        return;
      }
      toast({
        title: "No se pudo completar el pago",
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
      <CheckoutTitle>Confirmar compra</CheckoutTitle>
      <p className="text-slate-300 text-center mb-8">Estás comprando:</p>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Izquierda */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-sm mb-4">{title}</h2>

          <div className="mx-auto max-w-[380px] md:max-w-[420px]">
            <div
              className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/60"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={cover}
                alt={title}
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
            </div>
          </div>

          {isGamePremium && userRole === "free" && (
            <div className="mt-4 bg-amber-500/10 border border-amber-400/30 text-amber-300 rounded-xl p-3 text-sm">
              Este título es <b>Premium</b>. Como usuario <b>Free</b> podés <u>comprarlo</u> a <b>tarifa plana</b> (sin descuentos).
            </div>
          )}

          {alreadyOwned && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-xl p-3 text-sm">
              Ya tienes este juego en tu biblioteca. No es necesario volver a comprarlo.
            </div>
          )}
        </div>

        {/* Derecha */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-3xl font-black text-emerald-300">{formatMoney(price)}</div>
            {userRole !== "premium" && (
              <p className="text-sm text-amber-400 mt-2">
                ¿Querés descuentos? Suscríbete a Premium y aprovecha beneficios en próximas compras.
              </p>
            )}
          </div>

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

          <Button
            onClick={onPay}
            disabled={alreadyOwned}
            className={`w-full text-slate-900 text-lg py-6 font-bold ${
              alreadyOwned ? "bg-slate-600 cursor-not-allowed" : "bg-orange-400 hover:bg-orange-500"
            }`}
          >
            {alreadyOwned ? "Ya tienes este juego" : `Pagar ${formatMoney(price)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
