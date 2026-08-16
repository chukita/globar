import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { esDniValido } from "@/lib/validacion";
import { notifyAdmins, emailRevendedorNuevo } from "@/lib/email";
import { generarCodigoVendedor } from "@/lib/codigoVendedor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[registro] body:", body);
    const { nombre, email, password, provincia, localidad, dni, fechaNacimiento, telefono, puedeFacturar } = body;

    if (!nombre || !email || !password || !provincia || !localidad || !dni || !fechaNacimiento || !telefono) {
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

      const codigo = await generarCodigoVendedor(nombre);

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
    await notifyAdmins(subject, html, "revendedorNuevo");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[registro] error:", e);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
