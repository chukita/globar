import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { crearVerificacion, fechaUltimaVerificacion } from "@/lib/verificacionEmail";
import { sendEmail, emailVerificarCuenta } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const COOLDOWN_MS = 30_000;

// Respuesta genérica siempre — no revela si el email existe o ya está
// verificado (anti-enumeración, mismo criterio que agendaonline).
const RESPUESTA_GENERICA = NextResponse.json({ ok: true });

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(`reenviar:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo más tarde." }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Falta el email." }, { status: 400 });

    if (!checkRateLimit(`reenviar-email:${email.toLowerCase().trim()}`, 5, 15 * 60 * 1000)) {
      return RESPUESTA_GENERICA;
    }

    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.emailVerified) return RESPUESTA_GENERICA;

    const ultima = await fechaUltimaVerificacion(user.id);
    if (ultima && Date.now() - ultima.getTime() < COOLDOWN_MS) return RESPUESTA_GENERICA;

    const { codigo, token } = await crearVerificacion(user.id);
    const verifyUrl = `${process.env.AUTH_URL || new URL(req.url).origin}/registro/confirmar?token=${token}`;
    const { subject, html } = emailVerificarCuenta(codigo, verifyUrl);
    await sendEmail({ to: user.email, toName: user.name ?? undefined, subject, html });

    return RESPUESTA_GENERICA;
  } catch (e) {
    console.error("[registro/reenviar] error:", e);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
