// Prepara la base de los E2E antes de levantar Next: la crea si no existe,
// corre las migraciones y siembra los productos (agendaonline, nume).
// Es una base aparte (`globar_e2e` por defecto) para no ensuciar la de dev.
import { execSync } from "node:child_process";
import pg from "pg";

export const E2E_DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://globar:globar@localhost:5432/globar_e2e";

async function ensureDatabase() {
  const url = new URL(E2E_DATABASE_URL);
  const dbName = url.pathname.slice(1);
  url.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    const r = await admin.query("select 1 from pg_database where datname = $1", [dbName]);
    if (r.rowCount === 0) await admin.query(`create database "${dbName.replace(/"/g, "")}"`);
  } finally {
    await admin.end();
  }
}

await ensureDatabase();
const env = { ...process.env, DATABASE_URL: E2E_DATABASE_URL };
execSync("npx drizzle-kit migrate", { stdio: "inherit", env });
execSync("npx tsx scripts/seed-productos.ts", { stdio: "inherit", env });
