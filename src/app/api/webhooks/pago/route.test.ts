import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { sql, eq } from "drizzle-orm";
import path from "path";

// "@/db" resuelve a src/test/db.ts (Postgres en memoria) via vitest.config.ts
import { db } from "@/db";
import * as schema from "@/db/schema";
import { updateConfiguracion } from "@/lib/configuracion";
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

async function seedProducto(overrides: Partial<typeof schema.productos.$inferInsert> = {}) {
  const [p] = await db
    .insert(schema.productos)
    .values({
      nombre: "agendaonline",
      dominio: "agendaonline.com.ar",
      urlRegistro: "https://agendaonline.com.ar/register",
      tag: "Turnos & reservas",
      precioMensual: "9000",
      ...overrides,
    })
    .returning();
  return p;
}

async function seedRevendedor(overrides: Partial<typeof schema.revendedores.$inferInsert> = {}) {
  const userId = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: userId,
    email: `${userId}@test.com`,
    role: "revendedor",
  });
  const [r] = await db
    .insert(schema.revendedores)
    .values({
      userId,
      codigoVentas: `TEST-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      activo: true,
      ...overrides,
    })
    .returning();
  return r;
}

function pagoRequest(body: unknown, headers: Record<string, string> = { "x-webhook-secret": SECRET }) {
  return new NextRequest("http://localhost/api/webhooks/pago", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const basePayload = {
  pagoId: "PAGO-1",
  productoSlug: "agendaonline",
  clienteEmail: "cliente@test.com",
  clienteNombre: "Cliente de prueba",
  montoAbonado: 9000,
  periodoMes: 7,
  periodoAnio: 2026,
};

describe("POST /api/webhooks/pago", () => {
  it("rechaza sin el header x-webhook-secret", async () => {
    const res = await POST(pagoRequest(basePayload, {}));
    expect(res.status).toBe(401);
  });

  it("rechaza con un secret incorrecto", async () => {
    const res = await POST(pagoRequest(basePayload, { "x-webhook-secret": "otro-secret" }));
    expect(res.status).toBe(401);
  });

  it("rechaza JSON inválido", async () => {
    const res = await POST(pagoRequest("no-es-json"));
    expect(res.status).toBe(400);
  });

  it("rechaza si faltan campos requeridos", async () => {
    const incompleto: Record<string, unknown> = { ...basePayload };
    delete incompleto.pagoId;
    const res = await POST(pagoRequest(incompleto));
    expect(res.status).toBe(400);
  });

  it("responde 422 si el producto no está registrado en glob.ar", async () => {
    const res = await POST(pagoRequest(basePayload));
    expect(res.status).toBe(422);
  });

  it("registra el pago sin comisión si no viene código de revendedor", async () => {
    await seedProducto();

    const res = await POST(pagoRequest(basePayload));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comision).toBe(false);
    expect(data.ventaId).toBeDefined();

    const [venta] = await db.select().from(schema.ventas).where(eq(schema.ventas.id, data.ventaId));
    expect(venta.revendedorId).toBeNull();

    const cuotasCreadas = await db.select().from(schema.cuotas);
    expect(cuotasCreadas).toHaveLength(0);
  });

  it("registra el pago sin comisión si el código de revendedor no existe", async () => {
    await seedProducto();

    const res = await POST(pagoRequest({ ...basePayload, codigoRevendedor: "NO-EXISTE" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comision).toBe(false);
  });

  it("registra el pago sin comisión si el revendedor está inactivo", async () => {
    await seedProducto();
    const rev = await seedRevendedor({ activo: false });

    const res = await POST(pagoRequest({ ...basePayload, codigoRevendedor: rev.codigoVentas }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comision).toBe(false);
  });

  it("genera la primera cuota de comisión con un código de revendedor válido", async () => {
    await seedProducto();
    const rev = await seedRevendedor();

    const res = await POST(pagoRequest({ ...basePayload, codigoRevendedor: rev.codigoVentas }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comision).toBe(true);
    expect(data.numeroCuota).toBe(1);

    const [cuota] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, data.cuotaId));
    expect(cuota.status).toBe("generada");
    expect(cuota.revendedorId).toBe(rev.id);
    // El monto de la cuota sale de la configuración vigente, no del montoAbonado del payload.
    expect(Number(cuota.monto)).toBe(5000);
  });

  it("es idempotente: reenviar el mismo pagoId no crea una segunda cuota", async () => {
    await seedProducto();
    const rev = await seedRevendedor();
    const payload = { ...basePayload, codigoRevendedor: rev.codigoVentas };

    await POST(pagoRequest(payload));
    const res2 = await POST(pagoRequest(payload));
    const data2 = await res2.json();

    expect(data2.duplicado).toBe(true);

    const cuotasCreadas = await db.select().from(schema.cuotas);
    expect(cuotasCreadas).toHaveLength(1);
  });

  it("reutiliza la misma venta y suma cuotas en pagos sucesivos del mismo cliente", async () => {
    await seedProducto();
    const rev = await seedRevendedor();

    const res1 = await POST(pagoRequest({ ...basePayload, codigoRevendedor: rev.codigoVentas }));
    const data1 = await res1.json();

    const res2 = await POST(pagoRequest({
      ...basePayload,
      pagoId: "PAGO-2",
      periodoMes: 8,
      codigoRevendedor: rev.codigoVentas,
    }));
    const data2 = await res2.json();

    expect(data2.ventaId).toBe(data1.ventaId);
    expect(data2.numeroCuota).toBe(2);

    const ventas = await db.select().from(schema.ventas);
    expect(ventas).toHaveLength(1);
  });

  it("deja de generar cuotas al alcanzar el tope de comisionMeses configurado", async () => {
    await updateConfiguracion({ comisionMonto: 5000, comisionMeses: 2 });
    await seedProducto();
    const rev = await seedRevendedor();
    const payload = { ...basePayload, codigoRevendedor: rev.codigoVentas };

    await POST(pagoRequest({ ...payload, pagoId: "PAGO-1", periodoMes: 1 }));
    await POST(pagoRequest({ ...payload, pagoId: "PAGO-2", periodoMes: 2 }));
    const res3 = await POST(pagoRequest({ ...payload, pagoId: "PAGO-3", periodoMes: 3 }));
    const data3 = await res3.json();

    expect(data3.comision).toBe(false);

    const cuotasCreadas = await db.select().from(schema.cuotas);
    expect(cuotasCreadas).toHaveLength(2);
  });

  it("actualiza ultimoPagoEn en pagos sucesivos", async () => {
    await seedProducto();
    const rev = await seedRevendedor();
    const payload = { ...basePayload, codigoRevendedor: rev.codigoVentas };

    const res1 = await POST(pagoRequest({ ...payload, pagoId: "PAGO-1", periodoMes: 1 }));
    const data1 = await res1.json();
    const [ventaAntes] = await db.select().from(schema.ventas).where(eq(schema.ventas.id, data1.ventaId));

    await new Promise((r) => setTimeout(r, 10));

    await POST(pagoRequest({ ...payload, pagoId: "PAGO-2", periodoMes: 2 }));
    const [ventaDespues] = await db.select().from(schema.ventas).where(eq(schema.ventas.id, data1.ventaId));

    expect(ventaDespues.ultimoPagoEn.getTime()).toBeGreaterThan(ventaAntes.ultimoPagoEn.getTime());
  });

  it("sigue actualizando ultimoPagoEn después de agotar el tope de comisionMeses (aunque ya no genere cuota)", async () => {
    await updateConfiguracion({ comisionMonto: 5000, comisionMeses: 1 });
    await seedProducto();
    const rev = await seedRevendedor();
    const payload = { ...basePayload, codigoRevendedor: rev.codigoVentas };

    const res1 = await POST(pagoRequest({ ...payload, pagoId: "PAGO-1", periodoMes: 1 }));
    const data1 = await res1.json();
    const [ventaAntes] = await db.select().from(schema.ventas).where(eq(schema.ventas.id, data1.ventaId));

    await new Promise((r) => setTimeout(r, 10));

    const res2 = await POST(pagoRequest({ ...payload, pagoId: "PAGO-2", periodoMes: 2 }));
    const data2 = await res2.json();
    expect(data2.comision).toBe(false); // ya se agotó el tope de 1 mes de comisión

    const [ventaDespues] = await db.select().from(schema.ventas).where(eq(schema.ventas.id, data1.ventaId));
    expect(ventaDespues.ultimoPagoEn.getTime()).toBeGreaterThan(ventaAntes.ultimoPagoEn.getTime());
  });
});
