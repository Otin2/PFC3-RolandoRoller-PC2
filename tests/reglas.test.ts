import { describe, expect, it } from "vitest";
import {
  atendidoReciente,
  coordenadasValidas,
  esEstadoReporte,
  esTipoReporte,
  extensionFoto,
  fechaLimiteAviso,
  formatearMulta,
  indicadoresPorDistrito,
  multaValida,
  porcentajeAtendidos,
  posicionEnMapa,
  puedeAtenderse,
  urlOpenStreetMap,
  validarFoto,
} from "@/lib/reglas";

describe("coordenadasValidas (Lima Norte)", () => {
  it("acepta un punto de Los Olivos", () => {
    expect(coordenadasValidas(-11.962, -77.071)).toBe(true);
  });

  it("acepta los bordes del recuadro", () => {
    expect(coordenadasValidas(-12.1, -77.2)).toBe(true);
    expect(coordenadasValidas(-11.8, -76.95)).toBe(true);
  });

  it("rechaza un punto fuera de Lima Norte (Miraflores)", () => {
    expect(coordenadasValidas(-12.12, -77.03)).toBe(false);
  });

  it("rechaza valores que no son números", () => {
    expect(coordenadasValidas(Number.NaN, -77)).toBe(false);
  });
});

describe("tipos y estados del reporte", () => {
  it("reconoce los 3 tipos permitidos", () => {
    expect(esTipoReporte("heces")).toBe(true);
    expect(esTipoReporte("orina")).toBe(true);
    expect(esTipoReporte("mascota_suelta")).toBe(true);
    expect(esTipoReporte("basura")).toBe(false);
  });

  it("reconoce los 2 estados permitidos", () => {
    expect(esEstadoReporte("pendiente")).toBe(true);
    expect(esEstadoReporte("atendido")).toBe(true);
    expect(esEstadoReporte("cerrado")).toBe(false);
  });

  it("solo un reporte pendiente se puede atender", () => {
    expect(puedeAtenderse("pendiente")).toBe(true);
    expect(puedeAtenderse("atendido")).toBe(false);
  });
});

describe("porcentajeAtendidos", () => {
  it("calcula el porcentaje redondeado", () => {
    expect(porcentajeAtendidos(1, 3)).toBe(33);
    expect(porcentajeAtendidos(2, 4)).toBe(50);
  });

  it("devuelve 0 si no hay reportes (sin dividir entre 0)", () => {
    expect(porcentajeAtendidos(0, 0)).toBe(0);
  });
});

describe("indicadoresPorDistrito", () => {
  const reportes = [
    { distrito: "Comas", estado: "atendido" },
    { distrito: "Comas", estado: "pendiente" },
    { distrito: "Los Olivos", estado: "pendiente" },
  ];
  const mascotas = [{ distrito: "Comas" }, { distrito: "Comas" }, { distrito: "Independencia" }];

  it("siempre devuelve los 4 distritos", () => {
    expect(indicadoresPorDistrito([], [])).toHaveLength(4);
  });

  it("cuenta reportes, atendidos, porcentaje y mascotas de Comas", () => {
    const comas = indicadoresPorDistrito(reportes, mascotas).find((d) => d.distrito === "Comas");
    expect(comas).toEqual({ distrito: "Comas", reportes: 2, atendidos: 1, porcentaje: 50, mascotas: 2 });
  });

  it("un distrito sin reportes queda en 0", () => {
    const sm = indicadoresPorDistrito(reportes, mascotas).find((d) => d.distrito === "San Martín de Porres");
    expect(sm).toEqual({ distrito: "San Martín de Porres", reportes: 0, atendidos: 0, porcentaje: 0, mascotas: 0 });
  });
});

describe("multaValida", () => {
  it("acepta 0 (solo amonestación) y montos positivos", () => {
    expect(multaValida(0)).toBe(true);
    expect(multaValida(250.5)).toBe(true);
  });

  it("rechaza negativos, NaN y montos exagerados", () => {
    expect(multaValida(-1)).toBe(false);
    expect(multaValida(Number.NaN)).toBe(false);
    expect(multaValida(1_000_000)).toBe(false);
  });
});

describe("validarFoto", () => {
  it("acepta jpg, png y webp de hasta 5 MB", () => {
    expect(validarFoto({ size: 1000, type: "image/jpeg" })).toBeNull();
    expect(validarFoto({ size: 1000, type: "image/png" })).toBeNull();
    expect(validarFoto({ size: 5 * 1024 * 1024, type: "image/webp" })).toBeNull();
  });

  it("rechaza una foto de más de 5 MB", () => {
    expect(validarFoto({ size: 5 * 1024 * 1024 + 1, type: "image/jpeg" })).toBe("La foto pesa más de 5 MB");
  });

  it("rechaza tipos que no son imagen permitida", () => {
    expect(validarFoto({ size: 1000, type: "application/pdf" })).toBe("La foto debe ser JPG, PNG o WebP");
  });

  it("rechaza un archivo vacío (no se eligió foto)", () => {
    expect(validarFoto({ size: 0, type: "" })).toBe("Agrega una foto del lugar");
  });

  it("devuelve la extensión según el tipo", () => {
    expect(extensionFoto("image/png")).toBe("png");
    expect(extensionFoto("image/webp")).toBe("webp");
    expect(extensionFoto("image/jpeg")).toBe("jpg");
  });
});

describe("formatearMulta", () => {
  it("muestra soles con 2 decimales", () => {
    expect(formatearMulta(150)).toBe("S/ 150.00");
    expect(formatearMulta(0)).toBe("S/ 0.00");
  });
});

describe("mapa de Lima Norte", () => {
  it("la esquina noroeste va arriba a la izquierda y la sureste abajo a la derecha", () => {
    expect(posicionEnMapa(-11.8, -77.2)).toEqual({ x: 0, y: 0 });
    expect(posicionEnMapa(-12.1, -76.95)).toEqual({ x: 100, y: 100 });
  });

  it("el centro del recuadro queda en 50% y 50%", () => {
    const centro = posicionEnMapa(-11.95, -77.075);
    expect(centro.x).toBeCloseTo(50);
    expect(centro.y).toBeCloseTo(50);
  });

  it("un punto fuera del recuadro se limita al borde", () => {
    expect(posicionEnMapa(-13, -80)).toEqual({ x: 0, y: 100 });
  });

  it("arma el enlace de OpenStreetMap con las coordenadas", () => {
    expect(urlOpenStreetMap(-11.96, -77.07)).toBe(
      "https://www.openstreetmap.org/?mlat=-11.96&mlon=-77.07#map=17/-11.96/-77.07",
    );
  });
});

describe("aviso al vecino (últimos 7 días)", () => {
  const ahora = new Date("2026-06-10T12:00:00Z");

  it("avisa si se atendió hace 2 días", () => {
    expect(atendidoReciente("2026-06-08T12:00:00Z", ahora)).toBe(true);
  });

  it("no avisa si se atendió hace más de 7 días o no se atendió", () => {
    expect(atendidoReciente("2026-06-01T12:00:00Z", ahora)).toBe(false);
    expect(atendidoReciente(null, ahora)).toBe(false);
  });

  it("la fecha límite es 7 días antes", () => {
    expect(fechaLimiteAviso(ahora).toISOString()).toBe("2026-06-03T12:00:00.000Z");
  });
});
