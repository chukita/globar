import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { ensureRevendedor } from "./revendedor";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (user?.id && (user as { role?: string }).role === "revendedor") {
        await ensureRevendedor(user.id);
      }
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Sobreescribimos Credentials con la lógica real de DB
    Credentials({
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log("[authorize] called, email:", credentials?.email);
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);
          console.log("[authorize] user found:", !!user, "has pw:", !!user?.password);
          if (!user?.password) return null;
          const ok = await bcrypt.compare(credentials.password as string, user.password);
          console.log("[authorize] bcrypt ok:", ok);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (e) {
          console.error("[authorize] error:", e);
          return null;
        }
      },
    }),
    // Login de superadmin: solo contraseña, sin usuario — separado de los
    // revendedores (que se loguean con Google o email+password ligados a una
    // fila en `users`). La clave vive hasheada en SUPERADMIN_PASSWORD_HASH.
    Credentials({
      id: "superadmin",
      name: "Superadmin",
      credentials: {
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const hash = process.env.SUPERADMIN_PASSWORD_HASH;
        if (!hash || !credentials?.password) return null;
        const ok = await bcrypt.compare(credentials.password as string, hash);
        if (!ok) return null;
        return { id: "superadmin", email: "superadmin@glob.ar", name: "Superadmin", role: "superadmin" };
      },
    }),
  ],
});
