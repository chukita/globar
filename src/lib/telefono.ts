/**
 * Arma un link de wa.me a partir de un teléfono argentino ingresado en
 * formato libre (ej. "11 2345-6789"). WhatsApp espera el número sin
 * espacios/guiones, con código de país 54 y el 9 de celular argentino
 * delante — si el usuario ya cargó el 54 (o el 549) lo respetamos tal cual.
 */
export function waLink(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  const conCodigo = digits.startsWith("54") ? digits : `549${digits}`;
  return `https://wa.me/${conCodigo}`;
}
