import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { facturas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { id } = await params;

  const [factura] = await db.select().from(facturas).where(eq(facturas.id, id)).limit(1);
  if (!factura) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  // Solo confiamos en el nombre del archivo (basename); el directorio sale del
  // revendedorId de la factura, no de la URL guardada en la DB.
  const nombreArchivo = path.basename(factura.archivoUrl);
  const rutaArchivo = path.join(UPLOAD_DIR, factura.revendedorId, nombreArchivo);

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
