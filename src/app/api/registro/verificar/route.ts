import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validarCodigo, validarToken, marcarEmailVerificado } from "@/lib/verificacionEmail";
import { sendEmail, notifyAdmins, emailRevendedorNuevo, emailBienvenida } from "@/lib/email";
import { signEmailVerificadoToken } from "@/lib/impersonar";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(`verificar:${clientIp(req)}`, 30, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo más tarde." }, { status: 429 });
    }

    const body = await req.json();
    const { email, codigo, token } = body;

    const resultado = typeof token === "string"
      ? await validarToken(token)
      : email && codigo
        ? await validarCodigo(email, codigo)
        : null;

    if (!resultado) {
      return NextResponse.json({ error: "Faltan datos para verificar." }, { status: 400 });
    }
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: 400 });
    }

    await marcarEmailVerificado(resultado.userId);

    const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, resultado.userId)).limit(1);
    if (user) {
      const nuevo = emailRevendedorNuevo(user.name ?? user.email, user.email);
      await notifyAdmins(nuevo.subject, nuevo.html, "revendedorNuevo");
      const bienvenida = emailBienvenida(user.name ?? undefined);
      await sendEmail({ to: user.email, toName: user.name ?? undefined, subject: bienvenida.subject, html: bienvenida.html });
    }

    const signInToken = signEmailVerificadoToken(resultado.userId);
    return NextResponse.json({ ok: true, token: signInToken });
  } catch (e) {
    console.error("[registro/verificar] error:", e);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
