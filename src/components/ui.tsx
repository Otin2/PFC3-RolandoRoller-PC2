import Link from "next/link";

// ============================================================
// Componentes de interfaz reutilizables (sin lógica de negocio).
// Estilo PataLimpia: botones redondeados, tarjetas blancas con borde
// suave y casi sin sombras. Mobile-first.
// ============================================================

type VarianteBoton = "principal" | "secundario" | "texto";

const estilosBoton: Record<VarianteBoton, string> = {
  principal: "bg-acento text-sobre-acento hover:bg-acento-hover",
  secundario: "border border-borde bg-superficie text-texto hover:bg-seccion",
  texto: "text-acento hover:bg-seccion",
};

const baseBoton =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50";

export function BotonEnlace({
  href,
  children,
  variante = "principal",
}: {
  href: string;
  children: React.ReactNode;
  variante?: VarianteBoton;
}) {
  return (
    <Link href={href} className={`${baseBoton} ${estilosBoton[variante]}`}>
      {children}
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
    </button>
  );
}

// Contenedor centrado con ancho máximo
export function Contenedor({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

// Antetítulo pequeño en mayúsculas
export function Antetitulo({ children }: { children: React.ReactNode }) {
  return <p className="antetitulo text-xs text-acento">{children}</p>;
}

// Encabezado de cada página interna: antetítulo, título y descripción
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
    <div className="flex flex-col gap-4 pb-6 pt-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {antetitulo && (
          <div className="mb-2">
            <Antetitulo>{antetitulo}</Antetitulo>
          </div>
        )}
        <h1 className="titulo-pagina">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-xl text-texto-2">{descripcion}</p>}
      </div>
      {accion && <div className="flex flex-wrap gap-3">{accion}</div>}
    </div>
  );
}

// Tarjeta de contenido
export function Tarjeta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-tarjeta border border-borde-suave bg-superficie p-5 sm:p-6 ${className}`}>
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
    <div className="rounded-tarjeta border border-dashed border-borde bg-seccion px-6 py-12 text-center">
      <p className="text-lg font-bold text-texto">{titulo}</p>
      {descripcion && <p className="mx-auto mt-2 max-w-md text-sm text-texto-2">{descripcion}</p>}
      {accion && <div className="mt-5 flex justify-center">{accion}</div>}
    </div>
  );
}

// Mensaje de error, éxito o información
export function Aviso({
  tipo = "error",
  children,
}: {
  tipo?: "error" | "exito" | "info";
  children: React.ReactNode;
}) {
  const colores = {
    error: "border-error/40 bg-red-50 text-error",
    exito: "border-acento/30 bg-acento-suave text-acento-hover",
    info: "border-resalte/50 bg-resalte-suave text-texto",
  };
  return (
    <div role="alert" className={`rounded-control border px-4 py-3 text-sm ${colores[tipo]}`}>
      {children}
    </div>
  );
}

// Etiqueta pequeña (estado, rol). tono: neutro | pendiente (ámbar) | atendido (verde)
export function Chip({
  children,
  tono = "neutro",
}: {
  children: React.ReactNode;
  tono?: "neutro" | "pendiente" | "atendido";
}) {
  const colores = {
    neutro: "bg-seccion text-texto-2",
    pendiente: "bg-resalte-suave text-amber-800",
    atendido: "bg-acento-suave text-acento-hover",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colores[tono]}`}>
      {children}
    </span>
  );
}

// Píldora de filtro (se activa con un enlace con query params)
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        activa
          ? "border-acento bg-acento text-sobre-acento"
          : "border-borde bg-superficie text-texto-2 hover:border-acento hover:text-acento"
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
    <div className="overflow-x-auto rounded-tarjeta border border-borde-suave bg-superficie">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-seccion text-texto-2">
          <tr>
            {columnas.map((c, i) => (
              <th key={`${c}-${i}`} className="etiqueta px-4 py-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borde-suave">{children}</tbody>
      </table>
    </div>
  );
}

export function Celda({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}
