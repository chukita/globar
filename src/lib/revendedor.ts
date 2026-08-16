import { db } from "@/db";
import { revendedores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generarCodigoVendedor } from "./codigoVendedor";

/** Devuelve la fila `revendedores` del usuario, creándola si es la primera vez que se loguea. */
export async function ensureRevendedor(userId: string) {
  const [existing] = await db.select().from(revendedores).where(eq(revendedores.userId, userId)).limit(1);
  if (existing) return existing;

  // El código sale de generarCodigoVendedor() (3 letras del nombre + número
  // random, comprobando que no exista). onConflictDoNothing cubre la carrera
  // con otro request concurrente que ya insertó la fila para este userId
  // (userId también es unique).
  const [user] = await db.select({ name: users.name, emailVerified: users.emailVerified }).from(users).where(eq(users.id, userId)).limit(1);
  const codigoVentas = await generarCodigoVendedor(user?.name ?? "Revendedor");

  // Google ya confirmó el email — no depender de que el adapter de NextAuth
  // lo setee solo, marcarlo acá explícitamente.
  if (user && !user.emailVerified) {
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, userId));
  }

  const [created] = await db
    .insert(revendedores)
    .values({ userId, codigoVentas })
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
