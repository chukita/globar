import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { liquidaciones, revendedores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

// El revendedor re-ve el PDF de factura que subió para una liquidación suya.
// `[id]` es el id de la liquidación.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "revendedor") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const [rev] = await db
    .select({ id: revendedores.id })
    .from(revendedores)
    .where(eq(revendedores.userId, session.user.id!))
    .limit(1);
  if (!rev) {
    return NextResponse.json({ error: "Revendedor no encontrado" }, { status: 404 });
  }

  const { id } = await params;
  const [liq] = await db
    .select()
    .from(liquidaciones)
    .where(and(eq(liquidaciones.id, id), eq(liquidaciones.revendedorId, rev.id)))
    .limit(1);
  if (!liq?.facturaUrl) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const nombreArchivo = path.basename(liq.facturaUrl);
  const rutaArchivo = path.join(UPLOAD_DIR, rev.id, nombreArchivo);

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
