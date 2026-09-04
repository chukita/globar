import { describe, it, expect } from "vitest";
import { esMayorDeEdad } from "./validacion";

describe("esMayorDeEdad", () => {
  const HOY = new Date("2026-09-04T12:00:00Z");

  it("acepta a alguien de 18 recién cumplidos", () => {
    expect(esMayorDeEdad("2008-09-04", HOY)).toBe(true);
    expect(esMayorDeEdad("2008-09-03", HOY)).toBe(true);
  });

  it("rechaza a alguien que cumple 18 mañana", () => {
    expect(esMayorDeEdad("2008-09-05", HOY)).toBe(false);
  });

  it("rechaza menores claros", () => {
    expect(esMayorDeEdad("2015-01-01", HOY)).toBe(false);
  });

  it("rechaza formato inválido, fecha futura y años absurdos", () => {
    expect(esMayorDeEdad("04/09/2000", HOY)).toBe(false);
    expect(esMayorDeEdad("2000-13-40", HOY)).toBe(false);
    expect(esMayorDeEdad("2030-01-01", HOY)).toBe(false);
    expect(esMayorDeEdad("1899-01-01", HOY)).toBe(false);
    expect(esMayorDeEdad("", HOY)).toBe(false);
  });

  it("acepta un adulto normal", () => {
    expect(esMayorDeEdad("1990-06-15", HOY)).toBe(true);
  });
});
