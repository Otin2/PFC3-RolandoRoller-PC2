// ============================================================
// FORMAS DE RECORTE (clip-path) para las fotos y tarjetas.
// Se dibujan una sola vez (en el layout) y se usan con las clases
// .recorte-ondulado, .recorte-festoneado y .recorte-punta (globals.css).
// Las coordenadas van de 0 a 1 (objectBoundingBox), así se adaptan a
// cualquier tamaño. <animate> hace que los bordes se muevan solos.
// ============================================================

// Genera un rectángulo cuyos 4 lados tienen 2 ondas cada uno.
// m = margen hacia adentro, a = altura de la onda, s = sentido (+1 / -1)
function rectanguloOndulado(m: number, a: number, s: 1 | -1): string {
  const f = (n: number) => n.toFixed(3);
  const i = m; // borde interior
  const e = 1 - m; // borde exterior
  const up = s * a;
  return [
    `M${f(i)},${f(i)}`,
    // lado superior
    `C${f(0.2)},${f(i - up)} ${f(0.35)},${f(i + up)} 0.5,${f(i)}`,
    `C${f(0.65)},${f(i - up)} ${f(0.8)},${f(i + up)} ${f(e)},${f(i)}`,
    // lado derecho
    `C${f(e + up)},0.2 ${f(e - up)},0.35 ${f(e)},0.5`,
    `C${f(e + up)},0.65 ${f(e - up)},0.8 ${f(e)},${f(e)}`,
    // lado inferior
    `C${f(0.8)},${f(e + up)} ${f(0.65)},${f(e - up)} 0.5,${f(e)}`,
    `C${f(0.35)},${f(e + up)} ${f(0.2)},${f(e - up)} ${f(i)},${f(e)}`,
    // lado izquierdo
    `C${f(i - up)},0.8 ${f(i + up)},0.65 ${f(i)},0.5`,
    `C${f(i - up)},0.35 ${f(i + up)},0.2 ${f(i)},${f(i)}`,
    "Z",
  ].join(" ");
}

// Fotos: ondas suaves. Marcos del carrusel: ondas marcadas.
const ONDULADO_A = rectanguloOndulado(0.04, 0.045, 1);
const ONDULADO_B = rectanguloOndulado(0.04, 0.045, -1);
const FESTONEADO_A = rectanguloOndulado(0.08, 0.1, 1);

// Tarjeta con punta arriba y abajo (bloques de misión y localizador)
const PUNTA =
  "M0,0.06 Q0,0.045 0.02,0.045 L0.5,0 L0.98,0.045 Q1,0.045 1,0.06 L1,0.94 Q1,0.955 0.98,0.955 L0.5,1 L0.02,0.955 Q0,0.955 0,0.94 Z";

export function Formas() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        {/* Estáticos: se usan en muchas tarjetas, así no se repintan en cada cuadro */}
        <clipPath id="ondulado" clipPathUnits="objectBoundingBox">
          <path d={ONDULADO_A} />
        </clipPath>
        <clipPath id="festoneado" clipPathUnits="objectBoundingBox">
          <path d={FESTONEADO_A} />
        </clipPath>
        {/* Animado: solo para las 4 fotos del hero (pocas, el costo es mínimo) */}
        <clipPath id="ondulado-animado" clipPathUnits="objectBoundingBox">
          <path d={ONDULADO_A}>
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values={`${ONDULADO_A};${ONDULADO_B};${ONDULADO_A}`} />
          </path>
        </clipPath>
        <clipPath id="punta" clipPathUnits="objectBoundingBox">
          <path d={PUNTA} />
        </clipPath>
      </defs>
    </svg>
  );
}
