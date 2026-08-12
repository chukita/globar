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

// `auth` de NextAuth tiene sobrecargas (uso como middleware vs. como
// `() => Promise<Session | null>`); mockAuth infiere la sobrecarga
// equivocada. Casteamos una sola vez acá para tener mockResolvedValue tipado.
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
    TRUNCATE TABLE cuotas_facturas, facturas, cuotas, habilitaciones, ventas,
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

async function seedVentaYCuota(revendedorId: string, status: typeof schema.cuotas.$inferInsert["status"] = "generada") {
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
    .values({
      revendedorId,
      productoId: producto.id,
      clienteNombre: "Cliente test",
      clienteEmail: "cliente@test.com",
      precioMensual: "9000",
    })
    .returning();
  const [cuota] = await db
    .insert(schema.cuotas)
    .values({
      ventaId: venta.id,
      revendedorId,
      numeroCuota: 1,
      monto: "5000",
      periodoMes: 8,
      periodoAnio: 2026,
      status,
    })
    .returning();
  return cuota;
}

function pdfFile(name = "factura.pdf", sizeBytes = 4): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: "application/pdf" });
}

function facturasRequest(opts: { archivo?: File | null; nota?: string; cuotaIds?: unknown }): NextRequest {
  const form = new FormData();
  if (opts.archivo !== null) form.set("archivo", opts.archivo ?? pdfFile());
  if (opts.nota !== undefined) form.set("nota", opts.nota);
  if (opts.cuotaIds !== undefined) {
    form.set("cuotaIds", typeof opts.cuotaIds === "string" ? opts.cuotaIds : JSON.stringify(opts.cuotaIds));
  }
  return new NextRequest("http://localhost/api/panel/facturas", { method: "POST", body: form });
}

describe("POST /api/panel/facturas", () => {
  it("rechaza sin sesión", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(facturasRequest({ cuotaIds: ["x"] }));
    expect(res.status).toBe(401);
  });

  it("rechaza si el rol no es revendedor", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "superadmin" } } as never);
    const res = await POST(facturasRequest({ cuotaIds: ["x"] }));
    expect(res.status).toBe(403);
  });

  it("rechaza sin archivo", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const res = await POST(facturasRequest({ archivo: null, cuotaIds: ["x"] }));
    expect(res.status).toBe(400);
  });

  it("rechaza sin cuotaIds", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const res = await POST(facturasRequest({}));
    expect(res.status).toBe(400);
  });

  it("rechaza un archivo mayor a 5MB", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const grande = pdfFile("grande.pdf", 6 * 1024 * 1024);
    const res = await POST(facturasRequest({ archivo: grande, cuotaIds: ["x"] }));
    expect(res.status).toBe(400);
  });

  it("rechaza un archivo que no es PDF", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const noPdf = new File([new Uint8Array(4)], "foto.png", { type: "image/png" });
    const res = await POST(facturasRequest({ archivo: noPdf, cuotaIds: ["x"] }));
    expect(res.status).toBe(400);
  });

  it("responde 404 si el usuario logueado no tiene fila de revendedor", async () => {
    mockAuth.mockResolvedValue({ user: { id: crypto.randomUUID(), role: "revendedor" } } as never);
    const res = await POST(facturasRequest({ cuotaIds: ["x"] }));
    expect(res.status).toBe(404);
  });

  it("responde 422 si una cuota ya fue facturada", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const cuota = await seedVentaYCuota(rev.id, "facturada");
    const res = await POST(facturasRequest({ cuotaIds: [cuota.id] }));
    expect(res.status).toBe(422);
  });

  it("responde 422 si la cuota es de otro revendedor", async () => {
    const rev = await seedRevendedorConUsuario();
    const otro = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const cuotaAjena = await seedVentaYCuota(otro.id, "generada");
    const res = await POST(facturasRequest({ cuotaIds: [cuotaAjena.id] }));
    expect(res.status).toBe(422);
  });

  it("crea la factura, vincula la cuota y la pasa a facturada", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const cuota = await seedVentaYCuota(rev.id, "generada");

    const res = await POST(facturasRequest({ nota: "prueba", cuotaIds: [cuota.id] }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.monto).toBe(5000);
    expect(data.cuotas).toBe(1);

    const [cuotaActualizada] = await db.select().from(schema.cuotas).where(eq(schema.cuotas.id, cuota.id));
    expect(cuotaActualizada.status).toBe("facturada");
    expect(cuotaActualizada.facturadoEn).not.toBeNull();

    const [factura] = await db.select().from(schema.facturas).where(eq(schema.facturas.id, data.facturaId));
    expect(factura.revendedorId).toBe(rev.id);
    expect(factura.pagada).toBe(false);
    expect(Number(factura.monto)).toBe(5000);

    const links = await db
      .select()
      .from(schema.cuotasFacturas)
      .where(eq(schema.cuotasFacturas.cuotaId, cuota.id));
    expect(links).toHaveLength(1);
    expect(links[0].facturaId).toBe(factura.id);

    // El archivo efectivamente se guardó en disco.
    const nombreArchivo = path.basename(data.archivoUrl);
    const contenido = await fs.readFile(path.join(UPLOAD_DIR, rev.id, nombreArchivo));
    expect(contenido.length).toBeGreaterThan(0);
  });

  it("suma el monto de varias cuotas seleccionadas", async () => {
    const rev = await seedRevendedorConUsuario();
    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const cuota1 = await seedVentaYCuota(rev.id, "generada");
    const cuota2 = await seedVentaYCuota(rev.id, "generada");

    const res = await POST(facturasRequest({ cuotaIds: [cuota1.id, cuota2.id] }));
    const data = await res.json();

    expect(data.monto).toBe(10000);
    expect(data.cuotas).toBe(2);
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
    expect(data.facturas).toEqual([]);
  });

  it("devuelve solo las facturas del revendedor logueado", async () => {
    const rev = await seedRevendedorConUsuario();
    const otro = await seedRevendedorConUsuario();
    await db.insert(schema.facturas).values({ revendedorId: rev.id, monto: "5000", archivoUrl: "/x/a.pdf" });
    await db.insert(schema.facturas).values({ revendedorId: otro.id, monto: "5000", archivoUrl: "/x/b.pdf" });

    mockAuth.mockResolvedValue({ user: { id: rev.userId, role: "revendedor" } } as never);
    const res = await GET();
    const data = await res.json();

    expect(data.facturas).toHaveLength(1);
    expect(data.facturas[0].revendedorId).toBe(rev.id);
  });
});
