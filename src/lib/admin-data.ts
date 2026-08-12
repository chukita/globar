import { db } from "@/db";
import { revendedores, users, productos, habilitaciones, ventas, cuotas, facturas, cuotasFacturas } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getDashboardStats() {
  const [ventasCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ventas);
  const [revendedoresActivos] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(revendedores)
    .where(eq(revendedores.activo, true));
  const [pagadas] = await db
    .select({ total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(eq(cuotas.status, "pagada"));
  const [facturasPendientes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(facturas)
    .where(eq(facturas.pagada, false));

  return {
    ventasTotales: ventasCount?.count ?? 0,
    revendedoresActivos: revendedoresActivos?.count ?? 0,
    comisionesPagadas: Number(pagadas?.total ?? 0),
    facturasPendientes: facturasPendientes?.count ?? 0,
  };
}

export async function getFacturasPendientesResumen(limit = 5) {
  return db
    .select({
      id: facturas.id,
      monto: facturas.monto,
      nota: facturas.nota,
      subidaEn: facturas.subidaEn,
      revendedor: revendedores.codigoVentas,
      revendedorNombre: users.name,
    })
    .from(facturas)
    .innerJoin(revendedores, eq(facturas.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(eq(facturas.pagada, false))
    .orderBy(desc(facturas.subidaEn))
    .limit(limit);
}

export async function getUltimasVentas(limit = 5) {
  return db
    .select({
      id: ventas.id,
      cliente: ventas.clienteNombre,
      producto: productos.nombre,
      revendedor: revendedores.codigoVentas,
      fecha: ventas.vendidoEn,
      ultimoPagoEn: ventas.ultimoPagoEn,
    })
    .from(ventas)
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .leftJoin(revendedores, eq(ventas.revendedorId, revendedores.id))
    .orderBy(desc(ventas.vendidoEn))
    .limit(limit);
}

export async function getTodasLasVentas() {
  return db
    .select({
      id: ventas.id,
      cliente: ventas.clienteNombre,
      clienteEmail: ventas.clienteEmail,
      producto: productos.nombre,
      revendedor: revendedores.codigoVentas,
      fecha: ventas.vendidoEn,
      precioMensual: ventas.precioMensual,
      ultimoPagoEn: ventas.ultimoPagoEn,
    })
    .from(ventas)
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .leftJoin(revendedores, eq(ventas.revendedorId, revendedores.id))
    .orderBy(desc(ventas.vendidoEn));
}

export async function getTodasLasComisiones() {
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
      revendedor: revendedores.codigoVentas,
    })
    .from(cuotas)
    .innerJoin(ventas, eq(cuotas.ventaId, ventas.id))
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .innerJoin(revendedores, eq(cuotas.revendedorId, revendedores.id))
    .orderBy(desc(cuotas.periodoAnio), desc(cuotas.periodoMes));
}

export async function getTodasLasFacturas() {
  const filas = await db
    .select({
      id: facturas.id,
      monto: facturas.monto,
      nota: facturas.nota,
      archivoUrl: facturas.archivoUrl,
      pagada: facturas.pagada,
      subidaEn: facturas.subidaEn,
      pagadaEn: facturas.pagadaEn,
      revendedor: revendedores.codigoVentas,
      revendedorNombre: users.name,
    })
    .from(facturas)
    .innerJoin(revendedores, eq(facturas.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .orderBy(desc(facturas.subidaEn));

  const cuotasPorFactura = await db
    .select({ facturaId: cuotasFacturas.facturaId, count: sql<number>`count(*)::int` })
    .from(cuotasFacturas)
    .groupBy(cuotasFacturas.facturaId);
  const cuotasMap = new Map(cuotasPorFactura.map((c) => [c.facturaId, c.count]));

  return filas.map((f) => ({ ...f, cuotas: cuotasMap.get(f.id) ?? 0 }));
}

export async function getTodosLosRevendedores() {
  const filas = await db
    .select({
      id: revendedores.id,
      codigoVentas: revendedores.codigoVentas,
      zona: revendedores.zona,
      activo: revendedores.activo,
      creadoEn: revendedores.creadoEn,
      nombre: users.name,
      email: users.email,
    })
    .from(revendedores)
    .innerJoin(users, eq(revendedores.userId, users.id))
    .orderBy(desc(revendedores.creadoEn));

  const ventasPorRevendedor = await db
    .select({ revendedorId: ventas.revendedorId, count: sql<number>`count(*)::int` })
    .from(ventas)
    .groupBy(ventas.revendedorId);
  const ventasMap = new Map(ventasPorRevendedor.map((v) => [v.revendedorId, v.count]));

  const cobradoPorRevendedor = await db
    .select({ revendedorId: cuotas.revendedorId, total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(eq(cuotas.status, "pagada"))
    .groupBy(cuotas.revendedorId);
  const cobradoMap = new Map(cobradoPorRevendedor.map((c) => [c.revendedorId, Number(c.total)]));

  const todosProductos = await db.select().from(productos).where(eq(productos.status, "activo"));
  const todasHabilitaciones = await db.select().from(habilitaciones);
  const habilitacionesPorRevendedor = new Map<string, Set<string>>();
  for (const h of todasHabilitaciones) {
    if (!habilitacionesPorRevendedor.has(h.revendedorId)) habilitacionesPorRevendedor.set(h.revendedorId, new Set());
    habilitacionesPorRevendedor.get(h.revendedorId)!.add(h.productoId);
  }

  return filas.map((r) => ({
    ...r,
    ventas: ventasMap.get(r.id) ?? 0,
    ingreso: cobradoMap.get(r.id) ?? 0,
    productos: todosProductos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      habilitado: habilitacionesPorRevendedor.get(r.id)?.has(p.id) ?? false,
    })),
  }));
}
