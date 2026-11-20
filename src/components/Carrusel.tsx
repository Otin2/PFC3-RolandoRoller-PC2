"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

export type ItemCarrusel = {
  id: number | string;
  nombre: string;
  detalle: string; // ej. "S/ 25.00 · Stock: 50"
  foto: string;
  hrefPrincipal: string; // botón relleno ("Ver más")
  hrefSecundario: string; // botón con pin ("Dónde")
};

export type GrupoCarrusel = { id: number | string; nombre: string; items: ItemCarrusel[] };

// Pestañas con contador + carrusel horizontal (como la sección de productos
// de la página de referencia). Cada tarjeta tiene un marco festoneado animado.
export function Carrusel({
  grupos,
  textoPrincipal,
  textoSecundario,
}: {
  grupos: GrupoCarrusel[];
  textoPrincipal: string;
  textoSecundario: string;
}) {
  const [grupoActivo, setGrupoActivo] = useState(0);
  const [pagina, setPagina] = useState(0);
  const pista = useRef<HTMLUListElement>(null);
  const items = grupos[grupoActivo]?.items ?? [];

  // Calcula la "página" visible según cuánto se deslizó
  function alDeslizar() {
    const el = pista.current;
    if (!el) return;
    setPagina(Math.round(el.scrollLeft / el.clientWidth));
  }

  function mover(direccion: 1 | -1) {
    const el = pista.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  }

  function cambiarGrupo(i: number) {
    setGrupoActivo(i);
    setPagina(0);
    pista.current?.scrollTo({ left: 0 });
  }

  const paginas = Math.max(1, Math.ceil(items.length / 4));

  return (
    <div>
      {/* Pestañas con número */}
      <div role="tablist" className="flex flex-wrap justify-center gap-x-10 gap-y-4">
        {grupos.map((g, i) => (
          <button
            key={g.id}
            role="tab"
            type="button"
            aria-selected={i === grupoActivo}
            onClick={() => cambiarGrupo(i)}
            className={`relative flex items-start gap-1.5 font-display text-4xl uppercase tracking-[0.02em] transition-colors sm:text-5xl ${
              i === grupoActivo ? "text-white underline decoration-2 underline-offset-[10px]" : "text-resalte hover:text-white"
            }`}
          >
            {g.nombre}
            <span
              className={`mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1 font-sans text-[11px] font-semibold tracking-normal ${
                i === grupoActivo ? "border-white bg-white text-fondo" : "border-resalte text-resalte"
              }`}
            >
              {g.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Pista del carrusel */}
      <div className="relative mt-12">
        <ul
          ref={pista}
          onScroll={alDeslizar}
          className="sin-barra flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 sm:px-16"
        >
          {items.map((item, i) => (
            <li
              key={`${grupoActivo}-${item.id}`}
              className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[calc(25%-18px)]"
              style={{ animation: `subir 0.7s cubic-bezier(0.2,0.8,0.2,1) ${i * 70}ms both` }}
            >
              {/* Marco festoneado oscuro con la foto adentro */}
              <div className="group relative aspect-square">
                <div className="recorte-festoneado absolute inset-0 bg-seccion" />
                <div className="recorte-ondulado absolute inset-[18%] overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Image src={item.foto} alt={item.nombre} fill sizes="(max-width: 640px) 60vw, 20vw" className="object-cover" />
                </div>
              </div>
              <p className="mt-6 text-center font-display text-2xl uppercase leading-[1.05] tracking-[0.02em] text-white">
                {item.nombre}
              </p>
              <p className="mt-2 text-center text-sm text-resalte tabular-nums">{item.detalle}</p>
              <div className="mt-5 flex items-center justify-center gap-4">
                <Link
                  href={item.hrefPrincipal}
                  className="rounded-control bg-acento px-3 py-1.5 font-display text-[15px] uppercase tracking-[0.03em] text-white transition-colors hover:bg-acento-hover"
                >
                  {textoPrincipal}
                </Link>
                <Link
                  href={item.hrefSecundario}
                  className="font-display text-[15px] uppercase tracking-[0.03em] text-white transition-colors hover:text-resalte"
                >
                  {textoSecundario} ⌖
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {/* Flechas cuadradas rojas a los costados */}
        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Anterior"
          className="absolute left-2 top-[22%] hidden h-12 w-12 items-center justify-center rounded-[15px] bg-acento text-xl text-white transition-transform hover:scale-110 disabled:opacity-40 sm:flex"
          disabled={pagina === 0}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Siguiente"
          className="absolute right-2 top-[22%] hidden h-12 w-12 items-center justify-center rounded-[15px] bg-acento text-xl text-white transition-transform hover:scale-110 disabled:opacity-40 sm:flex"
          disabled={pagina >= paginas - 1}
        >
          ›
        </button>
      </div>

      {/* Puntos de paginación */}
      <div className="mt-10 flex justify-center gap-2">
        {Array.from({ length: paginas }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full border border-resalte transition-colors ${i === pagina ? "bg-resalte" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
