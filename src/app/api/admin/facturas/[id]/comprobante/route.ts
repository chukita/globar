import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { facturas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

const MAX_FILE_MB = 5;
const TIPOS_PERMITIDOS = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;
  const [factura] = await db.select().from(facturas).where(eq(facturas.id, id)).limit(1);
  if (!factura) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const archivo = formData.get("archivo") as File | null;
  if (!archivo) {
    return NextResponse.json({ error: "El archivo es requerido" }, { status: 400 });
  }
  if (archivo.size > MAX_FILE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo no puede superar ${MAX_FILE_MB}MB` }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json({ error: "Solo se aceptan PDF o imágenes (PNG/JPG/WEBP)" }, { status: 400 });
  }

  const ext = archivo.type === "application/pdf" ? "pdf" : archivo.type.split("/")[1];
  const nombreArchivo = `comprobante_${Date.now()}.${ext}`;
  const rutaDir = path.join(UPLOAD_DIR, factura.revendedorId);
  await mkdir(rutaDir, { recursive: true });
  const buffer = Buffer.from(await archivo.arrayBuffer());
  await writeFile(path.join(rutaDir, nombreArchivo), buffer);

  await db.update(facturas).set({ comprobanteUrl: nombreArchivo }).where(eq(facturas.id, id));

  return NextResponse.json({ ok: true });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;
  const [factura] = await db.select().from(facturas).where(eq(facturas.id, id)).limit(1);
  if (!factura?.comprobanteUrl) {
    return NextResponse.json({ error: "Comprobante no encontrado" }, { status: 404 });
  }

  // Igual que /archivo: solo confiamos en el basename guardado, el directorio
  // sale del revendedorId de la factura, no de la URL.
  const nombreArchivo = path.basename(factura.comprobanteUrl);
  const rutaArchivo = path.join(UPLOAD_DIR, factura.revendedorId, nombreArchivo);

  let buffer: Buffer;
  try {
    buffer = await readFile(rutaArchivo);
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en el servidor" }, { status: 404 });
  }

  const ext = path.extname(nombreArchivo).slice(1);
  const contentType = ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${nombreArchivo}"`,
    },
  });
}
