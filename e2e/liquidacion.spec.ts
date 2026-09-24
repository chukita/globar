import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  arsRe,
  configuracion,
  crearRevendedor,
  db,
  loginRevendedor,
  loginSuperadmin,
  uniq,
  webhook,
  type Revendedor,
} from "./helpers";

/**
 * El pago mensual a los revendedores: el superadmin liquida lo acumulado del
 * mes anterior, el revendedor sube su factura y el superadmin la aprueba o la
 * rechaza. Es donde se mueve plata de verdad.
 */
const PDF = {
  name: "factura.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"),
};

/** Revendedor con datos de cobro completos y una cuota del mes anterior. */
async function revendedorConCuotaDelMesPasado(): Promise<Revendedor> {
  const rev = await crearRevendedor();
  await db().query(
    `update revendedores set cbu_alias = 'e2e.alias.mp', titular_nombre = $2, titular_cuit = '20-12345678-3',
            dni = '12345678', provincia = 'Buenos Aires', localidad = 'La Plata', telefono = '1155551234'
      where id = $1`,
    [rev.revendedorId, rev.nombre],
  );
  const u = uniq();
  const pagoId = `pago-liq-${u}`;
  const r = await webhook("pago", {
    pagoId,
    productoSlug: "agendaonline",
    clienteEmail: `cliente-${u}@example.test`,
    clienteNombre: `Cliente ${u}`,
    montoAbonado: 6900,
    periodoMes: new Date().getMonth() + 1,
    periodoAnio: new Date().getFullYear(),
    codigoRevendedor: rev.codigo,
  });
  expect(r.status).toBe(200);
  // Se liquida lo generado hasta fin del mes anterior.
  await db().query(`update cuotas set generado_en = now() - interval '40 days' where pago_externo_id = $1`, [pagoId]);
  return rev;
}

/** Tarjeta de la pantalla de liquidaciones que corresponde a ese revendedor. */
const tarjeta = (page: Page, codigo: string, boton: RegExp) =>
  page.locator("div").filter({ hasText: codigo }).filter({ has: page.getByRole("button", { name: boton }) }).last();

async function estadoLiquidacion(revendedorId: string) {
  const liq = await db().query<{ status: string; comprobante_url: string | null; factura_url: string | null }>(
    `select status, comprobante_url, factura_url from liquidaciones where revendedor_id = $1 order by creado_en desc limit 1`,
    [revendedorId],
  );
  const cuotas = await db().query<{ status: string }>(
    `select distinct status from cuotas where revendedor_id = $1`,
    [revendedorId],
  );
  return { liq: liq.rows[0], cuotas: cuotas.rows.map((r) => r.status) };
}

async function comoRevendedor(browser: Browser, rev: Revendedor): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await loginRevendedor(page, rev.email, rev.password);
  await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 });
  return page;
}

test.describe("Superadmin y liquidaciones", () => {
  test("el superadmin entra con su clave y no con una incorrecta", async ({ page }) => {
    await loginSuperadmin(page, "clave-incorrecta");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText(/incorrect|inválid/i).first()).toBeVisible();

    await loginSuperadmin(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Origen de las altas")).toBeVisible();
  });

  test("liquidación completa: se paga, el revendedor factura y se aprueba", async ({ page, browser }) => {
    const rev = await revendedorConCuotaDelMesPasado();
    const { monto } = await configuracion();

    // 1) El superadmin confirma el pago con el comprobante.
    await loginSuperadmin(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
    await page.goto("/admin/liquidaciones");
    const fila = tarjeta(page, rev.codigo, /Confirmar pago de/);
    await expect(fila.getByText(arsRe(monto)).first()).toBeVisible();
    await fila.locator('input[type="file"]').setInputFiles({ ...PDF, name: "comprobante.pdf" });
    await fila.getByRole("button", { name: /Confirmar pago de/ }).click();
    await expect(page.getByText(`Liquidación de ${rev.codigo} confirmada`)).toBeVisible();

    let estado = await estadoLiquidacion(rev.revendedorId);
    expect(estado.liq?.status).toBe("pagada");
    expect(estado.liq?.comprobante_url).toBeTruthy();
    expect(estado.cuotas).toEqual(["liquidada"]);

    // 2) El revendedor sube su factura por ese monto.
    const revPage = await comoRevendedor(browser, rev);
    await revPage.goto("/panel/facturas");
    await expect(revPage.getByText("Liquidaciones cobradas — falta tu factura")).toBeVisible();
    await revPage.locator('input[type="file"]').first().setInputFiles(PDF);
    await revPage.getByRole("button", { name: "Enviar factura" }).click();
    // La liquidación pasa a "En revisión" (la página se refresca sola).
    await expect(revPage.getByText("La estamos revisando")).toBeVisible();
    expect((await estadoLiquidacion(rev.revendedorId)).liq?.status).toBe("en_revision");

    // 3) El superadmin la aprueba: recién ahí las cuotas quedan pagadas.
    await page.goto("/admin/liquidaciones");
    await tarjeta(page, rev.codigo, /^Aprobar$/).getByRole("button", { name: "Aprobar" }).click();
    await expect.poll(async () => (await estadoLiquidacion(rev.revendedorId)).liq?.status).toBe("facturada");
    estado = await estadoLiquidacion(rev.revendedorId);
    expect(estado.cuotas).toEqual(["pagada"]);
  });

  test("una factura rechazada vuelve al revendedor con el motivo", async ({ page, browser }) => {
    const rev = await revendedorConCuotaDelMesPasado();
    await loginSuperadmin(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
    await page.goto("/admin/liquidaciones");
    await tarjeta(page, rev.codigo, /Confirmar pago de/).getByRole("button", { name: /Confirmar pago de/ }).click();
    await expect(page.getByText(`Liquidación de ${rev.codigo} confirmada`)).toBeVisible();

    const revPage = await comoRevendedor(browser, rev);
    await revPage.goto("/panel/facturas");
    await revPage.locator('input[type="file"]').first().setInputFiles(PDF);
    await revPage.getByRole("button", { name: "Enviar factura" }).click();
    await expect(revPage.getByText("La estamos revisando")).toBeVisible();

    page.once("dialog", (d) => void d.accept("El CUIT del receptor está mal"));
    await page.goto("/admin/liquidaciones");
    await tarjeta(page, rev.codigo, /^Rechazar$/).getByRole("button", { name: "Rechazar" }).click();
    await expect.poll(async () => (await estadoLiquidacion(rev.revendedorId)).liq?.status).toBe("pagada");
    const estado = await estadoLiquidacion(rev.revendedorId);
    expect(estado.liq?.factura_url).toBeNull();
    expect(estado.cuotas).toEqual(["liquidada"]);

    await revPage.goto("/panel/facturas");
    await expect(revPage.getByText("El CUIT del receptor está mal")).toBeVisible();
  });

  test("con una factura anterior sin enviar, el revendedor queda afuera de la liquidación", async ({ page }) => {
    const rev = await revendedorConCuotaDelMesPasado();
    await db().query(
      `insert into liquidaciones (id, revendedor_id, periodo_mes, periodo_anio, monto, cantidad_cuotas, status, factura_vence_en)
       values (gen_random_uuid()::text, $1, 1, 2026, 5000, 1, 'pagada', now() + interval '1 month')`,
      [rev.revendedorId],
    );
    await loginSuperadmin(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 30_000 });
    await page.goto("/admin/liquidaciones");
    // Tarjeta del revendedor en la liquidación del mes: marcada y sin botón de pago.
    // (La liquidación anterior sin factura aparece aparte, en "Esperando factura".)
    const card = page
      .locator('div[class*="rounded-[16px]"]')
      .filter({ hasText: rev.codigo })
      .filter({ hasText: "factura pendiente sin enviar" });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("button", { name: /Confirmar pago de/ })).toHaveCount(0);
  });
});
