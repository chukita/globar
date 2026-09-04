import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { cuotas, liquidaciones, revendedores, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";
import { notifyAdmins, emailFacturaLiquidacionSubida } from "@/lib/email";
import { getLiquidacionesDelRevendedor } from "@/lib/panel-data";

const MAX_FILE_MB = 5;

/**
 * El revendedor sube la factura de una liquidación que ya cobró. Con el
 * rediseño de sept. 2026 se paga primero (liquidación mensual del superadmin) y
 * la factura llega después: acá no se elige nada, se adjunta el PDF de UNA
 * liquidación en estado "pagada".
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "revendedor") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const archivo = formData.get("archivo") as File | null;
  const nota = (formData.get("nota") as string | null) ?? "";
  const liquidacionId = formData.get("liquidacionId") as string | null;

  if (!archivo) {
    return NextResponse.json({ error: "El archivo PDF es requerido" }, { status: 400 });
  }
  if (!liquidacionId) {
    return NextResponse.json({ error: "Falta la liquidación" }, { status: 400 });
  }
  if (archivo.size > MAX_FILE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo no puede superar ${MAX_FILE_MB}MB` }, { status: 400 });
  }
  if (!archivo.type.includes("pdf")) {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF" }, { status: 400 });
  }

  const [revendedor] = await db
    .select()
    .from(revendedores)
    .where(eq(revendedores.userId, session.user.id!))
    .limit(1);

  if (!revendedor) {
    return NextResponse.json({ error: "Revendedor no encontrado" }, { status: 404 });
  }
  if (!revendedor.activo) {
    return NextResponse.json({ error: "Cuenta desactivada" }, { status: 403 });
  }

  const [liq] = await db
    .select()
    .from(liquidaciones)
    .where(and(eq(liquidaciones.id, liquidacionId), eq(liquidaciones.revendedorId, revendedor.id)))
    .limit(1);

  if (!liq) {
    return NextResponse.json({ error: "Liquidación no encontrada" }, { status: 404 });
  }
  if (liq.status !== "pagada") {
    return NextResponse.json({ error: "Esta liquidación ya tiene factura o fue anulada" }, { status: 422 });
  }

  // ── Guardar el archivo ────────────────────────────────────────────────────
  const nombreArchivo = `factura_liq_${liq.id}_${Date.now()}.pdf`;
  const rutaDir = path.join(UPLOAD_DIR, revendedor.id);
  await mkdir(rutaDir, { recursive: true });
  const buffer = Buffer.from(await archivo.arrayBuffer());
  await writeFile(path.join(rutaDir, nombreArchivo), buffer);

  const ahora = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(liquidaciones)
      .set({
        status: "facturada",
        facturaUrl: nombreArchivo,
        facturaRecibidaEn: ahora,
        nota: nota || liq.nota,
      })
      .where(eq(liquidaciones.id, liq.id));

    await tx
      .update(cuotas)
      .set({ status: "pagada", facturadoEn: ahora, pagadoEn: ahora })
      .where(eq(cuotas.liquidacionId, liq.id));
  });

  const [user] = await db.select({ nombre: users.name }).from(users).where(eq(users.id, revendedor.userId));
  const { subject, html } = emailFacturaLiquidacionSubida(user?.nombre ?? revendedor.codigoVentas, revendedor.codigoVentas, Number(liq.monto));
  await notifyAdmins(subject, html, "facturaSubida");

  return NextResponse.json({ ok: true, liquidacionId: liq.id, monto: Number(liq.monto) });
}

// ── GET: liquidaciones del revendedor logueado ───────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [revendedor] = await db
    .select({ id: revendedores.id })
    .from(revendedores)
    .where(eq(revendedores.userId, session.user.id!))
    .limit(1);

  if (!revendedor) {
    return NextResponse.json({ liquidaciones: [] });
  }

  return NextResponse.json({ liquidaciones: await getLiquidacionesDelRevendedor(revendedor.id) });
}
