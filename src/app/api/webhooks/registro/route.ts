import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registros, revendedores, productos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Payload esperado de los productos digitales (agendaonline, nume, etc.)
 * cuando alguien se registra con un link `?vendedor=`, ANTES de pagar nada
 * (el aviso de pago sigue siendo `POST /api/webhooks/pago`, aparte).
 *
 * {
 *   "externoId":       "b3f1...-uuid",       // id del registro en el producto (ej. shopId) — para idempotencia
 *   "productoSlug":    "agendaonline",       // slug del producto registrado en glob.ar
 *   "clienteEmail":    "cliente@email.com",
 *   "clienteNombre":   "Centro Odontológico Sur",
 *   "codigoRevendedor": "GLOBMQ-7K2"        // opcional — ausente si el cliente no vino de un revendedor
 * }
 */
interface RegistroPayload {
  externoId:         string;
  productoSlug:      string;
  clienteEmail:      string;
  clienteNombre:     string;
  codigoRevendedor?: string;
}

export async function POST(req: NextRequest) {
  // ── Autenticación ─────────────────────────────────────────────────────────
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parseo y validación básica ────────────────────────────────────────────
  let body: RegistroPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { externoId, productoSlug, clienteEmail, clienteNombre, codigoRevendedor } = body;

  if (!externoId || !productoSlug || !clienteEmail || !clienteNombre) {
    return NextResponse.json({ error: "Faltan campos requeridos: externoId, productoSlug, clienteEmail, clienteNombre" }, { status: 400 });
  }

  // ── Buscar el producto en glob.ar ─────────────────────────────────────────
  const [producto] = await db
    .select()
    .from(productos)
    .where(eq(productos.nombre, productoSlug))
    .limit(1);

  if (!producto) {
    return NextResponse.json({ error: `Producto '${productoSlug}' no registrado en glob.ar` }, { status: 422 });
  }

  // ── Buscar revendedor si viene el código ──────────────────────────────────
  let revendedorId: string | null = null;
  if (codigoRevendedor) {
    const [r] = await db
      .select({ id: revendedores.id })
      .from(revendedores)
      .where(and(
        eq(revendedores.codigoVentas, codigoRevendedor),
        eq(revendedores.activo, true),
      ))
      .limit(1);

    if (!r) {
      // Código inválido o revendedor inactivo — registramos el lead igual, sin revendedor asociado
      console.warn(`[webhook/registro] Código de revendedor inválido o inactivo: ${codigoRevendedor}`);
    } else {
      revendedorId = r.id;
    }
  }

  // ── Insertar el registro (idempotente por producto + externoId) ───────────
  const [registro] = await db
    .insert(registros)
    .values({
      revendedorId,
      productoId: producto.id,
      clienteNombre,
      clienteEmail,
      externoId,
    })
    .onConflictDoNothing()
    .returning();

  return NextResponse.json({
    ok: true,
    registroId: registro?.id ?? null,
    duplicado: !registro,
  });
}
