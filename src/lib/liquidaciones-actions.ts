"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users, cuotas, liquidaciones } from "@/db/schema";
import { eq, and, lt, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getConfiguracion } from "@/lib/configuracion";
import { camposFaltantesParaCobrar, periodoLabel } from "@/lib/admin-data";
import { addMonths, inicioDeMesArgentina, mesAnteriorArgentina } from "@/lib/fecha";
import { procesarRecordatoriosLiquidacion } from "@/lib/recordatorios-liquidacion";
import {
  sendEmail,
  emailLiquidacionPagada,
  emailFacturaLiquidacionAprobada,
  emailFacturaLiquidacionRechazada,
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

    // Bloquea cualquier liquidación vencida cuya factura todavía no esté
    // aprobada: "pagada" (no subió nada) o "en_revision" (subió pero falta
    // aprobarla). Solo una factura aprobada destraba.
    const [bloqueo] = await tx
      .select({ id: liquidaciones.id, status: liquidaciones.status })
      .from(liquidaciones)
      .where(and(
        eq(liquidaciones.revendedorId, revendedorId),
        inArray(liquidaciones.status, ["pagada", "en_revision"]),
        lt(liquidaciones.facturaVenceEn, ahora),
      ))
      .limit(1);
    if (bloqueo) {
      throw new Error(
        bloqueo.status === "en_revision"
          ? "No se puede liquidar: el revendedor tiene una factura vencida esperando tu aprobación. Aprobala o rechazala y recién ahí entra."
          : "No se puede liquidar: el revendedor tiene una factura vencida sin enviar. Se pone al día y recién ahí entra.",
      );
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
 * Recordatorios de factura pendiente disparados a mano por el superadmin desde
 * /admin/liquidaciones (para una liquidación puntual o para todas las que estén
 * en "pagada"). Manda siempre, sin throttle (`forzar: true`) — el envío
 * automático diario lo hace el cron (`POST /api/cron/recordatorios-liquidacion`
 * → `procesarRecordatoriosLiquidacion`). `ahora` es inyectable para tests.
 */
export async function enviarRecordatoriosLiquidacionAction(
  liquidacionId?: string,
  ahora: Date = new Date(),
): Promise<{ enviados: number; bloqueadosNuevos: number }> {
  await requireSuperadmin();

  const res = await procesarRecordatoriosLiquidacion({ ahora, forzar: true, liquidacionId });

  revalidatePath("/admin/liquidaciones");
  return res;
}

/**
 * El superadmin aprueba la factura que subió el revendedor: la liquidación pasa
 * de "en_revision" a "facturada" (terminal) y recién acá sus cuotas pasan a
 * "pagada". Avisa al revendedor.
 */
export async function aprobarFacturaLiquidacionAction(liquidacionId: string): Promise<{ ok: true }> {
  await requireSuperadmin();

  const ahora = new Date();

  const info = await db.transaction(async (tx) => {
    const [liq] = await tx.select().from(liquidaciones).where(eq(liquidaciones.id, liquidacionId)).limit(1);
    if (!liq) throw new Error("Liquidación no encontrada");
    if (liq.status !== "en_revision") {
      throw new Error("Esta liquidación no tiene una factura en revisión.");
    }

    await tx
      .update(liquidaciones)
      .set({ status: "facturada", facturaAprobadaEn: ahora })
      .where(eq(liquidaciones.id, liq.id));

    await tx
      .update(cuotas)
      .set({ status: "pagada", facturadoEn: ahora, pagadoEn: ahora })
      .where(eq(cuotas.liquidacionId, liq.id));

    const [rev] = await tx.select().from(revendedores).where(eq(revendedores.id, liq.revendedorId)).limit(1);
    const [u] = rev
      ? await tx.select({ email: users.email, nombre: users.name }).from(users).where(eq(users.id, rev.userId))
      : [undefined];
    return { liq, notif: rev?.notifFacturaPagada ?? false, u };
  });

  if (info.notif && info.u) {
    const { subject, html } = emailFacturaLiquidacionAprobada(
      periodoLabel(info.liq.periodoMes, info.liq.periodoAnio),
      Number(info.liq.monto),
    );
    await sendEmail({ to: info.u.email, toName: info.u.nombre ?? undefined, subject, html });
  }

  revalidatePath("/admin/liquidaciones");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * El superadmin rechaza la factura que subió el revendedor: la liquidación
 * vuelve a "pagada" (el revendedor tiene que subir una nueva), se limpia el
 * PDF cargado y se guarda el motivo. El plazo de vencimiento no se mueve.
 * Avisa al revendedor con el motivo.
 */
export async function rechazarFacturaLiquidacionAction(
  liquidacionId: string,
  motivo: string,
): Promise<{ ok: true }> {
  await requireSuperadmin();

  const motivoLimpio = motivo.trim();
  if (motivoLimpio.length < 3) {
    throw new Error("Escribí un motivo del rechazo — se le muestra al revendedor.");
  }

  const ahora = new Date();

  const [liq] = await db.select().from(liquidaciones).where(eq(liquidaciones.id, liquidacionId)).limit(1);
  if (!liq) throw new Error("Liquidación no encontrada");
  if (liq.status !== "en_revision") {
    throw new Error("Esta liquidación no tiene una factura en revisión.");
  }

  await db
    .update(liquidaciones)
    .set({
      status: "pagada",
      facturaUrl: null,
      facturaRecibidaEn: null,
      facturaRechazadaEn: ahora,
      facturaRechazoMotivo: motivoLimpio,
    })
    .where(eq(liquidaciones.id, liq.id));

  const [rev] = await db.select().from(revendedores).where(eq(revendedores.id, liq.revendedorId)).limit(1);
  if (rev?.notifFacturaPagada) {
    const [u] = await db.select({ email: users.email, nombre: users.name }).from(users).where(eq(users.id, rev.userId));
    if (u) {
      const { subject, html } = emailFacturaLiquidacionRechazada(
        periodoLabel(liq.periodoMes, liq.periodoAnio),
        Number(liq.monto),
        motivoLimpio,
      );
      await sendEmail({ to: u.email, toName: u.nombre ?? undefined, subject, html });
    }
  }

  revalidatePath("/admin/liquidaciones");
  revalidatePath("/admin");
  return { ok: true };
}
