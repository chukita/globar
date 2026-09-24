import { expect, test } from "@playwright/test";
import { ars, configuracion, crearRevendedor } from "./helpers";

/**
 * Lo que ve alguien que llega a glob.ar sin cuenta (muchos desde ChatGPT):
 * la propuesta, la comisión real y el camino para registrarse.
 */
test.describe("Sitio público", () => {
  test("la home muestra los productos, la comisión vigente y lleva al registro", async ({ page }) => {
    const { monto, meses } = await configuracion();
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Vendé herramientas digitales");
    await expect(page.getByText("agendaonline").first()).toBeVisible();
    await expect(page.getByText("nume").first()).toBeVisible();
    // Preguntas frecuentes con la comisión real de la configuración.
    await page.getByText("¿Cuánto se gana por cada venta?").click();
    await expect(page.getByText(`${ars(monto)} por mes durante ${meses} meses`).first()).toBeVisible();

    await page.getByRole("link", { name: "Convertite en revendedor" }).click();
    await expect(page).toHaveURL(/\/registro$/);
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeVisible();
  });

  test("la página de requisitos y los legales cargan", async ({ page }) => {
    for (const [path, texto] of [
      ["/revendedores", "Mayor de 18 años"],
      ["/terminos", "Términos"],
      ["/privacidad", "Privacidad"],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.getByText(texto).first()).toBeVisible();
    }
  });

  test("la landing personal del revendedor muestra solo los productos habilitados, con su código", async ({ page }) => {
    const linksDeProductos = () =>
      page.locator('a[href*="?vendedor="]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));

    // Sin la capacitación aprobada, no se le ofrece ningún producto al cliente.
    const nuevo = await crearRevendedor();
    await page.goto(`/r/${nuevo.codigo}`);
    await expect(page.getByText(/glob\.ar/).first()).toBeVisible();
    expect(await linksDeProductos()).toEqual([]);

    const rev = await crearRevendedor({ habilitadoEnTodo: true });
    await page.goto(`/r/${rev.codigo}`);
    const links = await linksDeProductos();
    const conCodigo = `vendedor=${rev.codigo}`;
    expect(links.some((h) => h.includes("agendaonline.com.ar") && h.includes(conCodigo))).toBe(true);
    expect(links.some((h) => h.includes("nume.com.ar") && h.includes(conCodigo))).toBe(true);
  });

  test("robots, sitemap y llms.txt para buscadores y asistentes de IA", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("GPTBot");
    expect(robots).toContain("Sitemap: https://glob.ar/sitemap.xml");
    // Regresión: "Disallow: /r" bloqueaba /revendedores y /registro por prefijo.
    expect(robots).not.toMatch(/^Disallow: \/r$/m);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("https://glob.ar/revendedores");

    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    expect(llms.headers()["content-type"]).toContain("text/markdown");
    const { monto } = await configuracion();
    expect(await llms.text()).toContain(ars(monto));
  });
});
