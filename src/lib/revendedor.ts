import { db } from "@/db";
import { revendedores } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/** Devuelve la fila `revendedores` del usuario, creándola si es la primera vez que se loguea. */
export async function ensureRevendedor(userId: string) {
  const [existing] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  if (existing) return existing;

  // El código sale de una secuencia de Postgres (única por diseño, arranca en
  // 600 — ver drizzle/0003_revendedor_codigo_seq.sql). onConflictDoNothing
  // cubre únicamente la carrera con otro request concurrente que ya insertó
  // la fila para este userId (userId también es unique); el código en sí
  // nunca puede colisionar.
  const [created] = await db
    .insert(revendedores)
    .values({ userId, codigoVentas: sql`nextval('revendedor_codigo_seq')::text` })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [race] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  if (race) return race;
  throw new Error("No se pudo crear el revendedor");
}

export async function getRevendedorByUserId(userId: string) {
  const [r] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  return r ?? null;
}
