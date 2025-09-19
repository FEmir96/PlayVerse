// playverse-web/app/auth/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// ✅ usa el hook correcto de shadcn
import { useToast } from "@/hooks/use-toast";

// store de sesión
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

  // Toast si viene de registro exitoso (?registered=1)
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
      // (opcional) toast de error
      // toast({ title: "Error", description: res?.error ?? "No se pudo iniciar sesión" });
      return;
    }

    setUser(res.profile);
    console.log("[LOGIN OK] Perfil recibido:", res.profile);

    // ✅ toast arriba-centro (sale del Toaster global en layout)
    toast({
      title: `¡Bienvenido, ${res.profile.name}!`,
      description: "Inicio de sesión exitoso.",
    });

    if (formData.remember) {
      localStorage.setItem("pv_email", formData.email.trim().toLowerCase());
    } else {
      localStorage.removeItem("pv_email");
    }

    // pequeño delay para ver el toast antes de navegar
    setTimeout(() => router.push("/"), 80);
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

        {/* Form */}
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

          <p className="text-slate-400 text-center mb-6">Bienvenido de vuelta, gamer</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                <label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
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
        </div>
      </div>
    </div>
  );
}
