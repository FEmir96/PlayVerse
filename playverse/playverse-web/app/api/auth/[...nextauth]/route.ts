// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import AzureAd from "next-auth/providers/azure-ad";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

export const authOptions: AuthOptions = {
  // Asegúrate de tener esto en .env.local
  // NEXTAUTH_URL=http://localhost:3000
  // NEXTAUTH_SECRET=algo_largo_y_unico
  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    AzureAd({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      authorization: {
        params: { scope: "openid profile email offline_access" },
      },
      checks: ["pkce", "state"],
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // Upsert del perfil en Convex para Google/Microsoft
    async signIn({ user, account }) {
      try {
        if (!user?.email) return false;

        await convex.mutation(api.auth.oauthUpsert, {
          email: user.email,
          name: user.name ?? "",
          avatarUrl: (user as any).image ?? undefined,
          provider: account?.provider ?? "unknown",
          providerId: account?.providerAccountId ?? undefined,
        });

        return true;
      } catch (err) {
        console.error("oauthUpsert failed:", err);
        return true; // no bloqueamos el login por esto
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name ?? token.name;
        (token as any).picture = (user as any).image ?? (token as any).picture;
      }
      (token as any).role = (token as any).role ?? "free";
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).image = (token as any).picture;
      }
      return session;
    },
  },

  // (opcional) página de login personalizada
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
