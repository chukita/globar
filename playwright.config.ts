import { defineConfig, devices } from "@playwright/test";
import bcrypt from "bcryptjs";

/**
 * E2E de glob.ar. Levanta Next en :3100 contra una base propia (`globar_e2e`,
 * ver e2e/prepare-db.mjs), así no se pisa con el `next dev` del día a día ni
 * con su base.
 *
 * - CI: `next build` + `next start` (lo mismo que corre en producción).
 * - Local: `next dev` con su propio distDir (`.next-e2e`) para poder correr
 *   los tests con el dev server normal levantado al mismo tiempo.
 */
export const E2E_PORT = 3100;
// localhost y no 127.0.0.1: `next dev` bloquea sus recursos de desarrollo a
// orígenes que no reconoce, y la página no llegaba a hidratarse.
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;
export const E2E_SUPERADMIN_PASSWORD = "e2e-superadmin-pass";
export const E2E_WEBHOOK_SECRET = "e2e-webhook-secret";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://globar:globar@localhost:5432/globar_e2e";

const serverCommand = process.env.CI
  ? `node e2e/prepare-db.mjs && npx next build && npx next start -p ${E2E_PORT}`
  : `node e2e/prepare-db.mjs && npx next dev -p ${E2E_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  // `next dev` compila cada ruta la primera vez que se pide: margen para eso.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
    timezoneId: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: serverCommand,
    url: `${E2E_BASE_URL}/api/auth/providers`,
    reuseExistingServer: process.env.PW_TEST_REUSE_SERVER === "1",
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      DATABASE_URL,
      NEXT_DIST_DIR: process.env.CI ? ".next" : ".next-e2e",
      // Local: con NODE_ENV=test Next NO carga `.env.local`. Si lo carga, además
      // de mezclar credenciales reales, expande los `$` de las variables ya
      // definidas y el hash bcrypt del superadmin ($2a$...) llega vacío. En CI
      // no hay archivos .env y se usa el modo normal.
      ...(process.env.CI ? {} : { NODE_ENV: "test" }),
      AUTH_URL: E2E_BASE_URL,
      AUTH_TRUST_HOST: "true",
      AUTH_SECRET: "e2e-auth-secret-no-usar-en-produccion-0123456789",
      SUPERADMIN_PASSWORD_HASH: bcrypt.hashSync(E2E_SUPERADMIN_PASSWORD, 4),
      WEBHOOK_SECRET: E2E_WEBHOOK_SECRET,
      CRON_SECRET: "e2e-cron-secret",
      GOOGLE_CLIENT_ID: "e2e-google-client-id",
      GOOGLE_CLIENT_SECRET: "e2e-google-client-secret",
      // Vacía a propósito: sin clave, sendEmail no manda nada (y el .env.local
      // no la puede pisar porque Next no sobreescribe variables ya definidas).
      BREVO_API_KEY: "",
      UPLOAD_DIR: ".e2e-uploads",
    },
  },
});
