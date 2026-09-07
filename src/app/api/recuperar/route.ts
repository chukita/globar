import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { crearResetPassword, resetearPasswordConToken } from "@/lib/passwordReset";
import { sendEmail, emailRecuperarPassword } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, token, password } = body;

    // ── Paso 2: setear la contraseña nueva con el token del link ──────────────
    if (typeof token === "string") {
      if (!checkRateLimit(`recuperar-set:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
        return NextResponse.json({ error: "Demasiados intentos. Probá más tarde." }, { status: 429 });
      }
      const res = await resetearPasswordConToken(token, String(password ?? ""));
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    // ── Paso 1: pedir el link de recuperación ────────────────────────────────
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Escribí un email válido." }, { status: 400 });
    }
    if (!checkRateLimit(`recuperar-req:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiados pedidos. Probá más tarde." }, { status: 429 });
    }

    const emailNorm = email.toLowerCase().trim();
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, password: users.password })
      .from(users)
      .where(eq(users.email, emailNorm))
      .limit(1);

    // Solo tiene sentido para cuentas con contraseña (las de solo-Google no la
    // usan). En cualquier caso respondemos igual para no filtrar qué emails
    // existen ni cómo se registraron.
    if (user?.password) {
      const tokenReset = await crearResetPassword(user.id);
      const resetUrl = `${process.env.AUTH_URL || new URL(req.url).origin}/recuperar/nueva?token=${tokenReset}`;
      const { subject, html } = emailRecuperarPassword(resetUrl);
      await sendEmail({ to: user.email, toName: user.name ?? undefined, subject, html });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[recuperar] error:", e);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
