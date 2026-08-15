import { createHmac, timingSafeEqual } from "crypto";

/**
 * Token de un solo uso para que el superadmin entre al panel de un
 * revendedor puntual sin conocer su contraseña. No es un JWT — HMAC simple
 * sobre "userId.expiración" firmado con AUTH_SECRET, vencimiento corto
 * (60s), consumido una única vez por el provider "impersonate" de
 * NextAuth (ver auth.ts). No hace falta una librería de JWT para esto.
 */

const TTL_MS = 60_000;

export function signImpersonationToken(userId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", process.env.AUTH_SECRET!).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`, "utf8").toString("base64url");
}

export function verifyImpersonationToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, expStr, sig] = decoded.split(".");
    if (!userId || !expStr || !sig) return null;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;

    const expected = createHmac("sha256", process.env.AUTH_SECRET!).update(`${userId}.${expStr}`).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

    return userId;
  } catch {
    return null;
  }
}
