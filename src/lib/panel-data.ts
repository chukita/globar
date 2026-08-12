import { db } from "@/db";
import { cuotas, ventas, productos, habilitaciones, facturas } from "@/db/schema";
import { eq, and, inArray, lte, sql } from "drizzle-orm";
import { getConfiguracion } from "./configuracion";

export async function getRevendedorStats(revendedorId: string) {
  const [ventasCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ventas)
    .where(eq(ventas.revendedorId, revendedorId));

  const [cobradas] = await db
    .select({ total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(and(eq(cuotas.revendedorId, revendedorId), eq(cuotas.status, "pagada")));

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

export async function getVentasDelRevendedor(revendedorId: string) {
  const filas = await db
    .select({
      id: ventas.id,
      cliente: ventas.clienteNombre,
      producto: productos.nombre,
      vendidoEn: ventas.vendidoEn,
      activa: ventas.activa,
    })
    .from(ventas)
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .where(eq(ventas.revendedorId, revendedorId))
    .orderBy(sql`${ventas.vendidoEn} desc`);

  const cuotasPorVenta = await db
    .select({ ventaId: cuotas.ventaId, count: sql<number>`count(*)::int` })
    .from(cuotas)
    .where(eq(cuotas.revendedorId, revendedorId))
    .groupBy(cuotas.ventaId);

  const cuotasMap = new Map(cuotasPorVenta.map((c) => [c.ventaId, c.count]));

  return filas.map((v) => ({ ...v, cuotasGeneradas: cuotasMap.get(v.id) ?? 0 }));
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

export async function getFacturasDelRevendedor(revendedorId: string) {
  return db
    .select()
    .from(facturas)
    .where(eq(facturas.revendedorId, revendedorId))
    .orderBy(sql`${facturas.subidaEn} desc`);
}

/**
 * Cuotas que el revendedor ya puede facturar: "generada" (el cliente pagó)
 * Y con al menos `diasLiquidacionMp` días desde ese pago — antes de eso
 * Mercado Pago todavía no le liquidó esa plata al superadmin, así que no
 * hay con qué pagarle la comisión todavía aunque la cuota ya exista.
 */
export async function getCuotasFacturables(revendedorId: string) {
  const { diasLiquidacionMp } = await getConfiguracion();
  const fechaCorte = new Date(Date.now() - diasLiquidacionMp * 24 * 60 * 60 * 1000);

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
      lte(cuotas.generadoEn, fechaCorte),
    ));
}
