import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import path from "path";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { marcarFacturaPagadaAction } from "./actions";

// Ver comentario equivalente en api/panel/facturas/route.test.ts: sobrecargas
// de `auth` de NextAuth confunden la inferencia de vi.mocked.
const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

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
  mockAuth.mockReset();
});

async function seedRevendedorConFacturaYDosCuotas() {
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

  const cuota1 = (await db.insert(schema.cuotas).values({
    ventaId: venta.id, revendedorId: rev.id, numeroCuota: 1, monto: "5000",
    periodoMes: 7, periodoAnio: 2026, status: "facturada",
  }).returning())[0];
  const cuota2 = (await db.insert(schema.cuotas).values({
    ventaId: venta.id, revendedorId: rev.id, numeroCuota: 2, monto: "5000",
    periodoMes: 8, periodoAnio: 2026, status: "facturada",
  }).returning())[0];

  const [factura] = await db
    .insert(schema.facturas)
    .values({ revendedorId: rev.id, monto: "10000", archivoUrl: "/x/f.pdf", pagada: false })
    .returning();
  await db.insert(schema.cuotasFacturas).values([
    { cuotaId: cuota1.id, facturaId: factura.id },
    { cuotaId: cuota2.id, facturaId: factura.id },
  ]);

  return { rev, factura, cuota1, cuota2 };
}

describe("marcarFacturaPagadaAction", () => {
  it("rechaza si quien llama no es superadmin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "revendedor" } } as never);
    const { factura } = await seedRevendedorConFacturaYDosCuotas();
    await expect(marcarFacturaPagadaAction(factura.id)).rejects.toThrow("No autorizado");
  });

  it("rechaza sin sesión", async () => {
    mockAuth.mockResolvedValue(null);
    const { factura } = await seedRevendedorConFacturaYDosCuotas();
    await expect(marcarFacturaPagadaAction(factura.id)).rejects.toThrow("No autorizado");
  });

  it("marca la factura como pagada y todas sus cuotas vinculadas", async () => {
    const { factura, cuota1, cuota2 } = await seedRevendedorConFacturaYDosCuotas();
    mockAuth.mockResolvedValue({ user: { role: "superadmin" } } as never);

    await marcarFacturaPagadaAction(factura.id);

    const [facturaActualizada] = await db.select().from(schema.facturas).where(eq(schema.facturas.id, factura.id));
    expect(facturaActualizada.pagada).toBe(true);
    expect(facturaActualizada.pagadaEn).not.toBeNull();

    const [c1] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuota1.id));
    const [c2] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuota2.id));
    expect(c1.status).toBe("pagada");
    expect(c1.pagadoEn).not.toBeNull();
    expect(c2.status).toBe("pagada");
    expect(c2.pagadoEn).not.toBeNull();
  });

  it("no toca cuotas de otras facturas", async () => {
    const { factura } = await seedRevendedorConFacturaYDosCuotas();
    const { cuota1: cuotaAjena } = await seedRevendedorConFacturaYDosCuotas();
    mockAuth.mockResolvedValue({ user: { role: "superadmin" } } as never);

    await marcarFacturaPagadaAction(factura.id);

    const [ajena] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuotaAjena.id));
    expect(ajena.status).toBe("facturada");
  });

  it("facturaId inexistente no rompe (no-op)", async () => {
    mockAuth.mockResolvedValue({ user: { role: "superadmin" } } as never);
    await expect(marcarFacturaPagadaAction(crypto.randomUUID())).resolves.not.toThrow();
  });
});
