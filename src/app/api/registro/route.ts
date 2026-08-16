import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generarCodigoVendedor } from "@/lib/codigoVendedor";
import { crearVerificacion } from "@/lib/verificacionEmail";
import { sendEmail, emailVerificarCuenta } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(`registro:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo más tarde." }, { status: 429 });
    }

    const body = await req.json();
    const { nombre, email, password } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: "Completá todos los campos obligatorios." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({ id: userId, name: nombre, email, password: hash, role: "revendedor" });

      // Datos de vendedor (DNI, provincia, teléfono, etc.) se completan en
      // /panel/completar-perfil, después de verificar el email — mismo shape
      // que ensureRevendedor() ya usa para las altas por Google.
      const codigoVentas = await generarCodigoVendedor(nombre);
      await tx.insert(revendedores).values({ userId, codigoVentas });
    });

    const { codigo, token } = await crearVerificacion(userId);
    const verifyUrl = `${process.env.AUTH_URL || new URL(req.url).origin}/registro/confirmar?token=${token}`;
    const { subject, html } = emailVerificarCuenta(codigo, verifyUrl);
    await sendEmail({ to: email, toName: nombre, subject, html });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[registro] error:", e);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
