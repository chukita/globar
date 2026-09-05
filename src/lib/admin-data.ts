import { db } from "@/db";
import { revendedores, users, productos, habilitaciones, ventas, cuotas, liquidaciones, contactos } from "@/db/schema";
import { eq, and, lt, inArray, sql, desc, asc } from "drizzle-orm";
import { inicioDeMesArgentina, mesAnteriorArgentina, periodoLabel } from "@/lib/fecha";

export { periodoLabel };

// Campos que un revendedor tiene que tener cargados para entrar en la liquidación
// mensual. Lo que falte → se lo excluye y se le avisa.
export function camposFaltantesParaCobrar(r: {
  puedeFacturar: boolean | null;
  cbuAlias: string | null;
  titularNombre: string | null;
  titularCuit: string | null;
  dni: string | null;
  fechaNacimiento: string | null;
  provincia: string | null;
  localidad: string | null;
  telefono: string | null;
  activo: boolean | null;
}): string[] {
  const faltan: string[] = [];
  if (!r.activo) faltan.push("cuenta desactivada");
  if (!r.puedeFacturar) faltan.push("no confirmó que puede facturar");
  if (!r.cbuAlias) faltan.push("CBU/alias");
  if (!r.titularNombre) faltan.push("titular de la cuenta");
  if (!r.titularCuit) faltan.push("CUIT/CUIL");
  if (!r.dni) faltan.push("DNI");
  if (!r.fechaNacimiento) faltan.push("fecha de nacimiento");
  if (!r.provincia) faltan.push("provincia");
  if (!r.localidad) faltan.push("localidad");
  if (!r.telefono) faltan.push("teléfono");
  return faltan;
}

export async function getDashboardStats() {
  const [ventasCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ventas);
  const [revendedoresActivos] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(revendedores)
    .where(eq(revendedores.activo, true));
  const [liquidado] = await db
    .select({ total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(inArray(cuotas.status, ["liquidada", "pagada"]));
  const [facturasPendientes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(liquidaciones)
    .where(inArray(liquidaciones.status, ["pagada", "en_revision"]));

  return {
    ventasTotales: ventasCount?.count ?? 0,
    revendedoresActivos: revendedoresActivos?.count ?? 0,
    comisionesLiquidadas: Number(liquidado?.total ?? 0),
    facturasPendientes: facturasPendientes?.count ?? 0,
  };
}

/** Liquidaciones ya pagadas que todavía esperan la factura del revendedor (para el dashboard). */
export async function getLiquidacionesEsperandoFacturaResumen(limit = 5) {
  return db
    .select({
      id: liquidaciones.id,
      monto: liquidaciones.monto,
      periodoMes: liquidaciones.periodoMes,
      periodoAnio: liquidaciones.periodoAnio,
      pagadaEn: liquidaciones.pagadaEn,
      facturaVenceEn: liquidaciones.facturaVenceEn,
      status: liquidaciones.status,
      revendedor: revendedores.codigoVentas,
      revendedorNombre: users.name,
    })
    .from(liquidaciones)
    .innerJoin(revendedores, eq(liquidaciones.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(inArray(liquidaciones.status, ["pagada", "en_revision"]))
    .orderBy(asc(liquidaciones.facturaVenceEn))
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

// ─── Liquidaciones mensuales ──────────────────────────────────────────────────

const CAMPOS_COBRO_REVENDEDOR = {
  puedeFacturar: revendedores.puedeFacturar,
  cbuAlias: revendedores.cbuAlias,
  titularNombre: revendedores.titularNombre,
  titularCuit: revendedores.titularCuit,
  dni: revendedores.dni,
  fechaNacimiento: revendedores.fechaNacimiento,
  provincia: revendedores.provincia,
  localidad: revendedores.localidad,
  telefono: revendedores.telefono,
  activo: revendedores.activo,
} as const;

/**
 * Preview de la liquidación del mes: un renglón por revendedor con ≥1 cuota
 * "generada" acumulada hasta fin del mes pasado (por `generadoEn`, no por el
 * período de suscripción del cliente). Marca elegibilidad y bloqueo.
 */
export async function getPreviewLiquidacionMesAnterior(ahora = new Date()) {
  const corte = inicioDeMesArgentina(ahora);
  const { mes, anio } = mesAnteriorArgentina(ahora);

  const filas = await db
    .select({
      revendedorId: cuotas.revendedorId,
      codigoVentas: revendedores.codigoVentas,
      nombre: users.name,
      email: users.email,
      cantidadCuotas: sql<number>`count(*)::int`,
      monto: sql<string>`coalesce(sum(${cuotas.monto}), 0)`,
      ...CAMPOS_COBRO_REVENDEDOR,
    })
    .from(cuotas)
    .innerJoin(revendedores, eq(cuotas.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(and(eq(cuotas.status, "generada"), lt(cuotas.generadoEn, corte)))
    .groupBy(cuotas.revendedorId, revendedores.id, users.id);

  // Bloqueados: tienen al menos una liquidación vencida cuya factura todavía no
  // está aprobada — "pagada" (no subió nada) o "en_revision" (subió, falta
  // aprobarla). Solo una factura aprobada ("facturada") destraba.
  const bloqueados = await db
    .select({ revendedorId: liquidaciones.revendedorId, status: liquidaciones.status })
    .from(liquidaciones)
    .where(and(
      inArray(liquidaciones.status, ["pagada", "en_revision"]),
      lt(liquidaciones.facturaVenceEn, ahora),
    ))
    .groupBy(liquidaciones.revendedorId, liquidaciones.status);
  // revendedorId → true si el bloqueo es por una factura en revisión sin aprobar
  // (aunque tenga también una "pagada" vencida, priorizamos avisar que hay algo
  // para revisar).
  const bloqueoRevisionSet = new Set(
    bloqueados.filter((b) => b.status === "en_revision").map((b) => b.revendedorId),
  );
  const bloqueadosSet = new Set(bloqueados.map((b) => b.revendedorId));

  return {
    periodoMes: mes,
    periodoAnio: anio,
    filas: filas.map((f) => {
      const faltantes = camposFaltantesParaCobrar(f);
      const bloqueado = bloqueadosSet.has(f.revendedorId);
      return {
        revendedorId: f.revendedorId,
        codigoVentas: f.codigoVentas,
        nombre: f.nombre,
        email: f.email,
        cantidadCuotas: f.cantidadCuotas,
        monto: Number(f.monto),
        cbuAlias: f.cbuAlias,
        titularNombre: f.titularNombre,
        titularCuit: f.titularCuit,
        camposFaltantes: faltantes,
        bloqueado,
        bloqueoMotivo: bloqueado
          ? (bloqueoRevisionSet.has(f.revendedorId) ? "factura en revisión sin aprobar" : "factura vencida sin enviar")
          : null,
        incluible: faltantes.length === 0 && !bloqueado,
      };
    }),
  };
}

export async function getLiquidacionesEsperandoFactura(ahora = new Date()) {
  const filas = await db
    .select({
      id: liquidaciones.id,
      monto: liquidaciones.monto,
      periodoMes: liquidaciones.periodoMes,
      periodoAnio: liquidaciones.periodoAnio,
      pagadaEn: liquidaciones.pagadaEn,
      facturaVenceEn: liquidaciones.facturaVenceEn,
      cantidadCuotas: liquidaciones.cantidadCuotas,
      status: liquidaciones.status,
      comprobanteUrl: liquidaciones.comprobanteUrl,
      facturaUrl: liquidaciones.facturaUrl,
      facturaRecibidaEn: liquidaciones.facturaRecibidaEn,
      facturaRechazadaEn: liquidaciones.facturaRechazadaEn,
      recordatoriosEnviados: liquidaciones.recordatoriosEnviados,
      ultimoRecordatorioEn: liquidaciones.ultimoRecordatorioEn,
      revendedor: revendedores.codigoVentas,
      revendedorNombre: users.name,
    })
    .from(liquidaciones)
    .innerJoin(revendedores, eq(liquidaciones.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(inArray(liquidaciones.status, ["pagada", "en_revision"]))
    .orderBy(asc(liquidaciones.facturaVenceEn));

  return filas.map((f) => ({ ...f, vencida: f.facturaVenceEn < ahora }));
}

export async function getHistorialLiquidaciones() {
  return db
    .select({
      id: liquidaciones.id,
      monto: liquidaciones.monto,
      periodoMes: liquidaciones.periodoMes,
      periodoAnio: liquidaciones.periodoAnio,
      pagadaEn: liquidaciones.pagadaEn,
      facturaRecibidaEn: liquidaciones.facturaRecibidaEn,
      facturaUrl: liquidaciones.facturaUrl,
      comprobanteUrl: liquidaciones.comprobanteUrl,
      cantidadCuotas: liquidaciones.cantidadCuotas,
      status: liquidaciones.status,
      revendedor: revendedores.codigoVentas,
      revendedorNombre: users.name,
    })
    .from(liquidaciones)
    .innerJoin(revendedores, eq(liquidaciones.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(inArray(liquidaciones.status, ["facturada", "anulada"]))
    .orderBy(desc(liquidaciones.pagadaEn));
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
    .where(inArray(cuotas.status, ["liquidada", "pagada"]))
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

export async function getContactos() {
  return db.select().from(contactos).orderBy(desc(contactos.creadoEn));
}

export async function getRevendedorDetalle(id: string) {
  const [rev] = await db
    .select({
      id: revendedores.id,
      codigoVentas: revendedores.codigoVentas,
      zona: revendedores.zona,
      pais: revendedores.pais,
      provincia: revendedores.provincia,
      localidad: revendedores.localidad,
      dni: revendedores.dni,
      fechaNacimiento: revendedores.fechaNacimiento,
      telefono: revendedores.telefono,
      puedeFacturar: revendedores.puedeFacturar,
      cbuAlias: revendedores.cbuAlias,
      titularNombre: revendedores.titularNombre,
      titularCuit: revendedores.titularCuit,
      activo: revendedores.activo,
      creadoEn: revendedores.creadoEn,
      nombre: users.name,
      email: users.email,
    })
    .from(revendedores)
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(eq(revendedores.id, id))
    .limit(1);

  if (!rev) return null;

  const [ventasCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ventas)
    .where(eq(ventas.revendedorId, id));

  const [cobrado] = await db
    .select({ total: sql<string>`coalesce(sum(${cuotas.monto}), 0)` })
    .from(cuotas)
    .where(and(eq(cuotas.revendedorId, id), inArray(cuotas.status, ["liquidada", "pagada"])));

  const todosProductos = await db.select().from(productos).where(eq(productos.status, "activo"));
  const habilitacionesDelRevendedor = await db
    .select({ productoId: habilitaciones.productoId })
    .from(habilitaciones)
    .where(eq(habilitaciones.revendedorId, id));
  const habilitadosSet = new Set(habilitacionesDelRevendedor.map((h) => h.productoId));

  return {
    ...rev,
    ventas: ventasCount?.count ?? 0,
    ingreso: Number(cobrado?.total ?? 0),
    productos: todosProductos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      habilitado: habilitadosSet.has(p.id),
    })),
  };
}
