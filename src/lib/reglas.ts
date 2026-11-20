import { distritos, estadosReporte, tiposReporte, type EstadoReporte, type TipoReporte } from "./config";

// ============================================================
// REGLAS DE NEGOCIO PURAS (sin BD, sin React).
// Se prueban con pruebas unitarias en tests/reglas.test.ts
// ============================================================

// Porcentaje (entero) de reportes atendidos. Sin reportes -> 0.
export function porcentajeAtendidos(atendidos: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((atendidos / total) * 100);
}

// ---------- Ubicación ----------
// Recuadro que cubre Lima Norte (igual que los check del SQL de reportes)
export const LIMITES_LIMA_NORTE = { latMin: -12.1, latMax: -11.8, lngMin: -77.2, lngMax: -76.95 };

// Regla: las coordenadas deben caer dentro de Lima Norte
export function coordenadasValidas(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  const l = LIMITES_LIMA_NORTE;
  return lat >= l.latMin && lat <= l.latMax && lng >= l.lngMin && lng <= l.lngMax;
}

// ---------- Foto del reporte ----------
export const FOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const TIPOS_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Regla: la foto pesa máximo 5 MB y es jpg, png o webp.
// Devuelve el mensaje de error, o null si la foto es válida.
export function validarFoto(foto: { size: number; type: string }): string | null {
  if (foto.size <= 0) return "Agrega una foto del lugar";
  if (!(foto.type in TIPOS_FOTO)) return "La foto debe ser JPG, PNG o WebP";
  if (foto.size > FOTO_MAX_BYTES) return "La foto pesa más de 5 MB";
  return null;
}

// Extensión del archivo según su tipo (jpg, png o webp)
export function extensionFoto(tipo: string): string {
  return TIPOS_FOTO[tipo] ?? "jpg";
}

// ---------- Tipos y estados del reporte ----------
export function esTipoReporte(valor: string): valor is TipoReporte {
  return valor in tiposReporte;
}

export function esEstadoReporte(valor: string): valor is EstadoReporte {
  return valor in estadosReporte;
}

// Regla: solo un reporte pendiente se puede atender (pendiente -> atendido)
export function puedeAtenderse(estado: string): boolean {
  return estado === "pendiente";
}

// ---------- Sanciones ----------
export const MULTA_MAXIMA = 100000;

// Regla: la multa es un número entre 0 y S/ 100 000 (0 = solo amonestación)
export function multaValida(multa: number): boolean {
  return Number.isFinite(multa) && multa >= 0 && multa <= MULTA_MAXIMA;
}

// ---------- Indicadores por distrito (panel del admin) ----------
export type IndicadorDistrito = {
  distrito: string;
  reportes: number;
  atendidos: number;
  porcentaje: number; // % de reportes atendidos
  mascotas: number;
};

// Cuenta reportes, atendidos y mascotas de cada distrito de Lima Norte.
// Los distritos salen de config, así siempre aparecen los 4 (aunque tengan 0).
export function indicadoresPorDistrito(
  reportes: { distrito: string; estado: string }[],
  mascotas: { distrito: string }[],
): IndicadorDistrito[] {
  return distritos.map((distrito) => {
    const deEsteDistrito = reportes.filter((r) => r.distrito === distrito);
    const atendidos = deEsteDistrito.filter((r) => r.estado === "atendido").length;
    return {
      distrito,
      reportes: deEsteDistrito.length,
      atendidos,
      porcentaje: porcentajeAtendidos(atendidos, deEsteDistrito.length),
      mascotas: mascotas.filter((m) => m.distrito === distrito).length,
    };
  });
}

// Formato de la multa para mostrar en pantalla: "S/ 150.00"
export function formatearMulta(monto: number, moneda = "S/"): string {
  return `${moneda} ${monto.toFixed(2)}`;
}

// ---------- Mapa ----------
// Posición de un punto dentro del recuadro de Lima Norte, en % (0 a 100).
// x = izquierda -> derecha (longitud), y = arriba -> abajo (latitud, el norte arriba).
export function posicionEnMapa(lat: number, lng: number): { x: number; y: number } {
  const l = LIMITES_LIMA_NORTE;
  const limitar = (n: number) => Math.min(100, Math.max(0, n));
  return {
    x: limitar(((lng - l.lngMin) / (l.lngMax - l.lngMin)) * 100),
    y: limitar(((l.latMax - lat) / (l.latMax - l.latMin)) * 100),
  };
}

// Enlace para ver el punto en OpenStreetMap
export function urlOpenStreetMap(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}
