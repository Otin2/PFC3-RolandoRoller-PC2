import { describe, expect, it } from "vitest";
import { calcularTotal, patronBusqueda, sumarMontos, validarStock } from "@/lib/reglas";

// Pruebas unitarias ATÓMICAS: cada una prueba una sola regla
const productos = [
  { id: 1, nombre: "Polo básico", precio: 25, stock: 50 },
  { id: 2, nombre: "Jean clásico", precio: 79.9, stock: 20 },
  { id: 3, nombre: "Casaca", precio: 120, stock: 8 },
];

describe("calcularTotal", () => {
  it("suma precio x cantidad de cada ítem", () => {
    const total = calcularTotal([
      { cantidad: 2, precio_unitario: 25 },
      { cantidad: 1, precio_unitario: 79.9 },
    ]);
    expect(total).toBe(129.9);
  });

  it("devuelve 0 si no hay ítems", () => {
    expect(calcularTotal([])).toBe(0);
  });

  it("redondea a 2 decimales (evita 0.1 + 0.2 = 0.30000000000000004)", () => {
    expect(calcularTotal([{ cantidad: 3, precio_unitario: 0.1 }])).toBe(0.3);
  });
});

describe("validarStock", () => {
  it("acepta cantidades dentro del stock", () => {
    expect(validarStock([{ producto_id: 3, cantidad: 8 }], productos)).toEqual([]);
  });

  it("rechaza una cantidad mayor al stock", () => {
    const errores = validarStock([{ producto_id: 3, cantidad: 9 }], productos);
    expect(errores).toHaveLength(1);
    expect(errores[0]).toContain("solo hay 8");
  });

  it("rechaza un producto que no existe", () => {
    expect(validarStock([{ producto_id: 99, cantidad: 1 }], productos)).toHaveLength(1);
  });
});

describe("patronBusqueda", () => {
  it("arma el patrón para ILIKE ignorando espacios", () => {
    expect(patronBusqueda("  polo ")).toBe("%polo%");
  });

  it("devuelve null si no hay texto", () => {
    expect(patronBusqueda("   ")).toBeNull();
  });

  it("escapa % y _ para buscarlos como texto", () => {
    expect(patronBusqueda("50%_off")).toBe("%50\\%\\_off%");
  });
});

describe("sumarMontos", () => {
  it("suma totales que llegan como texto desde PostgreSQL (numeric)", () => {
    expect(sumarMontos([{ total: "129.90" }, { total: 209.6 }])).toBe(339.5);
  });
});
