import { expect, test } from "@playwright/test";
import { arsRe, configuracion, crearRevendedor, db, loginRevendedor, uniq, webhook } from "./helpers";

/**
 * El camino de la plata: agendaonline y nume avisan cuando alguien se registra
 * con el link de un revendedor y cuando paga; glob.ar genera las cuotas de
 * comisión y el revendedor las ve en su panel.
 */
const ahora = new Date();
const periodo = { periodoMes: ahora.getMonth() + 1, periodoAnio: ahora.getFullYear() };

async function cuotasDe(revendedorId: string) {
  const r = await db().query<{ n: string; total: string }>(
    `select count(*) as n, coalesce(sum(c.monto), 0) as total
       from cuotas c join ventas v on v.id = c.venta_id
      where v.revendedor_id = $1`,
    [revendedorId],
  );
  return { n: Number(r.rows[0]!.n), total: Number(r.rows[0]!.total) };
}

test.describe("Registros, pagos y comisiones", () => {
  test("un cliente que se registra y paga con el link aparece en el panel y genera la comisión", async ({ page }) => {
    const rev = await crearRevendedor();
    const { monto } = await configuracion();
    const u = uniq();
    const cliente = { clienteEmail: `cliente-${u}@example.test`, clienteNombre: `Barbería Cliente ${u}` };

    // 1) Se registra con el link (todavía sin pagar): es un lead.
    const reg = await webhook("registro", {
      externoId: `shop-${u}`,
      productoSlug: "agendaonline",
      ...cliente,
      codigoRevendedor: rev.codigo,
    });
    expect(reg.status).toBe(200);

    await loginRevendedor(page, rev.email, rev.password);
    await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 });
    await page.goto("/panel/clientes");
    await expect(page.getByRole("heading", { name: "Mis clientes" })).toBeVisible();
    await page.getByRole("button", { name: /Registrados \(1\)/ }).click();
    await expect(page.getByText(cliente.clienteNombre).first()).toBeVisible();

    // 2) Paga: pasa a suscripto y se genera la primera cuota.
    const pago = await webhook("pago", {
      pagoId: `pago-${u}-1`,
      productoSlug: "agendaonline",
      ...cliente,
      montoAbonado: 6900,
      ...periodo,
      codigoRevendedor: rev.codigo,
    });
    expect(pago.status).toBe(200);
    expect(pago.json.numeroCuota).toBe(1);
    expect(await cuotasDe(rev.revendedorId)).toEqual({ n: 1, total: monto });

    await page.goto("/panel/clientes");
    await page.getByRole("button", { name: /Suscriptos \(1\)/ }).click();
    await expect(page.getByText(cliente.clienteNombre).first()).toBeVisible();

    await page.goto("/panel/comisiones");
    await expect(page.getByRole("heading", { name: "Estado de comisiones" })).toBeVisible();
    await expect(page.getByText("Por liquidar").first()).toBeVisible();
    await expect(page.getByText(arsRe(monto)).first()).toBeVisible();
  });

  test("el mismo pago avisado dos veces no duplica la comisión", async () => {
    const rev = await crearRevendedor();
    const u = uniq();
    const body = {
      pagoId: `pago-${u}`,
      productoSlug: "nume",
      clienteEmail: `cliente-${u}@example.test`,
      clienteNombre: `Resto ${u}`,
      montoAbonado: 6900,
      ...periodo,
      codigoRevendedor: rev.codigo,
    };
    expect((await webhook("pago", body)).status).toBe(200);
    const again = await webhook("pago", body);
    expect(again.status).toBe(200);
    expect(again.json.duplicado).toBe(true);
    expect((await cuotasDe(rev.revendedorId)).n).toBe(1);
  });

  test("las cuotas se cortan al llegar a la cantidad de meses configurada", async () => {
    const rev = await crearRevendedor();
    const { monto, meses } = await configuracion();
    const u = uniq();
    const cliente = { clienteEmail: `cliente-${u}@example.test`, clienteNombre: `Cliente ${u}` };
    for (let i = 0; i < meses + 2; i++) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() + i, 1);
      const r = await webhook("pago", {
        pagoId: `pago-${u}-${i}`,
        productoSlug: "agendaonline",
        ...cliente,
        montoAbonado: 6900,
        periodoMes: d.getMonth() + 1,
        periodoAnio: d.getFullYear(),
        codigoRevendedor: rev.codigo,
      });
      expect(r.status).toBe(200);
    }
    expect(await cuotasDe(rev.revendedorId)).toEqual({ n: meses, total: monto * meses });
  });

  test("los webhooks rechazan secretos inválidos y no pagan comisión a códigos inexistentes", async () => {
    const u = uniq();
    const body = {
      pagoId: `pago-${u}`,
      productoSlug: "agendaonline",
      clienteEmail: `cliente-${u}@example.test`,
      clienteNombre: `Cliente ${u}`,
      montoAbonado: 6900,
      ...periodo,
    };
    expect((await webhook("pago", body, "secreto-equivocado")).status).toBe(401);
    expect((await webhook("registro", { externoId: u, productoSlug: "agendaonline", clienteEmail: "x@example.test", clienteNombre: "X" }, "mal")).status).toBe(401);
    expect((await webhook("pago", { ...body, productoSlug: "no-existe" })).status).toBe(422);

    // Código que no existe: el pago se registra igual, pero sin cuota para nadie.
    const r = await webhook("pago", { ...body, codigoRevendedor: "NOEXISTE999" });
    expect(r.status).toBe(200);
    const cuotas = await db().query(`select 1 from cuotas where pago_externo_id = $1`, [body.pagoId]);
    expect(cuotas.rowCount).toBe(0);
  });
});
