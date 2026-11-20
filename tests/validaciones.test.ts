import { describe, expect, it } from "vitest";
import { esquemaCambioRol, esquemaHija, esquemaRegistro, esquemaTransaccion } from "@/lib/validaciones";

describe("esquemaRegistro", () => {
  const valido = { nombre: "Demo", email: "demo@demo.com", password: "123456", rol: "comprador" };

  it("acepta un registro válido", () => {
    expect(esquemaRegistro.safeParse(valido).success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    expect(esquemaRegistro.safeParse({ ...valido, email: "no-es-correo" }).success).toBe(false);
  });

  it("rechaza una contraseña de menos de 6 caracteres", () => {
    expect(esquemaRegistro.safeParse({ ...valido, password: "1234" }).success).toBe(false);
  });

  it("no permite registrarse como admin", () => {
    expect(esquemaRegistro.safeParse({ ...valido, rol: "admin" }).success).toBe(false);
  });
});

describe("esquemaHija", () => {
  const valido = { tienda_id: "1", nombre: "Polo", precio: "25.00", stock: "10" };

  it("acepta precio y stock válidos (convierte texto a número)", () => {
    const r = esquemaHija.safeParse(valido);
    expect(r.success).toBe(true);
    expect(r.data?.precio).toBe(25);
  });

  it("rechaza un precio negativo", () => {
    expect(esquemaHija.safeParse({ ...valido, precio: "-1" }).success).toBe(false);
  });

  it("rechaza un stock negativo", () => {
    expect(esquemaHija.safeParse({ ...valido, stock: "-5" }).success).toBe(false);
  });
});

describe("esquemaTransaccion", () => {
  it("exige al menos un ítem", () => {
    expect(esquemaTransaccion.safeParse({ items: [] }).success).toBe(false);
  });

  it("rechaza cantidad 0", () => {
    expect(esquemaTransaccion.safeParse({ items: [{ producto_id: 1, cantidad: 0 }] }).success).toBe(false);
  });
});

describe("esquemaHija con campos vacíos", () => {
  it("rechaza un precio vacío en vez de guardarlo como 0", () => {
    expect(esquemaHija.safeParse({ tienda_id: "1", nombre: "Polo", precio: "", stock: "10" }).success).toBe(false);
  });

  it("rechaza un stock vacío en vez de guardarlo como 0", () => {
    expect(esquemaHija.safeParse({ tienda_id: "1", nombre: "Polo", precio: "25", stock: "" }).success).toBe(false);
  });
});

describe("esquemaCambioRol", () => {
  const id = "3f1c2a9e-6b1d-4c2e-9a7f-1b2c3d4e5f60";

  it("acepta un rol válido", () => {
    expect(esquemaCambioRol.safeParse({ usuario_id: id, rol: "vendedor" }).success).toBe(true);
  });

  it("rechaza un rol inventado", () => {
    expect(esquemaCambioRol.safeParse({ usuario_id: id, rol: "superadmin" }).success).toBe(false);
  });

  it("rechaza un id de usuario que no es UUID", () => {
    expect(esquemaCambioRol.safeParse({ usuario_id: "123", rol: "vendedor" }).success).toBe(false);
  });
});
