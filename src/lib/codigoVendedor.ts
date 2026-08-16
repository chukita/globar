import crypto from "crypto";
import { db } from "@/db";
import { revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";

function prefijo(nombre: string): string {
  const letras = nombre
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  return (letras || "XXX").slice(0, 3).padEnd(3, "X");
}

function numeroAleatorio(): string {
  return String(crypto.randomInt(0, 1000)).padStart(3, "0");
}

const MAX_INTENTOS = 20;

/**
 * Código de vendedor: 3 primeras letras del nombre + número random de 3
 * cifras (ej. "CAR526" para Carlos Costantino). Se comprueba contra la DB
 * que no exista ya — si colisiona, se prueba con otro número random.
 */
export async function generarCodigoVendedor(nombre: string): Promise<string> {
  const prefix = prefijo(nombre);
  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    const codigo = `${prefix}${numeroAleatorio()}`;
    const [existente] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.codigoVentas, codigo)).limit(1);
    if (!existente) return codigo;
  }
  throw new Error("No se pudo generar un código de vendedor único");
}
