import { db } from "@/db";
import { cuotas, ventas, productos, habilitaciones, facturas, liquidaciones, registros } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function getRevendedorStats(revendedorId: string) {
  const [ventasCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ventas)
    .where(eq(ventas.revendedorId, revendedorId));

  // "Cobrado" = plata ya transferida: cuotas liquidadas (falta solo la factura) + pagadas.
  const [cobradas] = await db
    .select({ total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(and(eq(cuotas.revendedorId, revendedorId), inArray(cuotas.status, ["liquidada", "pagada"])));

  // "Pendiente" = comisiones acumuladas todavía sin liquidar.
  const [pendientes] = await db
    .select({ total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(and(eq(cuotas.revendedorId, revendedorId), inArray(cuotas.status, ["generada", "facturada"])));

  return {
    ventasTotales: ventasCount?.count ?? 0,
    comisionesCobradas: Number(cobradas?.total ?? 0),
    comisionesPendientes: Number(pendientes?.total ?? 0),
  };
}

export async function getComisionesDelRevendedor(revendedorId: string) {
  return db
    .select({
      id: cuotas.id,
      numeroCuota: cuotas.numeroCuota,
      monto: cuotas.monto,
      periodoMes: cuotas.periodoMes,
      periodoAnio: cuotas.periodoAnio,
      status: cuotas.status,
      producto: productos.nombre,
      cliente: ventas.clienteNombre,
    })
    .from(cuotas)
    .innerJoin(ventas, eq(cuotas.ventaId, ventas.id))
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .where(eq(cuotas.revendedorId, revendedorId))
    .orderBy(sql`${cuotas.periodoAnio} desc, ${cuotas.periodoMes} desc`);
}

/**
 * Clientes que le compraron a este revendedor, con `ultimoPagoEn` para
 * inferir si la suscripción sigue activa (ver estadoSuscripcion.ts) — no es
 * el estado real (no hay webhook de baja), es el último pago que sabemos
 * que llegó.
 */
export async function getClientesDelRevendedor(revendedorId: string) {
  return db
    .select({
      id: ventas.id,
      cliente: ventas.clienteNombre,
      clienteEmail: ventas.clienteEmail,
      producto: productos.nombre,
      vendidoEn: ventas.vendidoEn,
      ultimoPagoEn: ventas.ultimoPagoEn,
    })
    .from(ventas)
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .where(eq(ventas.revendedorId, revendedorId))
    .orderBy(sql`${ventas.vendidoEn} desc`);
}

/**
 * Registros (leads) que llegaron con el link del revendedor pero todavía no
 * pagaron nada — señal aparte de `getClientesDelRevendedor` (suscriptos).
 * `yaSuscribio` matchea por email+producto contra `ventas`, mismo criterio
 * best-effort que ya usa el webhook de pago para relacionar ambas señales.
 */
export async function getRegistrosDelRevendedor(revendedorId: string) {
  return db
    .select({
      id: registros.id,
      cliente: registros.clienteNombre,
      clienteEmail: registros.clienteEmail,
      producto: productos.nombre,
      registradoEn: registros.registradoEn,
      yaSuscribio: sql<boolean>`exists (
        select 1 from ${ventas}
        where ${ventas.clienteEmail} = ${registros.clienteEmail}
          and ${ventas.productoId} = ${registros.productoId}
      )`,
    })
    .from(registros)
    .innerJoin(productos, eq(registros.productoId, productos.id))
    .where(eq(registros.revendedorId, revendedorId))
    .orderBy(sql`${registros.registradoEn} desc`);
}

export async function getProductosConHabilitacion(revendedorId: string) {
  const todos = await db.select().from(productos).where(eq(productos.status, "activo"));
  const habilitados = await db
    .select({ productoId: habilitaciones.productoId })
    .from(habilitaciones)
    .where(eq(habilitaciones.revendedorId, revendedorId));

  const habilitadosSet = new Set(habilitados.map((h) => h.productoId));
  return todos.map((p) => ({ ...p, habilitado: habilitadosSet.has(p.id) }));
}

/** Facturas del flujo viejo (legacy) — se muestran read-only en el histórico. */
export async function getFacturasDelRevendedor(revendedorId: string) {
  return db
    .select()
    .from(facturas)
    .where(eq(facturas.revendedorId, revendedorId))
    .orderBy(sql`${facturas.subidaEn} desc`);
}

/**
 * Liquidaciones mensuales del revendedor: las que ya cobró (status "pagada",
 * esperando que suba la factura) y el histórico (status "facturada"/"anulada").
 */
export async function getLiquidacionesDelRevendedor(revendedorId: string) {
  return db
    .select({
      id: liquidaciones.id,
      periodoMes: liquidaciones.periodoMes,
      periodoAnio: liquidaciones.periodoAnio,
      monto: liquidaciones.monto,
      cantidadCuotas: liquidaciones.cantidadCuotas,
      status: liquidaciones.status,
      pagadaEn: liquidaciones.pagadaEn,
      facturaVenceEn: liquidaciones.facturaVenceEn,
      facturaRecibidaEn: liquidaciones.facturaRecibidaEn,
      facturaRechazoMotivo: liquidaciones.facturaRechazoMotivo,
      facturaUrl: liquidaciones.facturaUrl,
      comprobanteUrl: liquidaciones.comprobanteUrl,
    })
    .from(liquidaciones)
    .where(eq(liquidaciones.revendedorId, revendedorId))
    .orderBy(sql`${liquidaciones.pagadaEn} desc`);
}

/**
 * Cuotas que el revendedor ya puede facturar: "generada" (el cliente pagó o
 * renovó). Facturable de inmediato — sin reembolso automático al cancelar
 * (ver CLAUDE.md, "Derecho de arrepentimiento" del lado de agendaonline) no
 * hay riesgo de pagarle comisión al revendedor por una venta que se cae.
 */
export async function getCuotasFacturables(revendedorId: string) {
  return db
    .select({
      id: cuotas.id,
      numeroCuota: cuotas.numeroCuota,
      monto: cuotas.monto,
      periodoMes: cuotas.periodoMes,
      periodoAnio: cuotas.periodoAnio,
      producto: productos.nombre,
      cliente: ventas.clienteNombre,
    })
    .from(cuotas)
    .innerJoin(ventas, eq(cuotas.ventaId, ventas.id))
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .where(and(
      eq(cuotas.revendedorId, revendedorId),
      eq(cuotas.status, "generada"),
    ));
}
