import { db } from "@/db";
import { revendedores, users, liquidaciones } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  sendEmail,
  notifyAdmins,
  emailRecordatorioFacturaPendiente,
  emailFacturaVencidaBloqueo,
  emailAdminResellersBloqueados,
} from "@/lib/email";
import { periodoLabel } from "@/lib/fecha";

/**
 * Cuántos días antes del vencimiento de la factura sale el recordatorio "suave"
 * automático. El aviso de bloqueo sale el día del vencimiento (o el primer día
 * que corra el cron después). No está en `configuracion` a propósito: es una
 * regla de tono, no de negocio — el plazo real lo fija `mesesGraciaFactura`.
 */
export const RECORDATORIO_SUAVE_DIAS_ANTES = 30;

const DIA_MS = 24 * 60 * 60 * 1000;

type Etapa = "suave" | "bloqueo" | "skip";

/**
 * Decide qué recordatorio (si alguno) corresponde para una liquidación en estado
 * `pagada` que todavía espera factura.
 *
 * - `forzar` (disparo manual del superadmin): manda siempre, sin throttle —
 *   preserva el comportamiento histórico del botón de /admin/liquidaciones.
 * - automático (cron diario): manda el suave una sola vez dentro de la ventana
 *   previa al vencimiento, y el de bloqueo una sola vez al vencer.
 */
function decidirEtapa(
  fila: { facturaVenceEn: Date; recordatoriosEnviados: number; ultimoRecordatorioEn: Date | null },
  ahora: Date,
  forzar: boolean,
): Etapa {
  const vencida = fila.facturaVenceEn < ahora;

  if (forzar) return vencida ? "bloqueo" : "suave";

  const yaAvisoBloqueo =
    fila.ultimoRecordatorioEn !== null && fila.ultimoRecordatorioEn >= fila.facturaVenceEn;

  if (vencida) return yaAvisoBloqueo ? "skip" : "bloqueo";

  const diasHastaVencimiento = (fila.facturaVenceEn.getTime() - ahora.getTime()) / DIA_MS;
  if (fila.recordatoriosEnviados === 0 && diasHastaVencimiento <= RECORDATORIO_SUAVE_DIAS_ANTES) {
    return "suave";
  }
  return "skip";
}

/**
 * Procesa los recordatorios de factura pendiente de todas las liquidaciones
 * `pagada` (o una puntual si se pasa `liquidacionId`). Módulo puro reusable:
 * lo llama la server action del superadmin (`forzar: true`) y el endpoint de
 * cron diario (`forzar: false`). `ahora` es inyectable para tests.
 */
export async function procesarRecordatoriosLiquidacion(opts: {
  ahora?: Date;
  forzar?: boolean;
  liquidacionId?: string;
} = {}): Promise<{ enviados: number; bloqueadosNuevos: number }> {
  const { ahora = new Date(), forzar = false, liquidacionId } = opts;

  const filas = await db
    .select({
      id: liquidaciones.id,
      monto: liquidaciones.monto,
      periodoMes: liquidaciones.periodoMes,
      periodoAnio: liquidaciones.periodoAnio,
      facturaVenceEn: liquidaciones.facturaVenceEn,
      recordatoriosEnviados: liquidaciones.recordatoriosEnviados,
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
  let enviados = 0;

  for (const f of filas) {
    const etapa = decidirEtapa(f, ahora, forzar);
    if (etapa === "skip") continue;

    const label = periodoLabel(f.periodoMes, f.periodoAnio);
    const monto = Number(f.monto);

    // Se avisa al admin solo cuando esta liquidación cruza a "vencida" por
    // primera vez (no en cada corrida del cron ni en cada forzado posterior).
    const cruzaAhora =
      etapa === "bloqueo" &&
      (!f.ultimoRecordatorioEn || f.ultimoRecordatorioEn < f.facturaVenceEn);

    const { subject, html } = etapa === "bloqueo"
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

    enviados++;
    if (cruzaAhora) {
      nuevosBloqueados.push({ nombre: f.nombre ?? f.email, codigo: f.codigoVentas, periodoLabel: label, monto });
    }
  }

  if (nuevosBloqueados.length > 0) {
    const { subject, html } = emailAdminResellersBloqueados(nuevosBloqueados);
    await notifyAdmins(subject, html, "liquidacionBloqueada");
  }

  return { enviados, bloqueadosNuevos: nuevosBloqueados.length };
}
