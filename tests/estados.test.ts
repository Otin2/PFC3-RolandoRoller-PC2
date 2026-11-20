import { describe, expect, it } from "vitest";
import { puedeCancelar, siguienteEstado, transicionValida } from "@/lib/reglas";

// Pruebas unitarias de las reglas de estado (deben coincidir con las funciones SQL)
describe("transicionValida (atender pedido)", () => {
  it("permite pendiente -> confirmado", () => {
    expect(transicionValida("pendiente", "confirmado")).toBe(true);
  });

  it("permite confirmado -> entregado", () => {
    expect(transicionValida("confirmado", "entregado")).toBe(true);
  });

  it("no permite saltarse un paso (pendiente -> entregado)", () => {
    expect(transicionValida("pendiente", "entregado")).toBe(false);
  });

  it("no permite retroceder (entregado -> confirmado)", () => {
    expect(transicionValida("entregado", "confirmado")).toBe(false);
  });

  it("no permite tocar un pedido cancelado", () => {
    expect(transicionValida("cancelado", "confirmado")).toBe(false);
  });
});

describe("siguienteEstado", () => {
  it("indica el próximo paso o null si ya terminó", () => {
    expect(siguienteEstado("pendiente")).toBe("confirmado");
    expect(siguienteEstado("entregado")).toBeNull();
  });
});

describe("puedeCancelar", () => {
  it("solo se cancela si está pendiente", () => {
    expect(puedeCancelar("pendiente")).toBe(true);
  });

  it("no se cancela un pedido confirmado o entregado", () => {
    expect(puedeCancelar("confirmado")).toBe(false);
    expect(puedeCancelar("entregado")).toBe(false);
  });
});
