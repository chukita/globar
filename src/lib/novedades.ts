/**
 * Aviso del aumento de comisión de oct. 2026 ($5.000 → $6.000 por mes).
 * Se muestra en el panel del revendedor (NovedadComisionBanner) y como badge
 * en la home hasta esta fecha; después desaparece solo y se puede borrar
 * este módulo junto con sus usos.
 */
export const NOVEDAD_COMISION_HASTA = new Date("2026-12-01T03:00:00Z"); // 1/12 00:00 hora argentina

export function mostrarNovedadComision(ahora = new Date()): boolean {
  return ahora < NOVEDAD_COMISION_HASTA;
}
