// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { api } from "@convex"; // alias a ../convex/_generated/api (vía tsconfig)

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// 🔒 usamos el módulo correcto: auth.oauthUpsert (existe en convex/auth.ts)
const oauthUpsertRef =
  ((api as any).auth?.oauthUpsert ??
    (api as any)["auth/oauthUpsert"]) as FunctionReference<"mutation">;

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          await convex.mutation(oauthUpsertRef, {
            email: user.email,
            name: user.name ?? "",
            avatarUrl: user.image ?? undefined,
            provider: "google",
            providerId: account.providerAccountId,
          });
        } catch (err) {
          console.error("[oauthUpsert] error:", err);
          return "/auth/login?error=convex";
        }
      }
      return true;
    },
    // ✅ No forzamos ?login=ok; respetamos lo que venga en callbackUrl
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      return baseUrl; // fallback: home sin query
    },
  },
});

export { handler as GET, handler as POST };
