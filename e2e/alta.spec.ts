import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";
import { db, esperarFormularioListo, esperarPanel, uniq } from "./helpers";

/**
 * Alta completa de un revendedor por email, como la hace una persona:
 * registro → código por mail → panel con su código (sin capacitación obligatoria)
 * → links de todos los productos listos para compartir.
 */

test("un revendedor se registra por email, verifica y ya puede compartir sus links", async ({ page }) => {
  const u = uniq();
  const email = `alta-${u}@example.test`;

  // Primera visita desde ChatGPT: queda como origen del alta.
  await page.goto("/?utm_source=chatgpt.com");
  // La cookie de origen la deja un efecto del cliente al hidratar la home.
  await expect
    .poll(async () => (await page.context().cookies()).some((c) => c.name === "globar_ft"))
    .toBe(true);
  await page.goto("/registro");
  await esperarFormularioListo(page);
  await page.getByPlaceholder("Martina Quiroga").fill(`Alta E2E ${u}`);
  await page.getByPlaceholder("tu@email.com").fill(email);
  await page.getByPlaceholder("Mínimo 8 caracteres").fill("Alta-e2e-12345");
  await page.locator('input[type="date"]').fill("1992-03-15");
  const checks = page.locator('input[type="checkbox"]');
  await checks.nth(0).check();
  await checks.nth(1).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/registro\/verificar/);

  // El código real viaja por mail: en la base se reemplaza por uno conocido.
  const user = await db().query<{ id: string }>(`select id from users where email = $1`, [email]);
  expect(user.rowCount).toBe(1);
  await db().query(`update verificaciones_email set codigo_hash = $2 where user_id = $1`, [
    user.rows[0]!.id,
    await bcrypt.hash("246810", 4),
  ]);

  await esperarFormularioListo(page);
  await page.getByPlaceholder("123456").fill("246810");
  await page.getByRole("button", { name: "Confirmar" }).click();

  // Sin capacitación obligatoria: entra directo al panel.
  await esperarPanel(page);
  await expect(page).not.toHaveURL(/\/panel\/onboarding/);

  // En el panel ve su código de ventas.
  const rev = await db().query<{ codigo_ventas: string; signup_source: { utmSource?: string } | null }>(
    `select codigo_ventas, signup_source from revendedores where user_id = $1`,
    [user.rows[0]!.id],
  );
  const codigo = rev.rows[0]!.codigo_ventas;
  await page.goto("/panel/productos");
  await expect(page.getByText(codigo).first()).toBeVisible();
  // Todos los productos con su link, sin aprobar ninguna capacitación.
  await expect(page.getByText(`?vendedor=${codigo}`, { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Pendiente de activar")).toHaveCount(0);

  // Y el alta quedó atribuida a ChatGPT.
  expect(rev.rows[0]!.signup_source?.utmSource).toBe("chatgpt.com");
});
