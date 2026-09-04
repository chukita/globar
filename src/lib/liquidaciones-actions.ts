"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users, cuotas, liquidaciones } from "@/db/schema";
import { eq, and, lt, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getConfiguracion } from "@/lib/configuracion";
import { camposFaltantesParaCobrar, periodoLabel } from "@/lib/admin-data";
import { addMonths, inicioDeMesArgentina, mesAnteriorArgentina } from "@/lib/fecha";
import {
  sendEmail,
  notifyAdmins,
  emailLiquidacionPagada,
  emailRecordatorioFacturaPendiente,
  emailFacturaVencidaBloqueo,
  emailAdminResellersBloqueados,
} from "@/lib/email";

async function requireSuperadmin() {
  const session = await auth();
  if (session?.user?.role !== "superadmin") throw new Error("No autorizado");
}

/**
 * Confirma el pago (transferencia manual por Mercado Pago) de todo lo que el
 * revendedor acumuló hasta fin del mes pasado: crea una fila en `liquidaciones`
 * y pasa esas cuotas a "liquidada". El comprobante se sube aparte
 * (POST /api/admin/liquidaciones/[id]/comprobante).
 */
export async function confirmarLiquidacionAction(
  revendedorId: string,
  ahora: Date = new Date(),
): Promise<{ liquidacionId: string } | { nada: true }> {
  await requireSuperadmin();

  const corte = inicioDeMesArgentina(ahora);
  const { mes, anio } = mesAnteriorArgentina(ahora);
  const config = await getConfiguracion();

  return db.transaction(async (tx) => {
    const [rev] = await tx.select().from(revendedores).where(eq(revendedores.id, revendedorId)).limit(1);
    if (!rev) throw new Error("Revendedor no encontrado");

    const cuotasAliquidar = await tx
      .select({ id: cuotas.id, monto: cuotas.monto })
      .from(cuotas)
      .where(and(
        eq(cuotas.revendedorId, revendedorId),
        eq(cuotas.status, "generada"),
        lt(cuotas.generadoEn, corte),
      ));

    if (cuotasAliquidar.length === 0) return { nada: true as const };

    const faltantes = camposFaltantesParaCobrar(rev);
    if (faltantes.length > 0) {
      throw new Error(`No se puede liquidar: al revendedor le falta ${faltantes.join(", ")}.`);
    }

    const [bloqueo] = await tx
      .select({ id: liquidaciones.id })
      .from(liquidaciones)
      .where(and(
        eq(liquidaciones.revendedorId, revendedorId),
        eq(liquidaciones.status, "pagada"),
        lt(liquidaciones.facturaVenceEn, ahora),
      ))
      .limit(1);
    if (bloqueo) {
      throw new Error("No se puede liquidar: el revendedor tiene una factura vencida sin enviar. Se pone al día y recién ahí entra.");
    }

    const [yaLiquidado] = await tx
      .select({ id: liquidaciones.id })
      .from(liquidaciones)
      .where(and(
        eq(liquidaciones.revendedorId, revendedorId),
        eq(liquidaciones.periodoMes, mes),
        eq(liquidaciones.periodoAnio, anio),
      ))
      .limit(1);
    if (yaLiquidado) {
      throw new Error(`Ya se liquidó ${periodoLabel(mes, anio)} para este revendedor.`);
    }

    const monto = cuotasAliquidar.reduce((s, c) => s + Number(c.monto), 0);
    const facturaVenceEn = addMonths(ahora, config.mesesGraciaFactura);

    const [liq] = await tx
      .insert(liquidaciones)
      .values({
        revendedorId,
        periodoMes: mes,
        periodoAnio: anio,
        monto: String(monto),
        cantidadCuotas: cuotasAliquidar.length,
        status: "pagada",
        pagadaEn: ahora,
        facturaVenceEn,
      })
      .returning();

    await tx
      .update(cuotas)
      .set({ status: "liquidada", liquidadoEn: ahora, liquidacionId: liq.id })
      .where(inArray(cuotas.id, cuotasAliquidar.map((c) => c.id)));

    // Aviso al revendedor — best-effort, fuera del critical path del commit no
    // se puede porque estamos en la tx; sendEmail nunca tira, así que es seguro.
    if (rev.notifFacturaPagada) {
      const [u] = await tx.select({ email: users.email, nombre: users.name }).from(users).where(eq(users.id, rev.userId));
      if (u) {
        const { subject, html } = emailLiquidacionPagada(monto, periodoLabel(mes, anio), facturaVenceEn);
        await sendEmail({ to: u.email, toName: u.nombre ?? undefined, subject, html });
      }
    }

    revalidatePath("/admin/liquidaciones");
    revalidatePath("/admin");
    return { liquidacionId: liq.id };
  });
}

/**
 * Recordatorios de factura pendiente. El superadmin lo dispara a mano (una vez
 * por mes, como parte de la rutina de liquidación) — no hay cron. Para una
 * liquidación puntual o para todas las que estén en "pagada" (esperando factura).
 * `ahora` es inyectable para tests.
 */
export async function enviarRecordatoriosLiquidacionAction(
  liquidacionId?: string,
  ahora: Date = new Date(),
): Promise<{ enviados: number; bloqueadosNuevos: number }> {
  await requireSuperadmin();

  const filas = await db
    .select({
      id: liquidaciones.id,
      monto: liquidaciones.monto,
      periodoMes: liquidaciones.periodoMes,
      periodoAnio: liquidaciones.periodoAnio,
      facturaVenceEn: liquidaciones.facturaVenceEn,
      ultimoRecordatorioEn: liquidaciones.ultimoRecordatorioEn,
      codigoVentas: revendedores.codigoVentas,
      email: users.email,
      nombre: users.name,
    })
    .from(liquidaciones)
    .innerJoin(revendedores, eq(liquidaciones.revendedorId, revendedores.id))
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(and(
      eq(liquidaciones.status, "pagada"),
      liquidacionId ? eq(liquidaciones.id, liquidacionId) : undefined,
    ));

  const nuevosBloqueados: { nombre: string; codigo: string; periodoLabel: string; monto: number }[] = [];

  for (const f of filas) {
    const label = periodoLabel(f.periodoMes, f.periodoAnio);
    const monto = Number(f.monto);
    const vencida = f.facturaVenceEn < ahora;
    const cruzaAhora = vencida && (!f.ultimoRecordatorioEn || f.ultimoRecordatorioEn < f.facturaVenceEn);

    const { subject, html } = vencida
      ? emailFacturaVencidaBloqueo(monto, label)
      : emailRecordatorioFacturaPendiente(monto, label, f.facturaVenceEn);
    await sendEmail({ to: f.email, toName: f.nombre ?? undefined, subject, html });

    await db
      .update(liquidaciones)
      .set({
        recordatoriosEnviados: sql`${liquidaciones.recordatoriosEnviados} + 1`,
        ultimoRecordatorioEn: ahora,
      })
      .where(eq(liquidaciones.id, f.id));

    if (cruzaAhora) {
      nuevosBloqueados.push({ nombre: f.nombre ?? f.email, codigo: f.codigoVentas, periodoLabel: label, monto });
    }
  }

  if (nuevosBloqueados.length > 0) {
    const { subject, html } = emailAdminResellersBloqueados(nuevosBloqueados);
    await notifyAdmins(subject, html, "liquidacionBloqueada");
  }

  revalidatePath("/admin/liquidaciones");
  return { enviados: filas.length, bloqueadosNuevos: nuevosBloqueados.length };
}
