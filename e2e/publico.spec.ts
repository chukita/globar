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

  test("las páginas de contenido (preguntas, productos y guías) cargan con la comisión vigente", async ({ page, request }) => {
    const { monto, meses } = await configuracion();
    await page.goto("/preguntas");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("revendedor");
    await page.getByText("¿Qué pasa si el cliente arranca con el plan gratis?").click();

    for (const [path, nombre] of [["/revender/agendaonline", "Agenda Online"], ["/revender/nume", "NuMe"]] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(`${ars(monto * meses)} por cada negocio que se suscribe a ${nombre}`);
    }
    expect((await request.get("/revender/otro")).status()).toBe(404);

    await page.goto("/guias");
    await page.getByRole("link", { name: /Cómo ganar plata extra/ }).click();
    await expect(page).toHaveURL(/\/guias\/ganar-plata-extra-recomendando-software$/);
    await expect(page.getByText(`${ars(monto)} por mes durante ${meses} meses`).first()).toBeVisible();

    // Imagen para compartir de 1200×630 en todas las páginas.
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toContain("opengraph-image");
  });

  test("la landing personal del revendedor muestra todos los productos con su código, sin capacitación previa", async ({ page }) => {
    const linksDeProductos = () =>
      page.locator('a[href*="?vendedor="]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));

    const rev = await crearRevendedor();
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
    const mapa = await sitemap.text();
    expect(mapa).toContain("https://glob.ar/revendedores");
    expect(mapa).toContain("https://glob.ar/revender/agendaonline");
    expect(mapa).toContain("https://glob.ar/guias/");

    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    expect(llms.headers()["content-type"]).toContain("text/markdown");
    const { monto } = await configuracion();
    expect(await llms.text()).toContain(ars(monto));

    const full = await request.get("/llms-full.txt");
    expect(full.status()).toBe(200);
    const texto = await full.text();
    expect(texto).toContain("¿glob.ar es confiable?");
    expect(texto).toContain("https://glob.ar/guias/trabajos-sin-inversion-argentina");

    // Clave de IndexNow: la tiene que poder leer Bing en la raíz.
    expect(await (await request.get("/d16b2805f25b9a38065ba66f596f4241.txt")).text()).toBe("d16b2805f25b9a38065ba66f596f4241");
  });
});
