/**
 * Rate limiter mínimo en memoria (ventana fija) para los endpoints de
 * registro. Alcanza porque el server corre como un único proceso Node de
 * larga vida en Docker (no serverless) — no hay infraestructura de rate
 * limit compartida en este repo todavía, a diferencia de agendaonline.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
