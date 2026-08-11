import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/db/schema";

// Reemplaza a "@/db" durante los tests (ver el alias en vitest.config.ts) por una
// instancia de Postgres en memoria (PGlite), para no depender de un Postgres real
// ni de Docker corriendo. Vive fuera de src/db/ para que quede claro que nunca se
// importa desde código de producción.
export const client = new PGlite();
export const db = drizzle(client, { schema });
