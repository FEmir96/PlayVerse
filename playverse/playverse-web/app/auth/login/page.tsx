"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

// (tu store local)
import { useAuthStore } from "@/lib/useAuthStore";
import type { AuthState } from "@/lib/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const setUser = useAuthStore((s: AuthState) => s.setUser);
  const authLogin = useMutation(api.auth.authLogin);

  // ✅ Decodificamos y saneamos ?next
  const nextUrl = useMemo(() => {
    const raw = searchParams?.get("next") || "";
    const decoded = raw ? decodeURIComponent(raw) : "/";
    // solo permitimos rutas relativas internas
    if (!decoded.startsWith("/")) return "/";
    return decoded;
  }, [searchParams]);

  // Si venís de registro exitoso: ?registered=1
  useEffect(() => {
    const registered = searchParams?.get("registered");
    if (registered === "1") {
      toast({
        title: "Cuenta creada con éxito 🎉",
        description: "Ya podés iniciar sesión con tu email y contraseña.",
      });
      router.replace("/auth/login");
    }
  }, [searchParams, router, toast]);

  // Autocompletar email recordado
  useEffect(() => {
    const saved = localStorage.getItem("pv_email");
    if (saved) setFormData((s) => ({ ...s, email: saved, remember: true }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);

    const res = await authLogin({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setPending(false);

    if (!res?.ok) {
      setError(res?.error ?? "No se pudo iniciar sesión");
      return;
    }

    setUser(res.profile);
    toast({
      title: `¡Bienvenido, ${res.profile.name}!`,
      description: "Inicio de sesión exitoso.",
    });

    if (formData.remember) {
      localStorage.setItem("pv_email", formData.email.trim().toLowerCase());
    } else {
      localStorage.removeItem("pv_email");
    }

    // ✅ volvemos al juego (o a / si no hay next)
    setTimeout(() => router.push(nextUrl), 120);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
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

        {/* Card */}
        <div className="bg-slate-800/50 border border-orange-400/30 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-orange-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-orange-400">Iniciar sesión</h2>
          </div>

          <p className="text-slate-400 text-center mb-6">
            Bienvenido de vuelta, gamer
          </p>

          {/* FORM email / password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="tu@email.com"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Tu contraseña"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, remember: checked === true })
                  }
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  Recuérdame
                </label>
              </div>

              <Link
                href="/auth/register"
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                ¿No tenés cuenta?
              </Link>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3"
            >
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="h-px bg-slate-700 flex-1" />
            <span className="text-slate-400 px-3 text-sm">o continuar con</span>
            <div className="h-px bg-slate-700 flex-1" />
          </div>

          {/* Botón Google */}
          <div className="grid">
            <button
              type="button"
              onClick={() =>
                import("next-auth/react").then(({ signIn }) =>
                  // ✅ usar la misma next decodificada como callbackUrl
                  signIn("google", { callbackUrl: nextUrl })
                )
              }
              className="w-full flex items-center justify-center gap-3 rounded-md border border-orange-400/40 bg-slate-800/60 px-4 py-2.5 text-[15px] font-medium text-slate-200 transition
                         hover:bg-slate-800 hover:border-orange-400/70 active:scale-[0.99] cursor-pointer"
              aria-label="Continuar con Google"
              title="Continuar con Google"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.9 31 29.4 34 24 34c-6.6 0-12-5.4-12-12S17.4 10 24 10c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 3.7 29.2 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.1-.1-2.2-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7L13 19c2-4 6.1-7 11-7 3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 3.7 29.2 2 24 2 15 2 7.4 7.3 4.1 14.7z"/>
                <path fill="#4CAF50" d="M24 46c5.2 0 9.9-1.7 13.6-4.6l-6.3-5.2C29.2 38 26.7 39 24 39c-5.4 0-9.9-3-12.3-7.4l-6.5 5C7.4 40.7 15 46 24 46z"/>
                <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-1.6 3.8-5.6 6.5-10.3 6.5-5.4 0-9.9-3-12.3-7.4l-6.5 5C7.4 40.7 15 46 24 46c11 0 21-8 21-22 0-1.1-.1-2.2-.4-3.5z"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
