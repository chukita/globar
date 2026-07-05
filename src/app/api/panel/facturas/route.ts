import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { facturas, cuotas, cuotasFacturas, revendedores } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const MAX_FILE_MB = 5;

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "revendedor") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // ── Parseo del form ───────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const archivo = formData.get("archivo") as File | null;
  const nota    = (formData.get("nota") as string | null) ?? "";
  const cuotaIdsRaw = formData.get("cuotaIds") as string | null;

  if (!archivo) {
    return NextResponse.json({ error: "El archivo PDF es requerido" }, { status: 400 });
  }
  if (!cuotaIdsRaw) {
    return NextResponse.json({ error: "Seleccioná al menos una cuota" }, { status: 400 });
  }

  let cuotaIds: string[];
  try {
    cuotaIds = JSON.parse(cuotaIdsRaw);
    if (!Array.isArray(cuotaIds) || cuotaIds.length === 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "cuotaIds inválido" }, { status: 400 });
  }

  // ── Validar tamaño del archivo ────────────────────────────────────────────
  if (archivo.size > MAX_FILE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo no puede superar ${MAX_FILE_MB}MB` }, { status: 400 });
  }
  if (!archivo.type.includes("pdf")) {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF" }, { status: 400 });
  }

  // ── Buscar el revendedor del usuario logueado ─────────────────────────────
  const [revendedor] = await db
    .select()
    .from(revendedores)
    .where(eq(revendedores.userId, session.user.id!))
    .limit(1);

  if (!revendedor) {
    return NextResponse.json({ error: "Revendedor no encontrado" }, { status: 404 });
  }

  // ── Verificar que las cuotas pertenecen a este revendedor y están generadas ──
  const cuotasValidas = await db
    .select()
    .from(cuotas)
    .where(and(
      inArray(cuotas.id, cuotaIds),
      eq(cuotas.revendedorId, revendedor.id),
      eq(cuotas.status, "generada"),
    ));

  if (cuotasValidas.length !== cuotaIds.length) {
    return NextResponse.json({
      error: "Una o más cuotas no son válidas (ya facturadas, de otro revendedor o pendientes)",
    }, { status: 422 });
  }

  // ── Calcular monto total ──────────────────────────────────────────────────
  const monto = cuotasValidas.reduce((sum, c) => sum + Number(c.monto), 0);

  // ── Guardar el archivo ────────────────────────────────────────────────────
  const timestamp = Date.now();
  const nombreArchivo = `${revendedor.codigoVentas}_${timestamp}.pdf`;
  const rutaDir = path.join(UPLOAD_DIR, revendedor.id);

  await mkdir(rutaDir, { recursive: true });
  const buffer = Buffer.from(await archivo.arrayBuffer());
  await writeFile(path.join(rutaDir, nombreArchivo), buffer);

  const archivoUrl = `/uploads/${revendedor.id}/${nombreArchivo}`;

  // ── Crear la factura y vincular cuotas (transacción) ─────────────────────
  const resultado = await db.transaction(async (tx) => {
    const [factura] = await tx
      .insert(facturas)
      .values({
        revendedorId: revendedor.id,
        monto:        String(monto),
        archivoUrl,
        nota:         nota || null,
        pagada:       false,
      })
      .returning();

    await tx.insert(cuotasFacturas).values(
      cuotaIds.map(cuotaId => ({ cuotaId, facturaId: factura.id }))
    );

    await tx
      .update(cuotas)
      .set({ status: "facturada", facturadoEn: new Date() })
      .where(inArray(cuotas.id, cuotaIds));

    return factura;
  });

  return NextResponse.json({
    ok:        true,
    facturaId: resultado.id,
    monto,
    cuotas:    cuotaIds.length,
    archivoUrl,
  });
}

// ── GET: listar facturas del revendedor logueado ──────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [revendedor] = await db
    .select()
    .from(revendedores)
    .where(eq(revendedores.userId, session.user.id!))
    .limit(1);

  if (!revendedor) {
    return NextResponse.json({ facturas: [] });
  }

  const resultado = await db
    .select()
    .from(facturas)
    .where(eq(facturas.revendedorId, revendedor.id))
    .orderBy(facturas.subidaEn);

  return NextResponse.json({ facturas: resultado });
}
