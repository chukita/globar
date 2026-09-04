import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generarCodigoVendedor } from "@/lib/codigoVendedor";
import { crearVerificacion } from "@/lib/verificacionEmail";
import { sendEmail, emailVerificarCuenta } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { esMayorDeEdad } from "@/lib/validacion";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(`registro:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo más tarde." }, { status: 429 });
    }

    const body = await req.json();
    const { nombre, email, password, fechaNacimiento, puedeFacturar } = body;

    if (!nombre || !email || !password || !fechaNacimiento) {
      return NextResponse.json({ error: "Completá todos los campos obligatorios." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    if (!esMayorDeEdad(fechaNacimiento)) {
      return NextResponse.json({ error: "Tenés que ser mayor de 18 años para registrarte como revendedor." }, { status: 400 });
    }
    if (puedeFacturar !== true) {
      return NextResponse.json({ error: "Necesitás poder emitir factura por tus comisiones para registrarte como revendedor." }, { status: 400 });
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({ id: userId, name: nombre, email, password: hash, role: "revendedor" });

      // Datos personales (DNI, provincia, teléfono, etc.) son opcionales y se
      // completan después en /panel/perfil — hacen falta recién para cobrar,
      // no para usar el panel. El "puede emitir factura" sí es obligatorio en
      // el alta (checkbox en /registro).
      const codigoVentas = await generarCodigoVendedor(nombre);
      await tx.insert(revendedores).values({ userId, codigoVentas, fechaNacimiento, puedeFacturar: true });
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
