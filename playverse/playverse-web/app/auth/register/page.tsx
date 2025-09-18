"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const createUser = useMutation(api.auth.createUser);

  const emailOk = formData.email.trim().length > 5 && formData.email.includes("@");
  const passOk = formData.password.length >= 6;
  const matchOk = formData.password === formData.confirmPassword;
  const termsOk = formData.acceptTerms === true;
  const usernameOk = formData.username.trim().length >= 2;

  const canSubmit = emailOk && passOk && matchOk && termsOk && usernameOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      if (!termsOk) alert("Debes aceptar los términos y condiciones");
      else if (!matchOk) alert("Las contraseñas no coinciden");
      else if (!passOk) alert("La contraseña debe tener al menos 6 caracteres");
      else alert("Revisa los datos del formulario");
      return;
    }

    setPending(true);
    const res = await createUser({
      name: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: "free",
    });
    setPending(false);

    if (!res?.ok) {
      setError(res?.error ?? "No se pudo crear la cuenta");
      return;
    }

    // 👉 redirige con bandera de "registrado"
    router.push("/auth/login?registered=1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 mt-7">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/playverse-logo.png"
              alt="PlayVerse"
              width={120}
              height={80}
              className="object-contain h-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-orange-400 mb-2">PLAYVERSE</h1>
          <p className="text-slate-300">Únete y elige tu próxima aventura</p>
        </div>

        <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-orange-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-orange-400">Crear cuenta</h2>
          </div>

          <p className="text-slate-400 text-center mb-6">Únete a la comunidad gamer</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de usuario</label>
              <Input
                type="text"
                placeholder="Tu nombre de gamer"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
              {!emailOk && formData.email.length > 0 && (
                <p className="text-xs text-red-400 mt-1">Email inválido</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar contraseña</label>
              <Input
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
              {!matchOk && formData.confirmPassword.length > 0 && (
                <p className="text-xs text-red-400 mt-1">No coinciden</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptTerms: checked === true })
                }
                className="border-slate-600 data-[state=checked]:bg-orange-400 data-[state=checked]:border-orange-400 mt-1"
              />
              <label htmlFor="terms" className="text-sm text-slate-300">
                Acepto los{" "}
                <Link href="/terms" className="text-orange-400 hover:text-orange-300">
                  Términos y condiciones
                </Link>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={!canSubmit || pending}
              className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Creando..." : "Registrarse"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-400">¿Ya tienes una cuenta? </span>
            <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
