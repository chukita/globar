import { db } from "@/db";
import { sql } from "drizzle-orm";

function iniciales(nombre: string): string {
  const palabras = nombre
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase();
  }
  return (palabras[0] ?? "XX").slice(0, 2).toUpperCase().padEnd(2, "X");
}

/**
 * Código de vendedor: iniciales del nombre + número de secuencia único (ej.
 * "CC608" para Carlos Costantino). La secuencia (`revendedor_codigo_seq`,
 * ver drizzle/0003_revendedor_codigo_seq.sql, arranca en 600) es la fuente
 * de unicidad: como el número nunca se repite, el código completo tampoco
 * puede colisionar aunque dos vendedores compartan iniciales.
 */
export async function generarCodigoVendedor(nombre: string): Promise<string> {
  const result = await db.execute<{ n: string }>(sql`select nextval('revendedor_codigo_seq')::text as n`);
  return `${iniciales(nombre)}${result.rows[0].n}`;
}
