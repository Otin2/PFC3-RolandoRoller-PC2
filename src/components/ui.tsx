import Link from "next/link";

// ============================================================
// Componentes de interfaz reutilizables (sin lógica de negocio).
// Estilo según la guía de diseño (DESIGN.md): botones de 15px de radio,
// letra condensada en mayúsculas, superficies planas sin sombras.
// ============================================================

type VarianteBoton = "principal" | "secundario" | "texto";

const estilosBoton: Record<VarianteBoton, string> = {
  // Primary CTA: relleno rojo, texto blanco
  principal: "bg-acento text-sobre-acento hover:bg-acento-hover",
  // Ghost CTA: transparente con borde blanco de 1px
  secundario: "border border-white text-white hover:bg-white hover:text-fondo",
  texto: "text-resalte hover:text-white",
};

const baseBoton =
  "group inline-flex items-center justify-center gap-1.5 rounded-control px-3.5 py-2 font-display text-[16px] uppercase tracking-[0.03em] transition-all duration-300 disabled:opacity-50";

function Flecha() {
  return (
    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
      ›
    </span>
  );
}

// chevrones = estilo "› TEXTO ‹" de los botones grandes
export function BotonEnlace({
  href,
  children,
  variante = "principal",
  chevrones = false,
}: {
  href: string;
  children: React.ReactNode;
  variante?: VarianteBoton;
  chevrones?: boolean;
}) {
  if (chevrones) {
    return (
      <Link href={href} className={`${baseBoton} ${estilosBoton[variante]} px-4 py-2.5`}>
        <span aria-hidden className="text-xs transition-transform duration-300 group-hover:translate-x-1">›</span>
        {children}
        <span aria-hidden className="text-xs transition-transform duration-300 group-hover:-translate-x-1">‹</span>
      </Link>
    );
  }
  return (
    <Link href={href} className={`${baseBoton} ${estilosBoton[variante]}`}>
      {children}
      {variante !== "texto" && <Flecha />}
    </Link>
  );
}

export function Boton({
  children,
  variante = "principal",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBoton }) {
  return (
    <button {...props} className={`${baseBoton} ${estilosBoton[variante]}`}>
      {children}
      {variante !== "texto" && <Flecha />}
    </button>
  );
}

// Contenedor centrado con ancho máximo de 1280px
export function Contenedor({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">{children}</div>;
}

// Antetítulo pequeño en mayúsculas, rojo y entre ◂ ▸
export function Antetitulo({ children }: { children: React.ReactNode }) {
  return <p className="antetitulo etiqueta text-sm font-medium text-acento">{children}</p>;
}

// Encabezado de cada página interna: centrado, antetítulo ◂ ▸ y título gigante
export function Encabezado({
  titulo,
  antetitulo,
  descripcion,
  accion,
}: {
  titulo: string;
  antetitulo?: string;
  descripcion?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-8 pb-8 pt-20 text-center">
      <div>
        {antetitulo && (
          <div className="mb-5">
            <Antetitulo>{antetitulo}</Antetitulo>
          </div>
        )}
        <h1 className="titulo-pagina">{titulo}</h1>
        {descripcion && <p className="mx-auto mt-6 max-w-xl text-texto-2">{descripcion}</p>}
      </div>
      {accion && <div className="flex flex-wrap justify-center gap-3">{accion}</div>}
    </div>
  );
}

// Tarjeta de contenido. destacada = radio grande de 38px (feature card)
export function Tarjeta({ children, destacada = false }: { children: React.ReactNode; destacada?: boolean }) {
  return (
    <div className={`border border-black bg-superficie ${destacada ? "rounded-[38px] p-8" : "rounded-tarjeta p-6"}`}>
      {children}
    </div>
  );
}

// Estado vacío: cuando una consulta no devuelve filas
export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="rounded-[38px] border border-black bg-seccion px-6 py-16 text-center">
      <p className="font-display text-4xl uppercase tracking-[0.03em] text-acento">{titulo}</p>
      {descripcion && <p className="mx-auto mt-4 max-w-md text-base text-texto-2">{descripcion}</p>}
      {accion && <div className="mt-6 flex justify-center">{accion}</div>}
    </div>
  );
}

// Mensaje de error o de éxito (sin colores nuevos: rosa sobre vino, borde rojo si es error)
export function Aviso({
  tipo = "error",
  children,
}: {
  tipo?: "error" | "exito";
  children: React.ReactNode;
}) {
  const color = tipo === "error" ? "border-acento bg-acento/15" : "border-resalte bg-superficie";
  return (
    <div role="alert" className={`rounded-control border px-4 py-3 text-sm text-resalte ${color}`}>
      {children}
    </div>
  );
}

// Etiqueta pequeña (estado, rol): píldora rosa en mayúsculas
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-control bg-resalte px-3 py-1 text-xs font-medium uppercase tracking-[0.02em] text-fondo">
      {children}
    </span>
  );
}

// Píldora de filtro (DESIGN.md: filter pill toggle). activa = fondo rojo
export function PildoraFiltro({
  href,
  activa,
  children,
}: {
  href: string;
  activa: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-control border px-4 py-2 font-display text-base uppercase tracking-[0.03em] transition-colors ${
        activa ? "border-acento bg-acento text-sobre-acento" : "border-transparent text-texto-2 hover:border-resalte hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

// Tabla simple y responsive (scroll horizontal en móvil)
export function Tabla({
  columnas,
  children,
}: {
  columnas: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="revelar overflow-x-auto rounded-tarjeta border border-black">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-black text-texto-2">
          <tr>
            {columnas.map((c, i) => (
              <th key={`${c}-${i}`} className="etiqueta px-4 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black bg-seccion">{children}</tbody>
      </table>
    </div>
  );
}

export function Celda({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}
