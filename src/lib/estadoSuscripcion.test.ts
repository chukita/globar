import { describe, it, expect } from "vitest";
import { esSuscripcionActiva, DIAS_SUSCRIPCION_VENCIDA } from "./estadoSuscripcion";

describe("esSuscripcionActiva", () => {
  const ahora = new Date("2026-08-20T12:00:00Z");

  it("pago de hoy → activa", () => {
    expect(esSuscripcionActiva(ahora, ahora)).toBe(true);
  });

  it(`pago hace ${DIAS_SUSCRIPCION_VENCIDA - 1} días → activa`, () => {
    const pago = new Date(ahora.getTime() - (DIAS_SUSCRIPCION_VENCIDA - 1) * 24 * 60 * 60 * 1000);
    expect(esSuscripcionActiva(pago, ahora)).toBe(true);
  });

  it(`pago hace exactamente ${DIAS_SUSCRIPCION_VENCIDA} días → todavía activa (límite inclusive)`, () => {
    const pago = new Date(ahora.getTime() - DIAS_SUSCRIPCION_VENCIDA * 24 * 60 * 60 * 1000);
    expect(esSuscripcionActiva(pago, ahora)).toBe(true);
  });

  it(`pago hace ${DIAS_SUSCRIPCION_VENCIDA + 1} días → vencida`, () => {
    const pago = new Date(ahora.getTime() - (DIAS_SUSCRIPCION_VENCIDA + 1) * 24 * 60 * 60 * 1000);
    expect(esSuscripcionActiva(pago, ahora)).toBe(false);
  });

  it("pago hace 6 meses → vencida", () => {
    const pago = new Date(ahora.getTime() - 180 * 24 * 60 * 60 * 1000);
    expect(esSuscripcionActiva(pago, ahora)).toBe(false);
  });
});
