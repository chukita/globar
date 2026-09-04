import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { sql } from "drizzle-orm";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/uploads";
import { POST, GET } from "./route";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

beforeAll(async () => {
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
});

afterAll(async () => {
  await fs.rm(UPLOAD_DIR, { recursive: true, force: true });
});

beforeEach(async () => {
  await db.execute(sql`
    TRUNCATE TABLE cuotas_facturas, facturas, cuotas, liquidaciones, habilitaciones, ventas,
      revendedores, productos, configuracion, users
    RESTART IDENTITY CASCADE
  `);
  mockAuth.mockReset();
});

async function seedRevendedorConUsuario(overrides: Partial<typeof schema.revendedores.$inferInsert> = {}) {
  const userId = crypto.randomUUID();
  await db.insert(schema.users).values({ id: userId, email: `${userId}@test.com`, role: "revendedor" });
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

/** Crea una liquidación "pagada" con N cuotas "liquidada" enganchadas. */
async function seedLiquidacion(revendedorId: string, opts: { status?: typeof schema.liquidaciones.$inferInsert["status"]; cuotas?: number } = {}) {
  const nCuotas = opts.cuotas ?? 1;
  const [producto] = await db
    .insert(schema.productos)
    .values({
      nombre: `prod-${Math.random().toString(36).slice(2, 6)}`,
      dominio: "agendaonline.com.ar",
      urlRegistro: "https://agendaonline.com.ar/register",
      tag: "Turnos",
      precioMensual: "9000",
    })
    .returning();
  const [venta] = await db
    .insert(schema.ventas)
    .values({ revendedorId, productoId: producto.id, clienteNombre: "Cliente test", clienteEmail: "c@test.com", precioMensual: "9000" })
    .returning();

  const [liq] = await db
    .insert(schema.liquidaciones)
    .values({
      revendedorId,
      periodoMes: 8,
      periodoAnio: 2026,
      monto: String(5000 * nCuotas),
      cantidadCuotas: nCuotas,
      status: opts.status ?? "pagada",
      facturaVenceEn: new Date(Date.now() + 90 * 86400000),
    })
    .returning();

  for (let i = 0; i < nCuotas; i++) {
    await db.insert(schema.cuotas).values({
      ventaId: venta.id,
      revendedorId,
      numeroCuota: i + 1,
      monto: "5000",
      periodoMes: 8,
      periodoAnio: 2026,
      status: "liquidada",
      liquidacionId: liq.id,
      liquidadoEn: new Date(),
    });
  }
  return liq;
}

function pdfFile(name = "factura.pdf", sizeBytes = 4): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: "application/pdf" });
}

function facturasRequest(opts: { archivo?: File | null; nota?: string; liquidacionId?: string }): NextRequest {
  const form = new FormData();
  if (opts.archivo !== null) form.set("archivo", opts.archivo ?? pdfFile());
  if (opts.nota !== undefined) form.set("nota", opts.nota);
  if (opts.liquidacionId !== undefined) form.set("liquidacionId", opts.liquidacionId);
  return new NextRequest("http://localhost/api/panel/facturas", { method: "POST", body: form });
}

describe("POST /api/panel/facturas", () => {
  it("rechaza sin sesión", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(facturasRequest({ liquidacionId: "x" }));
    expect(res.status).toBe(401);
  });

  it("rechaza si el rol no es revendedor", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "superadmin" } } as never);
    const res = await POST(facturasRequest({ liquidacionId: "x" }));
    expect(res.status).toBe(403);
  });

  it("rechaza sin archivo", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const res = await POST(facturasRequest({ archivo: null, liquidacionId: "x" }));
    expect(res.status).toBe(400);
  });

  it("rechaza sin liquidacionId", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const res = await POST(facturasRequest({}));
    expect(res.status).toBe(400);
  });

  it("rechaza un archivo mayor a 5MB", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const grande = pdfFile("grande.pdf", 6 * 1024 * 1024);
    const res = await POST(facturasRequest({ archivo: grande, liquidacionId: "x" }));
    expect(res.status).toBe(400);
  });

  it("rechaza un archivo que no es PDF", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const noPdf = new File([new Uint8Array(4)], "foto.png", { type: "image/png" });
    const res = await POST(facturasRequest({ archivo: noPdf, liquidacionId: "x" }));
    expect(res.status).toBe(400);
  });

  it("responde 404 si el usuario logueado no tiene fila de revendedor", async () => {
    mockAuth.mockResolvedValue({ user: { id: crypto.randomUUID(), role: "revendedor" } } as never);
    const res = await POST(facturasRequest({ liquidacionId: crypto.randomUUID() }));
    expect(res.status).toBe(404);
  });

  it("responde 404 si la liquidación es de otro revendedor", async () => {
    const rev = await seedRevendedorConUsuario();
    const otro = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const liqAjena = await seedLiquidacion(otro.id);
    const res = await POST(facturasRequest({ liquidacionId: liqAjena.id }));
    expect(res.status).toBe(404);
  });

  it("responde 422 si la liquidación ya fue facturada", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const liq = await seedLiquidacion(rev.id, { status: "facturada" });
    const res = await POST(facturasRequest({ liquidacionId: liq.id }));
    expect(res.status).toBe(422);
  });

  it("marca la liquidación como facturada y sus cuotas como pagadas", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const liq = await seedLiquidacion(rev.id, { cuotas: 2 });

    const res = await POST(facturasRequest({ nota: "prueba", liquidacionId: liq.id }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.monto).toBe(10000);

    const [liqActualizada] = await db.select().from(schema.liquidaciones).where(eq(schema.liquidaciones.id, liq.id));
    expect(liqActualizada.status).toBe("facturada");
    expect(liqActualizada.facturaUrl).toBeTruthy();
    expect(liqActualizada.facturaRecibidaEn).not.toBeNull();

    const cuotas = await db.select().from(schema.cuotas).where(eq(schema.cuotas.liquidacionId, liq.id));
    expect(cuotas).toHaveLength(2);
    for (const c of cuotas) {
      expect(c.status).toBe("pagada");
      expect(c.pagadoEn).not.toBeNull();
    }

    const nombreArchivo = path.basename(liqActualizada.facturaUrl!);
    const contenido = await fs.readFile(path.join(UPLOAD_DIR, rev.id, nombreArchivo));
    expect(contenido.length).toBeGreaterThan(0);
  });
});

describe("GET /api/panel/facturas", () => {
  it("rechaza sin sesión", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("devuelve lista vacía si no hay fila de revendedor", async () => {
    mockAuth.mockResolvedValue({ user: { id: crypto.randomUUID(), role: "revendedor" } } as never);
    const res = await GET();
    const data = await res.json();
    expect(data.liquidaciones).toEqual([]);
  });

  it("devuelve solo las liquidaciones del revendedor logueado", async () => {
    const rev = await seedRevendedorConUsuario();
    const otro = await seedRevendedorConUsuario();
    await seedLiquidacion(rev.id);
    await seedLiquidacion(otro.id);

    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const res = await GET();
    const data = await res.json();

    expect(data.liquidaciones).toHaveLength(1);
  });
});
