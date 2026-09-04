import { describe, it, expect } from "vitest";
import { addMonths, inicioDeMesArgentina, mesAnteriorArgentina, periodoLabel } from "./fecha";

describe("addMonths", () => {
  it("suma meses normales", () => {
    expect(addMonths(new Date("2026-01-15T12:00:00Z"), 3).toISOString().slice(0, 10)).toBe("2026-04-15");
  });

  it("clampa el día cuando el mes destino es más corto (31 ene + 1 mes)", () => {
    expect(addMonths(new Date("2026-01-31T12:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-02-28");
  });

  it("clampa en año bisiesto (31 ene 2028 + 1 mes → 29 feb)", () => {
    expect(addMonths(new Date("2028-01-31T12:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2028-02-29");
  });

  it("cruza el fin de año", () => {
    expect(addMonths(new Date("2026-11-20T12:00:00Z"), 3).toISOString().slice(0, 10)).toBe("2027-02-20");
  });

  it("acepta n negativo", () => {
    expect(addMonths(new Date("2026-03-10T12:00:00Z"), -1).toISOString().slice(0, 10)).toBe("2026-02-10");
  });
});

describe("inicioDeMesArgentina", () => {
  it("da el 1° a las 00:00 ART (03:00 UTC)", () => {
    expect(inicioDeMesArgentina(new Date("2026-09-15T10:00:00Z")).toISOString()).toBe("2026-09-01T03:00:00.000Z");
  });

  it("un instante que en Argentina todavía es el mes anterior cae en ese mes", () => {
    // 2026-09-01T02:00Z = 2026-08-31T23:00 ART → agosto
    expect(inicioDeMesArgentina(new Date("2026-09-01T02:00:00Z")).toISOString()).toBe("2026-08-01T03:00:00.000Z");
  });
});

describe("mesAnteriorArgentina", () => {
  it("septiembre → agosto", () => {
    expect(mesAnteriorArgentina(new Date("2026-09-03T12:00:00Z"))).toEqual({ mes: 8, anio: 2026 });
  });

  it("enero → diciembre del año anterior", () => {
    expect(mesAnteriorArgentina(new Date("2027-01-10T12:00:00Z"))).toEqual({ mes: 12, anio: 2026 });
  });
});

describe("periodoLabel", () => {
  it("arma el label en español", () => {
    expect(periodoLabel(8, 2026)).toBe("agosto 2026");
  });
});
