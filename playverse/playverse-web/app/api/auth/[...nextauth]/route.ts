// playverse-web/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import AzureAd from "next-auth/providers/azure-ad";
import Credentials from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

async function getRoleByEmail(email?: string | null) {
  if (!email) return "free";
  try {
    const profile = await convex.query(api.queries.getUserByEmail.getUserByEmail as any, { email });
    // profile?.role puede ser "free" | "premium" | "admin"
    return (profile as any)?.role ?? "free";
  } catch {
    return "free";
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    // ───── OAuth: Google
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ───── OAuth: Microsoft/Xbox
    AzureAd({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      authorization: { params: { scope: "openid profile email offline_access" } },
      checks: ["pkce", "state"],
      allowDangerousEmailAccountLinking: true,
    }),

    // ───── Email/Password con Convex (usa tu mutation authLogin)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        // valida contra Convex
        const res = await convex.mutation(api.auth.authLogin as any, {
          email: String(creds.email).toLowerCase().trim(),
          password: String(creds.password),
        });
        if (!res?.ok) return null;
        const p = res.profile;
        return {
          id: String(p._id),
          name: p.name ?? "",
          email: p.email,
          role: p.role ?? "free",
          picture: (p as any)?.avatarUrl ?? undefined,
        } as any;
      },
    }),
  ],

  callbacks: {
    // ── Al hacer sign-in por OAuth, aseguramos upsert del perfil
    async signIn({ user, account }) {
      try {
        if (!user?.email) return false;
        await convex.mutation(api.auth.oauthUpsert as any, {
          email: user.email,
          name: user.name ?? "",
          avatarUrl: (user as any).image ?? undefined,
          provider: account?.provider ?? "unknown",
          providerId: account?.providerAccountId ?? undefined,
        });
        return true;
      } catch (err) {
        console.error("oauthUpsert failed:", err);
        return true; // no bloqueamos el login
      }
    },

    // ── JWT: GUARDA SIEMPRE EL ROLE REAL
    async jwt({ token, user }) {
      // En el primer login (credentials u oauth) puede venir user
      if (user) {
        (token as any).role = (user as any).role ?? (token as any).role ?? "free";
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        (token as any).picture = (user as any).picture ?? (token as any).picture;
      }

      // Refrescar role desde Convex si aún no está o quedó desactualizado
      if (!(token as any).role || (token as any).role === "free") {
        const role = await getRoleByEmail(token.email as string | undefined);
        (token as any).role = role ?? (token as any).role ?? "free";
      }

      return token;
    },

    // ── Session: expone role al cliente (session.user.role)
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).image = (token as any).picture;
        (session.user as any).role = (token as any).role ?? "free";
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
