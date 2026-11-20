import { describe, expect, it } from "vitest";
import {
  esquemaAtencion,
  esquemaMascota,
  esquemaRegistro,
  esquemaReporte,
  esquemaSancion,
} from "@/lib/validaciones";

describe("esquemaRegistro", () => {
  const valido = { nombre: "Ana", email: "ana@demo.com", password: "123456", rol: "vecino", distrito: "Comas" };

  it("acepta un registro válido", () => {
    expect(esquemaRegistro.safeParse(valido).success).toBe(true);
  });

  it("acepta el rol fiscalizador", () => {
    expect(esquemaRegistro.safeParse({ ...valido, rol: "fiscalizador" }).success).toBe(true);
  });

  it("no permite registrarse como admin", () => {
    expect(esquemaRegistro.safeParse({ ...valido, rol: "admin" }).success).toBe(false);
  });

  it("exige un distrito de Lima Norte", () => {
    expect(esquemaRegistro.safeParse({ ...valido, distrito: "Miraflores" }).success).toBe(false);
    expect(esquemaRegistro.safeParse({ ...valido, distrito: "" }).success).toBe(false);
  });

  it("rechaza correo inválido y contraseña corta", () => {
    expect(esquemaRegistro.safeParse({ ...valido, email: "no-es-correo" }).success).toBe(false);
    expect(esquemaRegistro.safeParse({ ...valido, password: "1234" }).success).toBe(false);
  });
});

describe("esquemaMascota", () => {
  const valida = { nombre: "Firulais", especie: "perro", distrito: "Los Olivos" };

  it("acepta una mascota válida", () => {
    expect(esquemaMascota.safeParse(valida).success).toBe(true);
  });

  it("rechaza nombre vacío y especie desconocida", () => {
    expect(esquemaMascota.safeParse({ ...valida, nombre: "  " }).success).toBe(false);
    expect(esquemaMascota.safeParse({ ...valida, especie: "dragon" }).success).toBe(false);
  });
});

describe("esquemaReporte", () => {
  const valido = { tipo: "heces", lat: "-11.962", lng: "-77.071", distrito: "Los Olivos", descripcion: "" };

  it("acepta un reporte válido y convierte lat/lng a número", () => {
    const r = esquemaReporte.safeParse(valido);
    expect(r.success).toBe(true);
    expect(r.data?.lat).toBe(-11.962);
  });

  it("rechaza un tipo desconocido", () => {
    expect(esquemaReporte.safeParse({ ...valido, tipo: "basura" }).success).toBe(false);
  });

  it("rechaza coordenadas fuera de Lima Norte o vacías", () => {
    expect(esquemaReporte.safeParse({ ...valido, lat: "-12.5" }).success).toBe(false);
    expect(esquemaReporte.safeParse({ ...valido, lng: "" }).success).toBe(false);
  });

  it("rechaza una descripción de más de 300 caracteres", () => {
    expect(esquemaReporte.safeParse({ ...valido, descripcion: "a".repeat(301) }).success).toBe(false);
  });
});

describe("esquemaAtencion", () => {
  it("acepta una nota y convierte el id", () => {
    const r = esquemaAtencion.safeParse({ reporte_id: "5", nota: "Se limpió la zona" });
    expect(r.success).toBe(true);
    expect(r.data?.reporte_id).toBe(5);
  });

  it("exige una nota de al menos 3 caracteres", () => {
    expect(esquemaAtencion.safeParse({ reporte_id: "5", nota: "ok" }).success).toBe(false);
  });
});

describe("esquemaSancion", () => {
  const valida = { reporte_id: "3", accion: "Amonestación al dueño", multa: "150.50" };

  it("acepta una sanción válida", () => {
    const r = esquemaSancion.safeParse(valida);
    expect(r.success).toBe(true);
    expect(r.data?.multa).toBe(150.5);
  });

  it("acepta multa 0", () => {
    expect(esquemaSancion.safeParse({ ...valida, multa: "0" }).success).toBe(true);
  });

  it("rechaza multa negativa o vacía (no se vuelve 0 sola)", () => {
    expect(esquemaSancion.safeParse({ ...valida, multa: "-5" }).success).toBe(false);
    expect(esquemaSancion.safeParse({ ...valida, multa: "" }).success).toBe(false);
  });

  it("rechaza una acción muy corta", () => {
    expect(esquemaSancion.safeParse({ ...valida, accion: "ab" }).success).toBe(false);
  });
});
