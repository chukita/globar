import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { esDniValido, esCbuOAliasValido, esCuitValido, normalizarCuit } from "@/lib/validacion";
import { notifyAdmins, emailRevendedorNuevo } from "@/lib/email";

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

function perfilCompleto(v: { dni: string | null; fechaNacimiento: string | null; provincia: string | null; localidad: string | null; telefono: string | null }) {
  return !!(v.dni && v.fechaNacimiento && v.provincia && v.localidad && v.telefono);
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

  // Se avisa al superadmin la primera vez que el perfil pasa de incompleto a
  // completo — cubre tanto el alta por Google (que llega acá vacío desde
  // completar-perfil) como cualquier edición posterior desde /panel/perfil,
  // sin mandar el aviso de nuevo en cada edición de un perfil ya completo.
  const eraCompleto = perfilCompleto(rev);
  const esCompletoAhora = perfilCompleto({
    dni: dni !== undefined ? (dni || null) : rev.dni,
    fechaNacimiento: fechaNacimiento !== undefined ? (fechaNacimiento || null) : rev.fechaNacimiento,
    provincia: provincia !== undefined ? (provincia || null) : rev.provincia,
    localidad: localidad !== undefined ? (localidad || null) : rev.localidad,
    telefono: telefono !== undefined ? (telefono || null) : rev.telefono,
  });

  if (Object.keys(values).length > 0) {
    await db.update(revendedores).set(values).where(eq(revendedores.userId, user.id));
  }

  if (!eraCompleto && esCompletoAhora) {
    const { subject, html } = emailRevendedorNuevo(user.name ?? session.user.email, session.user.email);
    await notifyAdmins(subject, html, "revendedorNuevo");
  }

  return NextResponse.json({ ok: true });
}
