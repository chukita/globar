import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import path from "path";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { getCuotasFacturables } from "./panel-data";

beforeAll(async () => {
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
});

beforeEach(async () => {
  await db.execute(sql`
    TRUNCATE TABLE cuotas_facturas, facturas, cuotas, habilitaciones, ventas,
      revendedores, productos, configuracion, users
    RESTART IDENTITY CASCADE
  `);
});

async function seedRevendedorConVenta() {
  const userId = crypto.randomUUID();
  await db.insert(schema.users).values({ id: userId, email: `${userId}@test.com`, role: "revendedor" });
  const [rev] = await db
    .insert(schema.revendedores)
    .values({ userId, codigoVentas: `TEST-${Math.random().toString(36).slice(2, 7).toUpperCase()}` })
    .returning();
  const [producto] = await db
    .insert(schema.productos)
    .values({
      nombre: "agendaonline",
      dominio: "agendaonline.com.ar",
      urlRegistro: "https://agendaonline.com.ar/register",
      tag: "Turnos",
      precioMensual: "9000",
    })
    .returning();
  const [venta] = await db
    .insert(schema.ventas)
    .values({ revendedorId: rev.id, productoId: producto.id, clienteNombre: "Cliente", precioMensual: "9000" })
    .returning();
  return { rev, venta };
}

async function seedCuotaGenerada(revendedorId: string, ventaId: string, generadoEn: Date, numeroCuota = 1) {
  await db.insert(schema.cuotas).values({
    ventaId,
    revendedorId,
    numeroCuota,
    monto: "5000",
    periodoMes: 8,
    periodoAnio: 2026,
    status: "generada",
    generadoEn,
    pagoExternoId: `pago-${crypto.randomUUID()}`,
  });
}

describe("getCuotasFacturables", () => {
  it("incluye una cuota 'generada' apenas se genera, sin esperar", async () => {
    const { rev, venta } = await seedRevendedorConVenta();
    await seedCuotaGenerada(rev.id, venta.id, new Date());

    const disponibles = await getCuotasFacturables(rev.id);
    expect(disponibles).toHaveLength(1);
  });

  it("incluye una cuota 'generada' aunque sea muy vieja (no hay ventana de espera)", async () => {
    const { rev, venta } = await seedRevendedorConVenta();
    const hace6Meses = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    await seedCuotaGenerada(rev.id, venta.id, hace6Meses);

    const disponibles = await getCuotasFacturables(rev.id);
    expect(disponibles).toHaveLength(1);
  });

  it("no incluye cuotas en otro estado (pendiente, facturada, pagada, anulada)", async () => {
    const { rev, venta } = await seedRevendedorConVenta();
    for (const status of ["pendiente", "facturada", "pagada", "anulada"] as const) {
      await db.insert(schema.cuotas).values({
        ventaId: venta.id,
        revendedorId: rev.id,
        numeroCuota: 1,
        monto: "5000",
        periodoMes: 8,
        periodoAnio: 2026,
        status,
        pagoExternoId: `pago-${crypto.randomUUID()}`,
      });
    }

    const disponibles = await getCuotasFacturables(rev.id);
    expect(disponibles).toHaveLength(0);
  });
});
