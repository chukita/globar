import { createHmac, timingSafeEqual } from "crypto";

/**
 * Token de un solo uso para iniciar sesión como un usuario puntual sin
 * conocer su contraseña. No es un JWT — HMAC simple sobre
 * "purpose.userId.expiración" firmado con AUTH_SECRET, vencimiento corto
 * (60s). El `purpose` evita que un token emitido para un caso (ej. "acabás
 * de verificar tu email") sirva para otro (ej. impersonación de superadmin).
 *
 * Dos usos hoy, cada uno con su Credentials provider en auth.ts:
 * - "impersonate": emitido por `impersonarRevendedorAction` (protegida con
 *   requireSuperadmin) para que el superadmin entre al panel de un
 *   revendedor puntual.
 * - "email-verificado": emitido por `POST /api/registro/verificar` tras
 *   confirmar el código o el link del mail, para loguear al revendedor sin
 *   pedirle la contraseña de nuevo (el browser no la retiene entre el paso
 *   1 del registro y la pantalla de verificación).
 */

const TTL_MS = 60_000;

function signOneTimeToken(purpose: string, userId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${purpose}.${userId}.${exp}`;
  const sig = createHmac("sha256", process.env.AUTH_SECRET!).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`, "utf8").toString("base64url");
}

function verifyOneTimeToken(purpose: string, token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [tokenPurpose, userId, expStr, sig] = decoded.split(".");
    if (tokenPurpose !== purpose || !userId || !expStr || !sig) return null;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;

    const expected = createHmac("sha256", process.env.AUTH_SECRET!).update(`${tokenPurpose}.${userId}.${expStr}`).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

    return userId;
  } catch {
    return null;
  }
}

export function signImpersonationToken(userId: string): string {
  return signOneTimeToken("impersonate", userId);
}

export function verifyImpersonationToken(token: string): string | null {
  return verifyOneTimeToken("impersonate", token);
}

export function signEmailVerificadoToken(userId: string): string {
  return signOneTimeToken("email-verificado", userId);
}

export function verifyEmailVerificadoToken(token: string): string | null {
  return verifyOneTimeToken("email-verificado", token);
}
