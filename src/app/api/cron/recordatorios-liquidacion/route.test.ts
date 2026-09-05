import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const procesar = vi.fn().mockResolvedValue({ enviados: 2, bloqueadosNuevos: 1 });
vi.mock("@/lib/recordatorios-liquidacion", () => ({
  procesarRecordatoriosLiquidacion: (...a: unknown[]) => procesar(...a),
}));

import { POST } from "./route";

const SECRET = "test-cron-secret";
process.env.CRON_SECRET = SECRET;

const req = (headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost/api/cron/recordatorios-liquidacion", { method: "POST", headers });

beforeEach(() => procesar.mockClear());

describe("POST /api/cron/recordatorios-liquidacion", () => {
  it("401 sin header Authorization", async () => {
    const res = await POST(req());
    expect(res.status).toBe(401);
    expect(procesar).not.toHaveBeenCalled();
  });

  it("401 con Bearer incorrecto", async () => {
    const res = await POST(req({ authorization: "Bearer nope" }));
    expect(res.status).toBe(401);
    expect(procesar).not.toHaveBeenCalled();
  });

  it("200 con Bearer correcto y procesa sin forzar", async () => {
    const res = await POST(req({ authorization: `Bearer ${SECRET}` }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, enviados: 2, bloqueadosNuevos: 1 });
    expect(procesar).toHaveBeenCalledWith({ forzar: false });
  });
});
