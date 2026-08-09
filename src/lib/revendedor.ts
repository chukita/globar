import { db } from "@/db";
import { revendedores } from "@/db/schema";
import { eq } from "drizzle-orm";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I para evitar confusión

function randomSuffix(len = 4) {
  return Array.from({ length: len }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

function baseCode(name: string | null | undefined, email: string) {
  const source = (name || email.split("@")[0]).replace(/[^a-zA-Z]/g, "").toUpperCase();
  return "GLOB" + (source.slice(0, 4) || "USER");
}

/** Devuelve la fila `revendedores` del usuario, creándola si es la primera vez que se loguea. */
export async function ensureRevendedor(userId: string, name: string | null | undefined, email: string) {
  const [existing] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  if (existing) return existing;

  const base = baseCode(name, email);
  for (let i = 0; i < 5; i++) {
    // onConflictDoNothing (sin target) cubre tanto una colisión de código como una
    // carrera con otro request concurrente que ya insertó la fila para este userId
    // (userId también es unique) — en ambos casos el insert no-opea en vez de tirar.
    const [created] = await db
      .insert(revendedores)
      .values({ userId, codigoVentas: `${base}-${randomSuffix()}` })
      .onConflictDoNothing()
      .returning();
    if (created) return created;

    const [race] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
    if (race) return race;
    // si no hay fila para este userId todavía, fue colisión de código — reintentar
  }
  throw new Error("No se pudo generar un código de ventas único");
}

export async function getRevendedorByUserId(userId: string) {
  const [r] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  return r ?? null;
}
