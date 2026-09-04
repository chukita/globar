export function esDniValido(v: string): boolean {
  return /^\d{7,8}$/.test(v);
}

export function esCbuOAliasValido(v: string): boolean {
  return /^\d{22}$/.test(v) || /^[a-zA-Z0-9.\-]{6,20}$/.test(v);
}

export function esCuitValido(v: string): boolean {
  return /^\d{2}-?\d{8}-?\d{1}$/.test(v);
}

export function normalizarCuit(v: string): string {
  return v.replace(/\D/g, "");
}

export function esEmailValido(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * `v` es "YYYY-MM-DD". Devuelve true solo si es una fecha real, no futura,
 * posterior a 1900 y con 18 años cumplidos a la fecha `ahora`.
 */
export function esMayorDeEdad(v: string, ahora: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const nac = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(nac.getTime())) return false;
  if (nac.getUTCFullYear() < 1900) return false;
  if (nac.getTime() > ahora.getTime()) return false;
  const hace18 = Date.UTC(ahora.getUTCFullYear() - 18, ahora.getUTCMonth(), ahora.getUTCDate());
  return nac.getTime() <= hace18;
}
