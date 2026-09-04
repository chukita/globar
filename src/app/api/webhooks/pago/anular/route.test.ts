import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import path from "path";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { POST } from "./route";

const SECRET = "test-webhook-secret";
process.env.WEBHOOK_SECRET = SECRET;

beforeAll(async () => {
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
});

beforeEach(async () => {
  await db.execute(sql`
    TRUNCATE TABLE cuotas_facturas, facturas, cuotas, liquidaciones, habilitaciones, ventas,
      revendedores, productos, configuracion, users
    RESTART IDENTITY CASCADE
  `);
});

async function seedCuota(status: typeof schema.cuotas.$inferInsert["status"], pagoExternoId: string) {
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
  const [cuota] = await db
    .insert(schema.cuotas)
    .values({
      ventaId: venta.id,
      revendedorId: rev.id,
      numeroCuota: 1,
      monto: "5000",
      periodoMes: 8,
      periodoAnio: 2026,
      status,
      pagoExternoId,
    })
    .returning();
  return cuota;
}

function anularRequest(body: unknown, headers: Record<string, string> = { "x-webhook-secret": SECRET }) {
  return new NextRequest("http://localhost/api/webhooks/pago/anular", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/webhooks/pago/anular", () => {
  it("rechaza sin el secret", async () => {
    const res = await POST(anularRequest({ pagoId: "x" }, {}));
    expect(res.status).toBe(401);
  });

  it("rechaza sin pagoId", async () => {
    const res = await POST(anularRequest({}));
    expect(res.status).toBe(400);
  });

  it("responde ok, anulada:false si no existe una cuota con ese pagoId", async () => {
    const res = await POST(anularRequest({ pagoId: "no-existe" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.anulada).toBe(false);
  });

  it("anula la cuota si sigue en generada", async () => {
    const cuota = await seedCuota("generada", "pago-1");
    const res = await POST(anularRequest({ pagoId: "pago-1" }));
    const data = await res.json();

    expect(data.anulada).toBe(true);

    const [actualizada] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuota.id));
    expect(actualizada.status).toBe("anulada");
    expect(actualizada.anuladoEn).not.toBeNull();
  });

  it("no toca la cuota si ya fue facturada", async () => {
    const cuota = await seedCuota("facturada", "pago-2");
    const res = await POST(anularRequest({ pagoId: "pago-2" }));
    const data = await res.json();

    expect(data.anulada).toBe(false);

    const [sinCambios] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuota.id));
    expect(sinCambios.status).toBe("facturada");
  });

  it("no toca la cuota si ya fue pagada", async () => {
    const cuota = await seedCuota("pagada", "pago-3");
    const res = await POST(anularRequest({ pagoId: "pago-3" }));
    const data = await res.json();

    expect(data.anulada).toBe(false);

    const [sinCambios] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuota.id));
    expect(sinCambios.status).toBe("pagada");
  });

  it("es idempotente: llamarlo dos veces no rompe", async () => {
    await seedCuota("generada", "pago-4");
    await POST(anularRequest({ pagoId: "pago-4" }));
    const res2 = await POST(anularRequest({ pagoId: "pago-4" }));
    const data2 = await res2.json();

    // la segunda vez la cuota ya está "anulada" (no "generada"), así que no se vuelve a tocar
    expect(res2.status).toBe(200);
    expect(data2.anulada).toBe(false);
  });
});
