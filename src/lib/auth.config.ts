import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Config Edge-compatible: sin imports de Node.js (sin pg, sin Drizzle adapter).
// Usada por el middleware. La verificación real de credenciales ocurre en auth.ts.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      // La verificación real está en auth.ts — acá solo declaramos el provider
      authorize: () => null,
    }),
    Credentials({
      id: "superadmin",
      name: "Superadmin",
      credentials: {
        password: { label: "Contraseña", type: "password" },
      },
      // La verificación real está en auth.ts — acá solo declaramos el provider
      authorize: () => null,
    }),
    // Impersonación: el superadmin entra al panel de un revendedor puntual
    // sin conocer su contraseña (ver src/lib/impersonar.ts). La verificación
    // real del token está en auth.ts.
    Credentials({
      id: "impersonate",
      name: "Impersonar",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.role = (user as { role?: string }).role;
      if (account?.provider === "impersonate") token.impersonated = true;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        session.user.impersonated = Boolean(token.impersonated);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
