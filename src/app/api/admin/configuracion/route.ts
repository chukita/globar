import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConfiguracion, updateConfiguracion } from "@/lib/configuracion";

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

  let body: { comisionMonto?: number; comisionMeses?: number; diasLiquidacionMp?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { comisionMonto, comisionMeses, diasLiquidacionMp } = body;

  if (typeof comisionMonto !== "number" || !Number.isFinite(comisionMonto) || comisionMonto <= 0) {
    return NextResponse.json({ error: "comisionMonto debe ser un número mayor a 0" }, { status: 400 });
  }
  if (typeof comisionMeses !== "number" || !Number.isInteger(comisionMeses) || comisionMeses <= 0) {
    return NextResponse.json({ error: "comisionMeses debe ser un entero mayor a 0" }, { status: 400 });
  }
  if (typeof diasLiquidacionMp !== "number" || !Number.isInteger(diasLiquidacionMp) || diasLiquidacionMp < 0) {
    return NextResponse.json({ error: "diasLiquidacionMp debe ser un entero mayor o igual a 0" }, { status: 400 });
  }

  const config = await updateConfiguracion({ comisionMonto, comisionMeses, diasLiquidacionMp });
  return NextResponse.json({ config });
}
