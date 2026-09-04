import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { eq, sql } from "drizzle-orm";
import path from "path";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const sendEmail = vi.fn().mockResolvedValue(undefined);
const notifyAdmins = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email", () => ({
  sendEmail: (...a: unknown[]) => sendEmail(...a),
  notifyAdmins: (...a: unknown[]) => notifyAdmins(...a),
  emailLiquidacionPagada: () => ({ subject: "s", html: "h" }),
  emailRecordatorioFacturaPendiente: () => ({ subject: "gentle", html: "h" }),
  emailFacturaVencidaBloqueo: () => ({ subject: "escalado", html: "h" }),
  emailAdminResellersBloqueados: () => ({ subject: "admin", html: "h" }),
}));

import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { confirmarLiquidacionAction, enviarRecordatoriosLiquidacionAction } from "./liquidaciones-actions";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const AHORA = new Date("2026-09-10T12:00:00Z"); // corte = 2026-09-01T03:00Z

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
  mockAuth.mockReset();
  mockAuth.mockResolvedValue({ user: { role: "superadmin" } });
  sendEmail.mockClear();
  notifyAdmins.mockClear();
});

const DATOS_COBRO_OK = {
  puedeFacturar: true,
  cbuAlias: "juan.perez.mp",
  titularNombre: "Juan Perez",
  titularCuit: "20123456789",
  dni: "12345678",
  fechaNacimiento: "1990-01-01",
  provincia: "Buenos Aires",
  localidad: "La Plata",
  telefono: "11 2345-6789",
};

async function seedRevendedor(overrides: Partial<typeof schema.revendedores.$inferInsert> = {}) {
  const userId = crypto.randomUUID();
  await db.insert(schema.users).values({ id: userId, email: `${userId}@t.com`, role: "revendedor" });
  const [r] = await db
    .insert(schema.revendedores)
    .values({ userId, codigoVentas: `T-${Math.random().toString(36).slice(2, 7)}`, activo: true, ...DATOS_COBRO_OK, ...overrides })
    .returning();
  return r;
}

async function seedCuota(revendedorId: string, generadoEn: Date, monto = "5000") {
  const [producto] = await db
    .insert(schema.productos)
    .values({ nombre: `p-${Math.random().toString(36).slice(2, 6)}`, dominio: "d", urlRegistro: "u", tag: "t", precioMensual: "9000" })
    .returning();
  const [venta] = await db
    .insert(schema.ventas)
    .values({ revendedorId, productoId: producto.id, clienteNombre: "C", precioMensual: "9000" })
    .returning();
  const [c] = await db
    .insert(schema.cuotas)
    .values({ ventaId: venta.id, revendedorId, numeroCuota: 1, monto, periodoMes: 8, periodoAnio: 2026, status: "generada", generadoEn })
    .returning();
  return c;
}

describe("confirmarLiquidacionAction", () => {
  it("rechaza si no es superadmin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "revendedor" } });
    const rev = await seedRevendedor();
    await expect(confirmarLiquidacionAction(rev.id, AHORA)).rejects.toThrow("No autorizado");
  });

  it("agrupa solo cuotas generadas antes del inicio del mes (por generadoEn)", async () => {
    const rev = await seedRevendedor();
    await seedCuota(rev.id, new Date("2026-08-20T12:00:00Z")); // entra
    await seedCuota(rev.id, new Date("2026-07-05T12:00:00Z")); // entra (atrasada)
    await seedCuota(rev.id, new Date("2026-09-05T12:00:00Z")); // NO entra (este mes)

    const res = await confirmarLiquidacionAction(rev.id, AHORA);
    expect("liquidacionId" in res).toBe(true);

    const [liq] = await db.select().from(schema.liquidaciones).where(eq(schema.liquidaciones.revendedorId, rev.id));
    expect(liq.cantidadCuotas).toBe(2);
    expect(Number(liq.monto)).toBe(10000);
    expect(liq.periodoMes).toBe(8);
    expect(liq.periodoAnio).toBe(2026);

    const liquidadas = await db.select().from(schema.cuotas).where(eq(schema.cuotas.status, "liquidada"));
    expect(liquidadas).toHaveLength(2);
    expect(liquidadas.every((c) => c.liquidacionId === liq.id && c.liquidadoEn !== null)).toBe(true);
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("devuelve {nada:true} si no hay cuotas para liquidar", async () => {
    const rev = await seedRevendedor();
    await seedCuota(rev.id, new Date("2026-09-05T12:00:00Z")); // solo cuota de este mes
    const res = await confirmarLiquidacionAction(rev.id, AHORA);
    expect(res).toEqual({ nada: true });
  });

  it("tira si al revendedor le faltan datos de cobro", async () => {
    const rev = await seedRevendedor({ titularCuit: null });
    await seedCuota(rev.id, new Date("2026-08-20T12:00:00Z"));
    await expect(confirmarLiquidacionAction(rev.id, AHORA)).rejects.toThrow(/CUIT/);
  });

  it("tira si el revendedor tiene una liquidación con factura vencida", async () => {
    const rev = await seedRevendedor();
    await db.insert(schema.liquidaciones).values({
      revendedorId: rev.id, periodoMes: 6, periodoAnio: 2026, monto: "5000", cantidadCuotas: 1,
      status: "pagada", facturaVenceEn: new Date("2026-08-01T12:00:00Z"), // vencida a la fecha AHORA
    });
    await seedCuota(rev.id, new Date("2026-08-20T12:00:00Z"));
    await expect(confirmarLiquidacionAction(rev.id, AHORA)).rejects.toThrow(/vencida/i);
  });

  it("no permite liquidar dos veces el mismo mes", async () => {
    const rev = await seedRevendedor();
    await seedCuota(rev.id, new Date("2026-08-20T12:00:00Z"));
    await confirmarLiquidacionAction(rev.id, AHORA);
    await seedCuota(rev.id, new Date("2026-08-25T12:00:00Z"));
    await expect(confirmarLiquidacionAction(rev.id, AHORA)).rejects.toThrow(/Ya se liquidó/i);
  });
});

describe("enviarRecordatoriosLiquidacionAction", () => {
  async function seedLiquidacionPagada(revId: string, facturaVenceEn: Date) {
    const [l] = await db
      .insert(schema.liquidaciones)
      .values({ revendedorId: revId, periodoMes: 8, periodoAnio: 2026, monto: "5000", cantidadCuotas: 1, status: "pagada", facturaVenceEn })
      .returning();
    return l;
  }

  it("manda recordatorio suave si todavía no venció y no avisa al admin", async () => {
    const rev = await seedRevendedor();
    await seedLiquidacionPagada(rev.id, new Date("2026-10-01T12:00:00Z"));
    const res = await enviarRecordatoriosLiquidacionAction(undefined, AHORA);
    expect(res.enviados).toBe(1);
    expect(res.bloqueadosNuevos).toBe(0);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "gentle" }));
    expect(notifyAdmins).not.toHaveBeenCalled();
  });

  it("manda recordatorio escalado si venció y avisa al admin la primera vez", async () => {
    const rev = await seedRevendedor();
    const l = await seedLiquidacionPagada(rev.id, new Date("2026-08-01T12:00:00Z"));
    const res = await enviarRecordatoriosLiquidacionAction(undefined, AHORA);
    expect(res.enviados).toBe(1);
    expect(res.bloqueadosNuevos).toBe(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "escalado" }));
    expect(notifyAdmins).toHaveBeenCalledOnce();

    const [actualizada] = await db.select().from(schema.liquidaciones).where(eq(schema.liquidaciones.id, l.id));
    expect(actualizada.recordatoriosEnviados).toBe(1);
    expect(actualizada.ultimoRecordatorioEn).not.toBeNull();

    // Segunda corrida: ya no es "nuevo" bloqueo.
    notifyAdmins.mockClear();
    const res2 = await enviarRecordatoriosLiquidacionAction(undefined, AHORA);
    expect(res2.bloqueadosNuevos).toBe(0);
    expect(notifyAdmins).not.toHaveBeenCalled();
  });
});
