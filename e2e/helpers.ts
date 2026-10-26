import { expect, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";
import pg from "pg";
import { E2E_BASE_URL, E2E_SUPERADMIN_PASSWORD, E2E_WEBHOOK_SECRET } from "../playwright.config";

/**
 * Helpers de los E2E de glob.ar. La base es la misma que usa el Next de
 * prueba (ver playwright.config.ts / e2e/prepare-db.mjs); acá se usa solo
 * para preparar estados que por la UI serían lentos o imposibles (un
 * revendedor ya dado de alta, un código de verificación conocido).
 */
let pool: pg.Pool | null = null;
export function db(): pg.Pool {
  pool ??= new pg.Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://globar:globar@localhost:5432/globar_e2e",
    max: 2,
    idleTimeoutMillis: 1_000,
    allowExitOnIdle: true,
  });
  return pool;
}

export const uniq = (): string =>
  `${Date.now().toString(36).slice(-5)}${Math.random().toString(36).slice(2, 5)}`;

export type Revendedor = {
  userId: string;
  revendedorId: string;
  email: string;
  password: string;
  nombre: string;
  codigo: string;
};

/**
 * Revendedor listo para usar el panel: email verificado, fecha de nacimiento,
 * "puede facturar" y onboarding aprobado (lo que deja el alta completa).
 */
export async function crearRevendedor(
  opts: { onboarding?: boolean } = {},
): Promise<Revendedor> {
  const u = uniq();
  const email = `rev-${u}@example.test`;
  const password = "Revendedor-e2e-123";
  const nombre = `Revendedor E2E ${u}`;
  const codigo = `E2E${u.toUpperCase()}`.slice(0, 12);
  const hash = await bcrypt.hash(password, 4);
  const user = await db().query<{ id: string }>(
    `insert into users (id, name, email, password, role, email_verified)
     values (gen_random_uuid()::text, $1, $2, $3, 'revendedor', now()) returning id`,
    [nombre, email, hash],
  );
  const rev = await db().query<{ id: string }>(
    `insert into revendedores (id, user_id, codigo_ventas, fecha_nacimiento, puede_facturar, onboarding_completed_at)
     values (gen_random_uuid()::text, $1, $2, '1990-05-10', true, $3) returning id`,
    [user.rows[0]!.id, codigo, opts.onboarding === false ? null : new Date()],
  );
  return { userId: user.rows[0]!.id, revendedorId: rev.rows[0]!.id, email, password, nombre, codigo };
}

/**
 * Espera a que React tome el formulario de la página. Si se envía antes (en
 * `next dev` la primera compilación tarda), el navegador lo manda como GET
 * nativo (`/registro?`) y el test falla sin que la app tenga ningún bug.
 */
export async function esperarFormularioListo(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const form = document.querySelector("form");
    return !!form && Object.keys(form).some((k) => k.startsWith("__reactProps"));
  });
}

export async function loginRevendedor(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await esperarFormularioListo(page);
  await page.getByPlaceholder("tu@email.com").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

export async function loginSuperadmin(page: Page, password = E2E_SUPERADMIN_PASSWORD): Promise<void> {
  await page.goto("/admin/login");
  await esperarFormularioListo(page);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

/** Llama a un webhook de glob.ar como lo hacen agendaonline y nume. */
export async function webhook(
  path: "registro" | "pago",
  body: Record<string, unknown>,
  secret = E2E_WEBHOOK_SECRET,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${E2E_BASE_URL}/api/webhooks/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-webhook-secret": secret },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

export async function configuracion(): Promise<{ monto: number; meses: number }> {
  const r = await db().query<{ comision_monto: string; comision_meses: number }>(
    `select comision_monto, comision_meses from configuracion where id = 1`,
  );
  // Sin fila todavía: los defaults de la app ($6.000 × 4).
  const row = r.rows[0];
  return { monto: row ? Number(row.comision_monto) : 6000, meses: row ? row.comision_meses : 4 };
}

/** "$5.000" como lo muestra la app (fmtARS). */
export const ars = (n: number): string => "$" + Math.round(n).toLocaleString("es-AR");

export async function esperarPanel(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/panel(\/|$)/, { timeout: 30_000 });
}

/** Monto en cualquiera de los dos formatos que usa la app: "$5.000" o "$ 5.000". */
export const arsRe = (n: number): RegExp => {
  const miles = Math.round(n).toLocaleString("es-AR").replaceAll(".", "\\.");
  return new RegExp(`\\$\\s?${miles}(?!\\d)`);
};
