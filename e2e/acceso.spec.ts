import { expect, test } from "@playwright/test";
import { crearRevendedor, db, loginRevendedor } from "./helpers";

/**
 * Quién puede entrar a dónde. Un error acá expone datos de otros revendedores
 * o el panel de pagos.
 */
test.describe("Acceso y permisos", () => {
  test("sin sesión, el panel y el admin mandan al login correspondiente", async ({ page }) => {
    await page.goto("/panel/comisiones");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/admin/liquidaciones");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("contraseña incorrecta no entra y no revela si el email existe", async ({ page }) => {
    const rev = await crearRevendedor();
    await loginRevendedor(page, rev.email, "clave-equivocada");
    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    // Un email que no existe da exactamente el mismo mensaje.
    await loginRevendedor(page, "nadie-e2e@example.test", "clave-equivocada");
    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
  });

  test("una cuenta con el email sin verificar no puede entrar", async ({ page }) => {
    const rev = await crearRevendedor();
    await db().query(`update users set email_verified = null where id = $1`, [rev.userId]);
    await loginRevendedor(page, rev.email, rev.password);
    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("un revendedor no puede entrar al panel de administración", async ({ page }) => {
    const rev = await crearRevendedor();
    await loginRevendedor(page, rev.email, rev.password);
    await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 });
    await page.goto("/admin/liquidaciones");
    await expect(page).toHaveURL(/\/panel\/comisiones$/);
    await expect(page.getByRole("heading", { name: "Estado de comisiones" })).toBeVisible();
  });

  test("una cuenta desactivada no accede al panel", async ({ page }) => {
    const rev = await crearRevendedor();
    await db().query(`update revendedores set activo = false where id = $1`, [rev.revendedorId]);
    await loginRevendedor(page, rev.email, rev.password);
    // Esperar a que el login termine (sale de /login) antes de navegar.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
    await page.goto("/panel/comisiones");
    await expect(page).toHaveURL(/\/panel\/cuenta-desactivada$/);
  });

  test("sin onboarding ni capacitación aprobados, igual accede al panel y a sus links", async ({ page }) => {
    const rev = await crearRevendedor({ onboarding: false });
    await loginRevendedor(page, rev.email, rev.password);
    // Esperar a que el login termine (sale de /login) antes de navegar.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
    await page.goto("/panel/productos");
    await expect(page).toHaveURL(/\/panel\/productos$/);
    await expect(page.getByText(`?vendedor=${rev.codigo}`, { exact: false }).first()).toBeVisible();
  });
});
