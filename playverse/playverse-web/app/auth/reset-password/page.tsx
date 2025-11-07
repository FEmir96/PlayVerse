"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ValidationError } from "@/components/ui/validation-error";
import { api } from "@convex";

const validateTokenRef =
  (api as any)["queries/passwordReset"]
    .validateToken as FunctionReference<"query">;

const resetPasswordRef =
  (api as any).auth
    .resetPasswordWithToken as FunctionReference<"mutation">;

type TokenStatus =
  | { state: "loading" }
  | { state: "missing" }
  | {
      state: "invalid";
      message: string;
    }
  | {
      state: "valid";
      email: string | null;
      name?: string | null;
      expiresAt: number;
    };

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "El enlace para restablecer la contraseña no es válido.",
  token_used: "Este enlace ya fue utilizado. Solicitá uno nuevo.",
  token_expired: "El enlace venció. Solicitá otro correo para continuar.",
  user_not_found: "La cuenta asociada ya no existe.",
  missing_token: "El enlace es inválido.",
};

export default function ResetPasswordPage() {
  const search = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => search?.get("token") ?? "", [search]);

  const tokenInfo = useQuery(
    validateTokenRef,
    token ? { token } : "skip"
  ) as
    | { ok: true; email: string | null; name?: string | null; expiresAt: number }
    | { ok: false; error: string; expiresAt?: number }
    | null
    | undefined;

  const resetPassword = useMutation(resetPasswordRef);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  let status: TokenStatus;
  if (!token) {
    status = { state: "missing" };
  } else if (tokenInfo === undefined) {
    status = { state: "loading" };
  } else if (!tokenInfo) {
    status = { state: "invalid", message: "El enlace no es válido." };
  } else if (tokenInfo.ok) {
    status = {
      state: "valid",
      email: tokenInfo.email,
      name: tokenInfo.name,
      expiresAt: tokenInfo.expiresAt,
    };
  } else {
    const message =
      ERROR_MESSAGES[tokenInfo.error] ??
      "No pudimos validar el enlace. Solicitá uno nuevo.";
    status = { state: "invalid", message };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.state !== "valid" || !token) return;

    setError(null);

    if (password.trim().length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);
    try {
      const res = await (resetPassword as any)({
        token,
        newPassword: password,
      });
      if (!res?.ok) {
        const message =
          ERROR_MESSAGES[(res as any)?.error] ??
          "No pudimos restablecer la contraseña. Solicitá un nuevo enlace.";
        setError(message);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3500);
    } catch (err: any) {
      setError(err?.message ?? "Ocurrió un error inesperado. Probá nuevamente.");
    } finally {
      setPending(false);
    }
  };

  const renderContent = () => {
    if (success) {
      return (
        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.778 7.778a1 1 0 01-1.414 0L3.293 9.263a1 1 0 011.414-1.414l3.394 3.394 7.071-7.071a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-emerald-300 mb-3">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-slate-300">
            Ya podés iniciar sesión con tu nueva contraseña. Te estamos redirigiendo...
          </p>
        </div>
      );
    }

    if (status.state === "loading") {
      return (
        <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6 text-center">
          <p className="text-slate-300">Verificando enlace...</p>
        </div>
      );
    }

    if (status.state !== "valid") {
      return (
        <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-3">
            No pudimos continuar
          </h2>
          <p className="text-slate-300 mb-6">
            {status.state === "missing"
              ? "Falta el token de restablecimiento. Usá el enlace recibido por correo."
              : status.message}
          </p>
          <div className="space-y-3">
            <Link href="/auth/forgot-password" className="block">
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold">
                Solicitar un nuevo enlace
              </Button>
            </Link>
            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full border-orange-400 text-orange-300">
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-orange-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-orange-400">
            Restablecer contraseña
          </h2>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          {status.email
            ? `Estás actualizando la contraseña de ${status.email}.`
            : "Ingresá una nueva contraseña segura para tu cuenta."}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nueva contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Repetí la nueva contraseña"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
              required
            />
          </div>

          <ValidationError error={error ?? undefined} />

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Guardando..." : "Guardar nueva contraseña"}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/playverse-logo.png"
              alt="PlayVerse"
              width={120}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-orange-400 mb-2">PLAYVERSE</h1>
          <p className="text-slate-300">Actualiza tu contraseña</p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
