import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { eq, sql } from "drizzle-orm";
import path from "path";

const sendEmail = vi.fn().mockResolvedValue(undefined);
const notifyAdmins = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/email", () => ({
  sendEmail: (...a: unknown[]) => sendEmail(...a),
  notifyAdmins: (...a: unknown[]) => notifyAdmins(...a),
  emailRecordatorioFacturaPendiente: () => ({ subject: "suave", html: "h" }),
  emailFacturaVencidaBloqueo: () => ({ subject: "bloqueo", html: "h" }),
  emailAdminResellersBloqueados: () => ({ subject: "admin", html: "h" }),
}));

import { db } from "@/db";
import * as schema from "@/db/schema";
import { procesarRecordatoriosLiquidacion } from "./recordatorios-liquidacion";

const AHORA = new Date("2026-09-10T12:00:00Z");

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
  sendEmail.mockClear();
  notifyAdmins.mockClear();
});

async function seedRevendedor() {
  const userId = crypto.randomUUID();
  await db.insert(schema.users).values({ id: userId, email: `${userId}@t.com`, role: "revendedor", name: "Rev Test" });
  const [r] = await db
    .insert(schema.revendedores)
    .values({ userId, codigoVentas: `T-${Math.random().toString(36).slice(2, 7)}`, activo: true })
    .returning();
  return r;
}

async function seedLiquidacionPagada(revId: string, facturaVenceEn: Date) {
  const [l] = await db
    .insert(schema.liquidaciones)
    .values({
      revendedorId: revId, periodoMes: 8, periodoAnio: 2026, monto: "5000",
      cantidadCuotas: 1, status: "pagada", facturaVenceEn,
    })
    .returning();
  return l;
}

describe("procesarRecordatoriosLiquidacion — automático (forzar: false)", () => {
  it("manda el recordatorio suave una sola vez dentro de la ventana de 30 días", async () => {
    const rev = await seedRevendedor();
    const l = await seedLiquidacionPagada(rev.id, new Date("2026-09-25T12:00:00Z")); // faltan 15 días

    const r1 = await procesarRecordatoriosLiquidacion({ ahora: AHORA });
    expect(r1).toEqual({ enviados: 1, bloqueadosNuevos: 0 });
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "suave" }));
    expect(notifyAdmins).not.toHaveBeenCalled();

    // Al día siguiente no vuelve a mandar el suave.
    sendEmail.mockClear();
    const r2 = await procesarRecordatoriosLiquidacion({ ahora: new Date("2026-09-11T12:00:00Z") });
    expect(r2.enviados).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();

    const [row] = await db.select().from(schema.liquidaciones).where(eq(schema.liquidaciones.id, l.id));
    expect(row.recordatoriosEnviados).toBe(1);
  });

  it("no manda nada si al vencimiento le faltan más de 30 días", async () => {
    const rev = await seedRevendedor();
    await seedLiquidacionPagada(rev.id, new Date("2026-11-01T12:00:00Z")); // faltan ~52 días

    const r = await procesarRecordatoriosLiquidacion({ ahora: AHORA });
    expect(r.enviados).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("manda el aviso de bloqueo una sola vez al vencer y avisa al admin", async () => {
    const rev = await seedRevendedor();
    const l = await seedLiquidacionPagada(rev.id, new Date("2026-08-01T12:00:00Z")); // ya vencida

    const r1 = await procesarRecordatoriosLiquidacion({ ahora: AHORA });
    expect(r1).toEqual({ enviados: 1, bloqueadosNuevos: 1 });
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "bloqueo" }));
    expect(notifyAdmins).toHaveBeenCalledOnce();

    // Segunda corrida: ya avisado, no repite ni re-notifica al admin.
    sendEmail.mockClear();
    notifyAdmins.mockClear();
    const r2 = await procesarRecordatoriosLiquidacion({ ahora: new Date("2026-09-11T12:00:00Z") });
    expect(r2).toEqual({ enviados: 0, bloqueadosNuevos: 0 });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(notifyAdmins).not.toHaveBeenCalled();

    const [row] = await db.select().from(schema.liquidaciones).where(eq(schema.liquidaciones.id, l.id));
    expect(row.recordatoriosEnviados).toBe(1);
  });

  it("si ya venció sin haber mandado el suave, va directo al bloqueo (no manda suave)", async () => {
    const rev = await seedRevendedor();
    await seedLiquidacionPagada(rev.id, new Date("2026-08-01T12:00:00Z"));

    await procesarRecordatoriosLiquidacion({ ahora: AHORA });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "bloqueo" }));
  });

  it("ignora liquidaciones que ya no están en 'pagada'", async () => {
    const rev = await seedRevendedor();
    await db.insert(schema.liquidaciones).values({
      revendedorId: rev.id, periodoMes: 8, periodoAnio: 2026, monto: "5000",
      cantidadCuotas: 1, status: "facturada", facturaVenceEn: new Date("2026-08-01T12:00:00Z"),
    });
    const r = await procesarRecordatoriosLiquidacion({ ahora: AHORA });
    expect(r.enviados).toBe(0);
  });
});

describe("procesarRecordatoriosLiquidacion — forzado (forzar: true)", () => {
  it("manda aunque falten más de 30 días y no esté vencida", async () => {
    const rev = await seedRevendedor();
    await seedLiquidacionPagada(rev.id, new Date("2026-12-01T12:00:00Z"));

    const r = await procesarRecordatoriosLiquidacion({ ahora: AHORA, forzar: true });
    expect(r.enviados).toBe(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "suave" }));
  });

  it("con liquidacionId sólo procesa esa liquidación", async () => {
    const rev = await seedRevendedor();
    const l1 = await seedLiquidacionPagada(rev.id, new Date("2026-12-01T12:00:00Z"));
    await db.insert(schema.liquidaciones).values({
      revendedorId: rev.id, periodoMes: 7, periodoAnio: 2026, monto: "5000",
      cantidadCuotas: 1, status: "pagada", facturaVenceEn: new Date("2026-12-05T12:00:00Z"),
    });

    const r = await procesarRecordatoriosLiquidacion({ ahora: AHORA, forzar: true, liquidacionId: l1.id });
    expect(r.enviados).toBe(1);
  });
});
