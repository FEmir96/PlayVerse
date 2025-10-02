// playverse-web/app/auth/login/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

import { useAuthStore } from "@/lib/useAuthStore";
import type { AuthState } from "@/lib/useAuthStore";
import { setFavoritesScope } from "@/components/favoritesStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const setUser = useAuthStore((s: AuthState) => s.setUser);

  // ✅ Decodificamos y saneamos ?next
  const nextUrl = useMemo(() => {
    const raw = searchParams?.get("next") || "";
    const decoded = raw ? decodeURIComponent(raw) : "/";
    return decoded.startsWith("/") ? decoded : "/";
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

  const buildAfterUrl = (next: string) => {
    const base = "/auth/after";
    const u = new URL(base, typeof window !== "undefined" ? window.location.origin : "http://local");
    if (next) u.searchParams.set("next", next);
    return u.pathname + u.search;
  };

  const buildCallback = (base: string, provider: "google" | "xbox") => {
    // Lo dejamos por compat, aunque ahora usamos /auth/after como callback genérico
    const u = new URL(base, typeof window !== "undefined" ? window.location.origin : "http://local");
    u.searchParams.set("oauth", provider);
    return u.pathname + (u.search ? u.search : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      // ✅ Usamos NextAuth Credentials para crear la sesión real
      const { signIn } = await import("next-auth/react");
      const callbackUrl = buildAfterUrl(nextUrl);

      const res = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: true,            // deja que NextAuth redirija
        callbackUrl,               // → /auth/after?next=...
      });

      // Notará un redirect inmediato; lo de abajo rara vez corre.
      // Persistimos utilidades locales si el navegador aún no salió.
      if (formData.remember) {
        localStorage.setItem("pv_email", formData.email.trim().toLowerCase());
      } else {
        localStorage.removeItem("pv_email");
      }
      setFavoritesScope(formData.email.trim().toLowerCase());
      setUser({ email: formData.email.trim().toLowerCase(), name: "", role: "free" } as any);
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión");
    } finally {
      setPending(false);
    }
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

          <p className="text-slate-400 text-center mb-6">Bienvenido de vuelta, gamer</p>

          {/* FORM email / password */}
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

              <Link href="/auth/register" className="text-sm text-orange-400 hover:text-orange-300">
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

          {/* Botones OAuth */}
          <div className="grid gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() =>
                import("next-auth/react").then(({ signIn }) =>
                  signIn("google", { callbackUrl: buildAfterUrl(nextUrl) })
                )
              }
              className="w-full flex items-center justify-center gap-3 rounded-md border border-orange-400/40 bg-slate-800/60 px-4 py-2.5 text-[15px] font-medium text-slate-200 transition hover:bg-slate-800 hover:border-orange-400/70 active:scale-[0.99] cursor-pointer"
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

            {/* Xbox / Microsoft */}
            <button
              type="button"
              onClick={() =>
                import("next-auth/react").then(({ signIn }) =>
                  signIn("azure-ad", { callbackUrl: buildAfterUrl(nextUrl) })
                )
              }
              className="w-full flex items-center justify-center gap-3 rounded-md
                        border border-[#107C10]/50 bg-slate-800/60 px-4 py-2.5
                        text-[15px] font-medium text-slate-200 transition
                        hover:bg-slate-800 hover:border-[#107C10]/80
                        hover:shadow-[0_0_14px_rgba(16,124,16,0.35)]
                        active:scale-[0.99] cursor-pointer"
              aria-label="Continuar con Xbox"
              title="Continuar con Xbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                   viewBox="0 0 16 16" aria-hidden="true" className="text-[#107C10]">
                <path fill="currentColor" d="M7.202 15.967a8 8 0 0 1-3.552-1.26c-.898-.585-1.101-.826-1.101-1.306 0-.965 1.062-2.656 2.879-4.583C6.459 7.723 7.897 6.44 8.052 6.475c.302.068 2.718 2.423 3.622 3.531 1.43 1.753 2.088 3.189 1.754 3.829-.254.486-1.83 1.437-2.987 1.802-.954.301-2.207.429-3.239.33m-5.866-3.57C.589 11.253.212 10.127.03 8.497c-.06-.539-.038-.846.137-1.95.218-1.377 1.002-2.97 1.945-3.95.401-.417.437-.427.926-.263.595.2 1.23.638 2.213 1.528l.574.519-.313.385C4.056 6.553 2.52 9.086 1.94 10.653c-.315.852-.442 1.707-.306 2.063.091.24.007.15-.3-.319Zm13.101.195c.074-.36-.019-1.02-.238-1.687-.473-1.443-2.055-4.128-3.508-5.953l-.457-.575.494-.454c.646-.593 1.095-.948 1.58-.25.381-.237.927-.448 1.161-.448.145 0 .654.528 1.065 1.104a8.4 8.4 0 0 1 1.343 3.102c.153.728.166 2.286.024 3.012a9.5 9.5 0 0 1-.6 1.893c-.179.393-.624 1.156-.82 1.404-.1.128-.1.127-.043-.148ZM7.335 1.952c-.67-.34-1.704-.705-2.276-.803a4 4 0 0 0-.759-.043c-.471.024-.45 0 .306-.358A7.8 7.8 0 0 1 6.47.128c.8-.169 2.306-.17 3.094-.005.85.18 1.853.552 2.418.9l.168.103-.385-.02c-.766-.038-1.88.27-3.078.853-.361.176-.676.316-.699.312a12 12 0 0 1-.654-.319Z"/>
              </svg>
              Continuar con Xbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
