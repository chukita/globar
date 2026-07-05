import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ventas, cuotas, revendedores, productos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Payload esperado de los productos digitales (agendaonline, nume, etc.)
 *
 * {
 *   "pagoId":          "MP-12345",          // ID único del pago en el producto — para idempotencia
 *   "productoSlug":    "agendaonline",       // slug del producto registrado en glob.ar
 *   "clienteEmail":    "cliente@email.com",
 *   "clienteNombre":   "Centro Odontológico Sur",
 *   "montoAbonado":    9000,                 // en ARS
 *   "periodoMes":      7,                    // mes al que corresponde el pago
 *   "periodoAnio":     2026,
 *   "codigoRevendedor": "GLOBMQ-7K2"        // opcional — ausente si el cliente no vino de un revendedor
 * }
 */
interface PagoPayload {
  pagoId:            string;
  productoSlug:      string;
  clienteEmail:      string;
  clienteNombre:     string;
  montoAbonado:      number;
  periodoMes:        number;
  periodoAnio:       number;
  codigoRevendedor?: string;
}

const MAX_CUOTAS = 6;
const COMISION_PCT = 0.5; // 50% del abono mensual por cuota

export async function POST(req: NextRequest) {
  // ── Autenticación ─────────────────────────────────────────────────────────
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parseo y validación básica ────────────────────────────────────────────
  let body: PagoPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { pagoId, productoSlug, clienteEmail, clienteNombre, montoAbonado, periodoMes, periodoAnio, codigoRevendedor } = body;

  if (!pagoId || !productoSlug || !clienteEmail || !montoAbonado || !periodoMes || !periodoAnio) {
    return NextResponse.json({ error: "Faltan campos requeridos: pagoId, productoSlug, clienteEmail, montoAbonado, periodoMes, periodoAnio" }, { status: 400 });
  }

  // ── Idempotencia: si ya procesamos este pagoId, no hacemos nada ───────────
  const [cuotaExistente] = await db
    .select({ id: cuotas.id })
    .from(cuotas)
    .where(eq(cuotas.pagoExternoId, pagoId))
    .limit(1);

  if (cuotaExistente) {
    return NextResponse.json({ ok: true, cuotaId: cuotaExistente.id, duplicado: true });
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
  let revendedor = null;
  if (codigoRevendedor) {
    const [r] = await db
      .select()
      .from(revendedores)
      .where(and(
        eq(revendedores.codigoVentas, codigoRevendedor),
        eq(revendedores.activo, true),
      ))
      .limit(1);

    if (!r) {
      // Código inválido o revendedor inactivo — registramos el pago igual, sin comisión
      console.warn(`[webhook/pago] Código de revendedor inválido o inactivo: ${codigoRevendedor}`);
    } else {
      revendedor = r;
    }
  }

  // ── Buscar venta existente para este cliente + producto (+ revendedor) ────
  // Una "venta" representa la suscripción de un cliente originada por un revendedor.
  let venta = null;

  if (revendedor) {
    const [v] = await db
      .select()
      .from(ventas)
      .where(and(
        eq(ventas.clienteEmail, clienteEmail),
        eq(ventas.productoId, producto.id),
        eq(ventas.revendedorId, revendedor.id),
        eq(ventas.activa, true),
      ))
      .limit(1);
    venta = v ?? null;
  }

  // ── Si no existe venta, crearla (primer pago = registro de la venta) ──────
  if (!venta) {
    const [nuevaVenta] = await db
      .insert(ventas)
      .values({
        revendedorId:  revendedor?.id ?? null,
        productoId:    producto.id,
        clienteNombre: clienteNombre ?? clienteEmail,
        clienteEmail,
        precioMensual: String(montoAbonado),
      })
      .returning();
    venta = nuevaVenta;
  }

  // ── Si no hay revendedor, terminamos: pago registrado sin comisión ─────────
  if (!revendedor) {
    return NextResponse.json({
      ok: true,
      ventaId: venta.id,
      comision: false,
      mensaje: "Pago registrado sin comisión (sin código de revendedor válido)",
    });
  }

  // ── Contar cuotas ya generadas para esta venta ────────────────────────────
  const cuotasExistentes = await db
    .select({ numeroCuota: cuotas.numeroCuota })
    .from(cuotas)
    .where(eq(cuotas.ventaId, venta.id));

  if (cuotasExistentes.length >= MAX_CUOTAS) {
    return NextResponse.json({
      ok: true,
      ventaId: venta.id,
      comision: false,
      mensaje: `Venta ya completó las ${MAX_CUOTAS} cuotas de comisión`,
    });
  }

  // ── Crear la cuota de comisión ────────────────────────────────────────────
  const numeroCuota = cuotasExistentes.length + 1;
  const montoCuota  = Math.round(montoAbonado * COMISION_PCT);

  const [nuevaCuota] = await db
    .insert(cuotas)
    .values({
      ventaId:       venta.id,
      revendedorId:  revendedor.id,
      numeroCuota,
      monto:         String(montoCuota),
      periodoMes,
      periodoAnio,
      status:        "generada",
      pagoExternoId: pagoId,
      generadoEn:    new Date(),
    })
    .returning();

  return NextResponse.json({
    ok: true,
    ventaId:     venta.id,
    cuotaId:     nuevaCuota.id,
    comision:    true,
    numeroCuota,
    montoCuota,
    revendedor:  revendedor.codigoVentas,
    mensaje:     `Cuota ${numeroCuota}/${MAX_CUOTAS} generada para ${revendedor.codigoVentas}`,
  });
}
