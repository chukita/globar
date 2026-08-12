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
