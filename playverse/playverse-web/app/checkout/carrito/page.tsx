// playverse-web/app/checkout/carrito/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@convex";
import type { Id } from "@convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

/* ========================= Convex Refs ========================= */
// Perfil
const getUserByEmailRef =
  (api as any)["queries/getUserByEmail"].getUserByEmail as FunctionReference<"query">;

// Carrito (server-driven)
const cartGetDetailedRef =
  (api as any).queries.cart.getCartDetailed as FunctionReference<"query">;

const cartRemoveRef =
  (api as any).mutations.cart.remove as FunctionReference<"mutation">;

const cartClearRef =
  (api as any).mutations.cart.clear as FunctionReference<"mutation">;

// Pago de carrito
const purchaseCartRef =
  (api as any).transactions.purchaseCart as FunctionReference<"mutation">;

// Métodos de pago guardados (ajustá si tu query se llama distinto)
const getPaymentMethodsRef =
  ((api as any).queries?.getPaymentMethods?.getPaymentMethods ??
    (api as any).queries?.paymentMethods?.getByUser) as
    | FunctionReference<"query">
    | undefined;

// (Opcional) Guardar método nuevo si existe tu mutation
const savePaymentMethodRef =
  ((api as any)["mutations"]?.savePaymentMethod?.savePaymentMethod ??
    (api as any)["mutations"]?.paymentMethods?.create) as
    | FunctionReference<"mutation">
    | undefined;

/* ========================= Page ========================= */

export default function CartCheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Sesión obligatoria para pagar
  const { data: session, status } = useSession();
  const loginEmail = session?.user?.email?.toLowerCase() || null;

  useEffect(() => {
    if (status === "loading") return;
    if (!loginEmail) {
      router.replace(`/auth/login?next=${encodeURIComponent("/checkout/carrito")}`);
    }
  }, [status, loginEmail, router]);

  // Perfil
  const profile = useQuery(
    getUserByEmailRef,
    loginEmail ? { email: loginEmail } : "skip"
  ) as { _id: Id<"profiles">; name?: string } | null | undefined;

  const userId = profile?._id ?? null;

  // Items del carrito desde servidor (con price/title/cover)
  const serverItems = useQuery(
    cartGetDetailedRef as any,
    userId ? { userId } : "skip"
  ) as
    | Array<{
        cartItemId: string;
        gameId: Id<"games">;
        title: string;
        cover_url?: string | null;
        price_buy: number;
        currency: "USD";
      }>
    | undefined;

  const items = serverItems ?? [];
  const hasItems = items.length > 0;

  // Métodos de pago guardados del usuario (si la query existe)
  const paymentMethods =
    (getPaymentMethodsRef
      ? (useQuery(getPaymentMethodsRef as any, userId ? { userId } : "skip") as
          | Array<{
              _id: Id<"paymentMethods">;
              brand: "visa" | "mastercard" | "amex" | "otro";
              last4: string;
              expMonth: number;
              expYear: number;
            }>
          | undefined)
      : undefined) || [];

  // === UI Estado: usar guardadas vs tarjeta nueva ===
  const [useSaved, setUseSaved] = useState<boolean>(true);
  useEffect(() => {
    // Si no hay guardadas, pasamos automáticamente a tarjeta nueva
    setUseSaved((paymentMethods?.length ?? 0) > 0);
  }, [paymentMethods]);

  // método seleccionado (default primero)
  const [methodId, setMethodId] = useState<string | null>(null);
  useEffect(() => {
    if (useSaved && !methodId && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      setMethodId(String(paymentMethods[0]._id));
    }
    if (!useSaved) setMethodId(null);
  }, [paymentMethods, methodId, useSaved]);

  // Form tarjeta nueva
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [rememberNew, setRememberNew] = useState(false);

  // Totales
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.price_buy) || 0), 0),
    [items]
  );

  // Mutations
  const cartRemove = useMutation(cartRemoveRef);
  const cartClear = useMutation(cartClearRef);
  const purchaseCart = useMutation(purchaseCartRef);
  // Para guardar método nuevo solo si hay ref disponible (si no, no se usa)
  const savePaymentMethod = savePaymentMethodRef
    ? useMutation(savePaymentMethodRef)
    : null;

  const [processing, setProcessing] = useState(false);

  const onPay = async () => {
    if (processing) return;
    if (!userId || items.length === 0) return;

    // Validación: si usás guardadas, tenés que elegir una
    if (useSaved && Array.isArray(paymentMethods) && paymentMethods.length > 0 && !methodId) {
      toast({
        title: "Selecciona un método de pago",
        description: "Debes elegir una tarjeta para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Validación simple para tarjeta nueva
    if (!useSaved) {
      const numDigits = number.replace(/\D/g, "");
      const expDigits = exp.replace(/\D/g, "");
      const cvcDigits = cvc.replace(/\D/g, "");

      if (!holder || numDigits.length < 12 || expDigits.length < 4 || cvcDigits.length < 3) {
        toast({
          title: "Datos incompletos",
          description: "Revisa el titular, número, fecha y CVC.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setProcessing(true);

      // Guardar método nuevo si corresponde y si tu backend lo soporta
      if (!useSaved && rememberNew && savePaymentMethod) {
        try {
          await savePaymentMethod({
            userId,
            fullNumber: number.replace(/\s/g, ""),
            exp,
            cvv: cvc,
            brand: undefined,
          } as any);
        } catch {
          // Si falla guardar, no detenemos la compra
        }
      }

      await purchaseCart({
        userId,
        gameIds: items.map((m) => m.gameId),
        currency: "USD",
        // Si usás guardada: enviamos ID; si tarjeta nueva: lo omitimos
        paymentMethodId: useSaved ? (methodId ?? undefined) : undefined,
      } as any);

      toast({ title: "Compra confirmada", description: "Te enviamos el comprobante por email." });

      // Redirección robusta al Home
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
      setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }, 800);
    } catch (e: any) {
      toast({
        title: "No se pudo completar el pago",
        description: e?.message ?? "Intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Helpers UI
  const brandLabel = (b: string) =>
    b === "visa" ? "Visa" : b === "mastercard" ? "Mastercard" : b === "amex" ? "Amex" : "Tarjeta";

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          Tu carrito
        </h1>
        <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
      </div>

      {!hasItems ? (
        <div className="mx-auto max-w-xl text-center text-slate-300">
          <p>Tu carrito está vacío.</p>
          <Link href="/catalogo" className="inline-block mt-4">
            <Button className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-bold">
              Ir al catálogo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <div
                key={String(it.gameId)}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-3"
              >
                <div className="relative w-20 h-24 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/40">
                  <Image
                    src={it.cover_url || "/placeholder.svg"}
                    alt={it.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-amber-400 font-semibold">{it.title}</div>
                  <div className="text-amber-300 font-bold">
                    {(Number(it.price_buy) || 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                </div>

                {/* Botón QUITAR — estilo ámbar */}
                <Button
                  type="button"
                  onClick={async () => {
                    if (!userId) return;
                    await cartRemove({ userId, gameId: it.gameId });
                  }}
                  className="!bg-transparent border border-amber-400/40 text-amber-300 hover:!bg-amber-400/20 hover:text-amber-100 hover:border-amber-400 rounded-lg px-4 py-2 transition-colors"
                >
                  Quitar
                </Button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              {/* Botón VACIAR — estilo ámbar */}
              <Button
                type="button"
                onClick={async () => {
                  if (!userId) return;
                  await cartClear({ userId });
                }}
                className="!bg-transparent border border-amber-400/40 text-amber-300 hover:!bg-amber-400/20 hover:text-amber-100 hover:border-amber-400 rounded-lg px-4 py-2 transition-colors"
              >
                Vaciar carrito
              </Button>

              <Link
                href="/catalogo"
                className="text-amber-300 hover:text-white hover:underline underline-offset-4"
              >
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-amber-400 mb-3">Resumen</h3>

              {/* Toggle: usar guardadas */}
              <label className="flex items-center gap-2 mb-2">
                <Checkbox checked={useSaved} onCheckedChange={(v) => setUseSaved(v === true)} />
                <span className="text-slate-300 text-sm">Usar tarjeta guardada</span>
              </label>

              {/* Métodos de pago o formulario */}
              <div className="mb-4">
                {useSaved ? (
                  Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
                    <div className="space-y-2">
                      {paymentMethods.map((pm) => {
                        const label = `${brandLabel(pm.brand)} •••• ${pm.last4} — ${String(
                          pm.expMonth
                        ).padStart(2, "0")}/${pm.expYear}`;
                        return (
                          <label
                            key={String(pm._id)}
                            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
                              methodId === String(pm._id)
                                ? "border-amber-300 bg-amber-300/10"
                                : "border-slate-700 hover:border-amber-300/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name="pm"
                              checked={methodId === String(pm._id)}
                              onChange={() => setMethodId(String(pm._id))}
                            />
                            <span className="text-slate-200">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      No tenés tarjetas guardadas. Activá el formulario destildando arriba.
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-300 text-sm">Nombre del titular</label>
                      <Input
                        value={holder}
                        onChange={(e) => setHolder(e.target.value)}
                        placeholder="Nombre en la tarjeta"
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm">Número de tarjeta</label>
                      <Input
                        value={number}
                        onChange={(e) => {
                          const d = e.target.value.replace(/\D/g, "").slice(0, 19);
                          const pretty = d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                          setNumber(pretty);
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
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123"
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 pt-1">
                      <Checkbox
                        checked={rememberNew}
                        onCheckedChange={(v) => setRememberNew(v === true)}
                      />
                      <span className="text-slate-300 text-sm">Guardar método de pago</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-1 text-amber-300">
                <span>Productos</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-amber-400 font-semibold">
                <span>Total</span>
                <span>
                  {subtotal.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </span>
              </div>

              <Button
                onClick={onPay}
                disabled={processing || items.length === 0 || !userId}
                className={`w-full mt-4 text-slate-900 text-lg py-6 font-bold ${
                  processing
                    ? "bg-slate-600 cursor-not-allowed"
                    : "bg-orange-400 hover:bg-orange-500"
                }`}
              >
                {processing ? "Procesando…" : "Pagar ahora"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
