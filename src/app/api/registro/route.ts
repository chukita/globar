import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { esDniValido } from "@/lib/validacion";
import { notifyAdmins, emailRevendedorNuevo } from "@/lib/email";

function generarCodigo(nombre: string): string {
  const prefix = nombre
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase().replace(/[^A-Z]/g, "")
    .slice(0, 4).padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `GLOB${prefix}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[registro] body:", body);
    const { nombre, email, password, provincia, localidad, dni, fechaNacimiento, telefono, puedeFacturar } = body;

    if (!nombre || !email || !password || !provincia || !localidad || !dni || !fechaNacimiento) {
      return NextResponse.json({ error: "Completá todos los campos obligatorios." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    if (!esDniValido(dni)) {
      return NextResponse.json({ error: "El DNI debe tener 7 u 8 dígitos." }, { status: 400 });
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({ id: userId, name: nombre, email, password: hash, role: "revendedor" });

      let codigo = generarCodigo(nombre);
      const [dup] = await tx.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.codigoVentas, codigo)).limit(1);
      if (dup) codigo = generarCodigo(nombre + Date.now());

      await tx.insert(revendedores).values({
        userId,
        codigoVentas: codigo,
        pais: "Argentina",
        provincia,
        localidad,
        zona: `${provincia} · ${localidad}`,
        dni,
        fechaNacimiento,
        telefono: telefono || null,
        puedeFacturar: !!puedeFacturar,
      });
    });

    const { subject, html } = emailRevendedorNuevo(nombre, email);
    await notifyAdmins(subject, html);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[registro] error:", e);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
