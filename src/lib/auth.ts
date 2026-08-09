import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
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
  ],
});
