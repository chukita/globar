import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { esDniValido, esCbuOAliasValido, esCuitValido, normalizarCuit, esMayorDeEdad } from "@/lib/validacion";
import { sendEmail, notifyAdmins, emailRevendedorNuevo, emailBienvenida } from "@/lib/email";

interface PerfilPatchBody {
  dni?: string;
  fechaNacimiento?: string;
  provincia?: string;
  localidad?: string;
  telefono?: string;
  cbuAlias?: string;
  titularNombre?: string;
  titularCuit?: string;
  puedeFacturar?: boolean;
  notifFacturaPagada?: boolean;
  notifComisionGenerada?: boolean;
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, session.user.email)).limit(1);
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const [rev] = await db.select().from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);
  if (!rev) return NextResponse.json({ error: "Revendedor no encontrado." }, { status: 404 });

  const body: PerfilPatchBody = await req.json();
  const { dni, fechaNacimiento, provincia, localidad, telefono, cbuAlias, titularNombre, titularCuit, puedeFacturar, notifFacturaPagada, notifComisionGenerada } = body;

  if (dni !== undefined && dni !== "" && !esDniValido(dni)) {
    return NextResponse.json({ error: "El DNI debe tener 7 u 8 dígitos." }, { status: 400 });
  }
  if (fechaNacimiento !== undefined && fechaNacimiento !== "" && !esMayorDeEdad(fechaNacimiento)) {
    return NextResponse.json({ error: "Tenés que ser mayor de 18 años." }, { status: 400 });
  }
  if (cbuAlias !== undefined && cbuAlias !== "" && !esCbuOAliasValido(cbuAlias)) {
    return NextResponse.json({ error: "Ingresá un CBU de 22 dígitos o un alias válido (6 a 20 caracteres)." }, { status: 400 });
  }

  // El "puede facturar" efectivo es el que viene en este mismo request si lo
  // están tocando ahora, o si no el que ya está guardado — para que tildar el
  // checkbox y cargar el CUIT en el mismo guardado funcione bien.
  const puedeFacturarEfectivo = puedeFacturar !== undefined ? !!puedeFacturar : rev.puedeFacturar;
  if (puedeFacturarEfectivo && titularCuit !== undefined) {
    if (titularCuit === "" || !esCuitValido(titularCuit)) {
      return NextResponse.json({ error: "El CUIT/CUIL es obligatorio si podés emitir factura." }, { status: 400 });
    }
  } else if (titularCuit !== undefined && titularCuit !== "" && !esCuitValido(titularCuit)) {
    return NextResponse.json({ error: "El CUIT/CUIL debe tener el formato XX-XXXXXXXX-X." }, { status: 400 });
  }

  const values: Partial<typeof revendedores.$inferInsert> = {};
  if (dni !== undefined) values.dni = dni || null;
  if (fechaNacimiento !== undefined) values.fechaNacimiento = fechaNacimiento || null;
  if (provincia !== undefined) values.provincia = provincia || null;
  if (localidad !== undefined) values.localidad = localidad || null;
  if (telefono !== undefined) values.telefono = telefono || null;
  if (cbuAlias !== undefined) values.cbuAlias = cbuAlias || null;
  if (titularNombre !== undefined) values.titularNombre = titularNombre || null;
  if (titularCuit !== undefined) values.titularCuit = titularCuit ? normalizarCuit(titularCuit) : null;
  if (puedeFacturar !== undefined) values.puedeFacturar = !!puedeFacturar;
  if (notifFacturaPagada !== undefined) values.notifFacturaPagada = !!notifFacturaPagada;
  if (notifComisionGenerada !== undefined) values.notifComisionGenerada = !!notifComisionGenerada;

  if (Object.keys(values).length > 0) {
    await db.update(revendedores).set(values).where(eq(revendedores.userId, user.id));
  }

  // Cuando el revendedor confirma que puede facturar (false → true): para el
  // alta por email eso ya viene en true desde /registro, así que esto sólo
  // dispara en el alta por Google (que lo confirma en /panel/confirmar-facturacion).
  // El alta por email avisa al admin y da la bienvenida desde /api/registro/verificar.
  if (puedeFacturar === true && !rev.puedeFacturar) {
    const nuevo = emailRevendedorNuevo(user.name ?? session.user.email, session.user.email);
    await notifyAdmins(nuevo.subject, nuevo.html, "revendedorNuevo");
    const bienvenida = emailBienvenida(user.name ?? undefined);
    await sendEmail({ to: session.user.email, toName: user.name ?? undefined, subject: bienvenida.subject, html: bienvenida.html });
  }

  return NextResponse.json({ ok: true });
}
