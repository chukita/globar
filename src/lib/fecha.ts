// Helpers de fecha sin librería externa (el repo no usa date-fns / dayjs).
// Módulo puro (sin imports de DB) — se puede usar en client components.

const MES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "septiembre 2026" — a partir de mes 1-12 y año. */
export const periodoLabel = (mes: number, anio: number) => `${MES_ES[mes - 1]} ${anio}`;

/**
 * Suma `n` meses calendario a `date`, con clamp de día de mes: si el día
 * original no existe en el mes destino (31 ene + 1 mes), cae al último día
 * de ese mes (28/29 feb). `n` puede ser negativo.
 */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date.getTime());
  const diaOriginal = d.getDate();
  d.setDate(1);                       // evita el rollover de setMonth
  d.setMonth(d.getMonth() + n);
  const ultimoDiaMesDestino = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(diaOriginal, ultimoDiaMesDestino));
  return d;
}

/**
 * Primer instante del mes de `date` en horario de Argentina (UTC-3, sin DST
 * desde 2009). Se usa como corte "hasta fin del mes anterior": una cuota
 * generada antes de este instante entra en la liquidación de este mes.
 */
export function inicioDeMesArgentina(date: Date): Date {
  // Corremos la fecha a la "pared" argentina restando 3h, tomamos año/mes en
  // UTC, y reconstruimos el 1° a las 00:00 ART = 03:00 UTC.
  const pared = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return new Date(Date.UTC(pared.getUTCFullYear(), pared.getUTCMonth(), 1, 3, 0, 0, 0));
}

/** Mes (1-12) y año calendario del mes anterior al de `date`, en horario Argentina. */
export function mesAnteriorArgentina(date: Date): { mes: number; anio: number } {
  const inicio = inicioDeMesArgentina(date);
  const anterior = addMonths(inicio, -1);
  const pared = new Date(anterior.getTime() - 3 * 60 * 60 * 1000);
  return { mes: pared.getUTCMonth() + 1, anio: pared.getUTCFullYear() };
}
