import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
import path from "path";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { updateConfiguracion } from "@/lib/configuracion";
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
  it("no incluye una cuota generada hace menos de diasLiquidacionMp días", async () => {
    const { rev, venta } = await seedRevendedorConVenta();
    const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await seedCuotaGenerada(rev.id, venta.id, hace3Dias);

    const disponibles = await getCuotasFacturables(rev.id);
    expect(disponibles).toHaveLength(0);
  });

  it("incluye una cuota generada hace más de diasLiquidacionMp días", async () => {
    const { rev, venta } = await seedRevendedorConVenta();
    const hace15Dias = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    await seedCuotaGenerada(rev.id, venta.id, hace15Dias);

    const disponibles = await getCuotasFacturables(rev.id);
    expect(disponibles).toHaveLength(1);
  });

  it("respeta el valor configurado de diasLiquidacionMp, no un default hardcodeado", async () => {
    await updateConfiguracion({ comisionMonto: 5000, comisionMeses: 4, diasLiquidacionMp: 5 });
    const { rev, venta } = await seedRevendedorConVenta();
    const hace10Dias = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await seedCuotaGenerada(rev.id, venta.id, hace10Dias);

    // Con la ventana bajada a 5 días, una cuota de hace 10 días ya está disponible.
    const disponibles = await getCuotasFacturables(rev.id);
    expect(disponibles).toHaveLength(1);
  });
});
