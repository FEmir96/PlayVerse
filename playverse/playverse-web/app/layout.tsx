// playverse-web/app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { Suspense } from "react";
import OAuthToast from "@/components/OAuthToast";

// Convex
import ConvexProviderClient from "./providers/convex-provider";
// NextAuth
import SessionProviderClient from "./providers/auth-provider";
// HouseAds
import HouseAdProvider from "./providers/HouseAdProvider";

// shadcn/ui
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "PlayVerse - Tu portal al universo de los juegos",
  description: "Alquila o compra videojuegos. ¡La diversión te espera!",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-slate-900 text-white`}
      >
        <ConvexProviderClient>
          <SessionProviderClient>
            <HouseAdProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <Header />
                <OAuthToast />
                <main className="min-h-screen">{children}</main>
                <ConditionalFooter />
              </Suspense>
              <Analytics />
              <Toaster />
            </HouseAdProvider>
          </SessionProviderClient>
        </ConvexProviderClient>
      </body>
    </html>
  );
}
