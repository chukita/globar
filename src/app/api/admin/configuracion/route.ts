import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConfiguracion, updateConfiguracion } from "@/lib/configuracion";
import { esEmailValido } from "@/lib/validacion";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const config = await getConfiguracion();
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  let body: { comisionMonto?: number; comisionMeses?: number; notifAdminEmails?: string; notifRevendedorNuevo?: boolean; notifFacturaSubida?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { comisionMonto, comisionMeses, notifAdminEmails, notifRevendedorNuevo, notifFacturaSubida } = body;

  if (typeof comisionMonto !== "number" || !Number.isFinite(comisionMonto) || comisionMonto <= 0) {
    return NextResponse.json({ error: "comisionMonto debe ser un número mayor a 0" }, { status: 400 });
  }
  if (typeof comisionMeses !== "number" || !Number.isInteger(comisionMeses) || comisionMeses <= 0) {
    return NextResponse.json({ error: "comisionMeses debe ser un entero mayor a 0" }, { status: 400 });
  }

  let notifAdminEmailsNormalizado: string | null | undefined;
  if (notifAdminEmails !== undefined) {
    const emails = notifAdminEmails.split(",").map((e) => e.trim()).filter(Boolean);
    const invalido = emails.find((e) => !esEmailValido(e));
    if (invalido) {
      return NextResponse.json({ error: `"${invalido}" no es un email válido.` }, { status: 400 });
    }
    notifAdminEmailsNormalizado = emails.length > 0 ? emails.join(", ") : null;
  }

  const config = await updateConfiguracion({
    comisionMonto,
    comisionMeses,
    notifAdminEmails: notifAdminEmailsNormalizado,
    notifRevendedorNuevo,
    notifFacturaSubida,
  });
  return NextResponse.json({ config });
}
