import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/db";
import { verificacionesEmail, users } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

const CODIGO_TTL_MS = 15 * 60 * 1000;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_INTENTOS = 6;

export function generarCodigo(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function generarToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Crea (o reemplaza, en un "reenviar") la verificación pendiente de un
 * usuario: código de 6 dígitos (vence en 15 min) + token de link (vence en
 * 24 h), ambos hasheados. Devuelve los valores en texto plano para mandarlos
 * por mail — nunca se guardan así.
 */
export async function crearVerificacion(userId: string): Promise<{ codigo: string; token: string }> {
  // token_expira_en siempre es posterior a codigo_expira_en (24h vs 15min),
  // así que barrer por ese campo alcanza para purgar filas ya totalmente vencidas.
  await db.delete(verificacionesEmail).where(lt(verificacionesEmail.tokenExpiraEn, new Date()));

  const codigo = generarCodigo();
  const token = generarToken();
  const [codigoHash, tokenHash] = await Promise.all([bcrypt.hash(codigo, 10), bcrypt.hash(token, 10)]);
  const codigoExpiraEn = new Date(Date.now() + CODIGO_TTL_MS);
  const tokenExpiraEn = new Date(Date.now() + TOKEN_TTL_MS);

  await db
    .insert(verificacionesEmail)
    .values({ userId, codigoHash, codigoExpiraEn, tokenHash, tokenExpiraEn })
    .onConflictDoUpdate({
      target: verificacionesEmail.userId,
      set: { codigoHash, codigoExpiraEn, tokenHash, tokenExpiraEn, intentos: 0, creadoEn: new Date() },
    });

  return { codigo, token };
}

/** Fecha de creación de la verificación pendiente de un usuario, si hay una. Para el cooldown de "reenviar". */
export async function fechaUltimaVerificacion(userId: string): Promise<Date | null> {
  const [row] = await db
    .select({ creadoEn: verificacionesEmail.creadoEn })
    .from(verificacionesEmail)
    .where(eq(verificacionesEmail.userId, userId))
    .limit(1);
  return row?.creadoEn ?? null;
}

type ValidacionResultado = { ok: true; userId: string } | { ok: false; error: string };

/** Verifica el código de 6 dígitos para un email. Bloquea la fila mientras valida (evita carreras entre intentos concurrentes). */
export async function validarCodigo(email: string, codigo: string): Promise<ValidacionResultado> {
  const emailNorm = email.toLowerCase().trim();
  const codigoLimpio = codigo.trim();
  if (!/^\d{6}$/.test(codigoLimpio)) {
    return { ok: false, error: "El código debe tener 6 dígitos." };
  }

  return db.transaction(async (tx) => {
    const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.email, emailNorm)).limit(1);
    if (!user) return { ok: false, error: "No encontramos una cuenta con ese email." };

    const [row] = await tx
      .select()
      .from(verificacionesEmail)
      .where(eq(verificacionesEmail.userId, user.id))
      .for("update");

    if (!row) {
      return { ok: false, error: "No hay una verificación pendiente para este email. Pedí un código nuevo." };
    }

    if (row.intentos >= MAX_INTENTOS) {
      await tx.delete(verificacionesEmail).where(eq(verificacionesEmail.id, row.id));
      return { ok: false, error: "Demasiados intentos incorrectos. Pedí un código nuevo." };
    }

    if (new Date() > row.codigoExpiraEn) {
      await tx.delete(verificacionesEmail).where(eq(verificacionesEmail.id, row.id));
      return { ok: false, error: "El código venció. Pedí uno nuevo." };
    }

    const okHash = await bcrypt.compare(codigoLimpio, row.codigoHash);
    if (!okHash) {
      await tx.update(verificacionesEmail).set({ intentos: row.intentos + 1 }).where(eq(verificacionesEmail.id, row.id));
      return { ok: false, error: "Código incorrecto." };
    }

    await tx.delete(verificacionesEmail).where(eq(verificacionesEmail.id, row.id));
    return { ok: true, userId: user.id };
  });
}

/** Verifica el token del link del mail (no se sabe a priori de qué usuario es — hay que escanear). */
export async function validarToken(token: string): Promise<ValidacionResultado> {
  return db.transaction(async (tx) => {
    const filas = await tx.select().from(verificacionesEmail);
    for (const row of filas) {
      if (new Date() > row.tokenExpiraEn) continue;
      if (!(await bcrypt.compare(token, row.tokenHash))) continue;
      await tx.delete(verificacionesEmail).where(eq(verificacionesEmail.id, row.id));
      return { ok: true, userId: row.userId };
    }
    return { ok: false, error: "El enlace es inválido o venció." };
  });
}

export async function marcarEmailVerificado(userId: string): Promise<void> {
  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, userId));
}
