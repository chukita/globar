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
import { verifyImpersonationToken, verifyEmailVerificadoToken } from "./impersonar";

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
    // No usamos el callback `signIn` para esto: para un alta nueva por Google,
    // Auth.js todavía no persistió la fila en `users` cuando corre `signIn`
    // (el `user` que llega ahí es el perfil crudo de Google, con el id de
    // Google, no el nuestro) — recién en `jwt` llega el usuario ya persistido
    // con nuestro id real, así que es acá donde hay que asegurar el alta.
    async jwt(params) {
      if (params.user?.id && params.account?.provider === "google") {
        await ensureRevendedor(params.user.id);
      }
      return authConfig.callbacks?.jwt
        ? authConfig.callbacks.jwt(params)
        : params.token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Fuerza el selector de cuenta de Google en cada login — sin esto,
      // si el navegador ya tiene una sesión de Google activa, Google la
      // reusa en silencio y el usuario nunca ve con qué cuenta está
      // entrando.
      authorization: { params: { prompt: "select_account" } },
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
          // Mismo error genérico que contraseña incorrecta — no revelar si el
          // problema es la verificación pendiente (evita enumeración de emails).
          if (!user.emailVerified) return null;
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
    // Impersonación: ver src/lib/impersonar.ts. El token solo lo emite
    // impersonarRevendedorAction (protegida con requireSuperadmin), dura 60s
    // y se consume acá una única vez.
    Credentials({
      id: "impersonate",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (typeof token !== "string") return null;
        const userId = verifyImpersonationToken(token);
        if (!userId) return null;

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user || user.role !== "revendedor") return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    // Sign-in automático tras confirmar el email del registro (ver
    // src/app/api/registro/verificar/route.ts). El token solo lo emite ese
    // endpoint, dura 60s y se consume acá una única vez.
    Credentials({
      id: "email-verificado",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (typeof token !== "string") return null;
        const userId = verifyEmailVerificadoToken(token);
        if (!userId) return null;

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user || user.role !== "revendedor") return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
