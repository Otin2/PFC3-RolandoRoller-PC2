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
