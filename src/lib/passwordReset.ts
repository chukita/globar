import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/db";
import { resetsPassword, users } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 h
const PASSWORD_MIN = 8;

export function generarTokenReset(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Crea (o reemplaza, en un nuevo pedido) el reseteo pendiente de un usuario:
 * un token de link que vence en 1 h, guardado hasheado. Devuelve el token en
 * texto plano para armar el link del mail — nunca se guarda así.
 */
export async function crearResetPassword(userId: string): Promise<string> {
  await db.delete(resetsPassword).where(lt(resetsPassword.expiraEn, new Date()));

  const token = generarTokenReset();
  const tokenHash = await bcrypt.hash(token, 10);
  const expiraEn = new Date(Date.now() + TOKEN_TTL_MS);

  await db
    .insert(resetsPassword)
    .values({ userId, tokenHash, expiraEn })
    .onConflictDoUpdate({
      target: resetsPassword.userId,
      set: { tokenHash, expiraEn, creadoEn: new Date() },
    });

  return token;
}

type ResetResultado = { ok: true } | { ok: false; error: string };

/**
 * Consume el token del link y setea la contraseña nueva. El token no dice de
 * qué usuario es, así que hay que escanear las filas vigentes. Al primer match
 * válido: hashea la clave nueva, la guarda, marca el email como verificado (el
 * usuario probó que controla la casilla) y borra el pedido.
 */
export async function resetearPasswordConToken(token: string, passwordNueva: string): Promise<ResetResultado> {
  if (typeof passwordNueva !== "string" || passwordNueva.length < PASSWORD_MIN) {
    return { ok: false, error: `La contraseña tiene que tener al menos ${PASSWORD_MIN} caracteres.` };
  }

  return db.transaction(async (tx) => {
    const filas = await tx.select().from(resetsPassword);
    for (const row of filas) {
      if (new Date() > row.expiraEn) continue;
      if (!(await bcrypt.compare(token, row.tokenHash))) continue;

      const hash = await bcrypt.hash(passwordNueva, 10);
      await tx.update(users).set({ password: hash, emailVerified: new Date() }).where(eq(users.id, row.userId));
      await tx.delete(resetsPassword).where(eq(resetsPassword.id, row.id));
      return { ok: true };
    }
    return { ok: false, error: "El enlace es inválido o venció. Pedí uno nuevo." };
  });
}
