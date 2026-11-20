// ============================================================
// REGLAS DE NEGOCIO PURAS (sin BD, sin React).
// Se prueban con pruebas unitarias en tests/reglas.test.ts
// ============================================================

// Porcentaje (entero) de reportes atendidos. Sin reportes -> 0.
export function porcentajeAtendidos(atendidos: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((atendidos / total) * 100);
}
