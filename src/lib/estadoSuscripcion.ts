export const DIAS_SUSCRIPCION_VENCIDA = 35;

/**
 * `true` si `ultimoPagoEn` está dentro de los DIAS_SUSCRIPCION_VENCIDA días
 * desde `ahora` — el ciclo de facturación es mensual (~30 días), el margen
 * es para no marcar en falso a alguien a quien todavía no le tocó pagar.
 * No es un dato real de la suscripción (no hay webhook de baja) — es una
 * inferencia a partir del último pago que sabemos que llegó.
 */
export function esSuscripcionActiva(ultimoPagoEn: Date, ahora: Date = new Date()): boolean {
  const elapsedMs = ahora.getTime() - ultimoPagoEn.getTime();
  return elapsedMs <= DIAS_SUSCRIPCION_VENCIDA * 24 * 60 * 60 * 1000;
}
