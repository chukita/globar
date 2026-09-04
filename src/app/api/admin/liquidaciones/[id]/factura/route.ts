import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { liquidaciones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

// Sirve el PDF de factura que subió el revendedor para esta liquidación.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;
  const [liq] = await db.select().from(liquidaciones).where(eq(liquidaciones.id, id)).limit(1);
  if (!liq?.facturaUrl) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const nombreArchivo = path.basename(liq.facturaUrl);
  const rutaArchivo = path.join(UPLOAD_DIR, liq.revendedorId, nombreArchivo);

  let buffer: Buffer;
  try {
    buffer = await readFile(rutaArchivo);
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en el servidor" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nombreArchivo}"`,
    },
  });
}
