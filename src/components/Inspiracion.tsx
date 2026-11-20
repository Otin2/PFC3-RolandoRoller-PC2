"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { inspiracion as Contenido } from "@/lib/contenido";

// Sección "¿Buscas ideas?": píldoras que cambian el título gigante
// y dos tarjetas con fotos de bordes ondulados que se mueven.
export function Inspiracion({ datos, hrefTodo }: { datos: typeof Contenido; hrefTodo: string }) {
  const [activa, setActiva] = useState(0);
  const pestana = datos.pestanas[activa];

  return (
    <div>
      <p className="text-center font-display text-2xl tracking-[0.02em] text-resalte">{datos.titulo}</p>

      {/* Píldoras */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {datos.pestanas.map((p, i) => (
          <button
            key={p.nombre}
            type="button"
            onClick={() => setActiva(i)}
            className={`rounded-[15px] px-4 py-2 font-display text-lg uppercase tracking-[0.03em] transition-colors ${
              i === activa ? "bg-resalte text-fondo" : "bg-seccion text-resalte hover:text-white"
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {/* Título gigante (key = se vuelve a animar al cambiar de pestaña) */}
      <div key={activa} className="mt-10 text-center">
        <p className="antetitulo etiqueta animate-subir text-base font-semibold text-acento">{pestana.antetitulo}</p>
        <h2 className="titulo-seccion mt-3 animate-subir [animation-delay:120ms]">{pestana.titulo}</h2>
      </div>

      {/* Tarjetas con foto ondulada */}
      <div key={`t-${activa}`} className="mt-14 grid gap-10 md:grid-cols-2 md:gap-14">
        {pestana.tarjetas.map((t, i) => (
          <article
            key={t.titulo}
            className="group text-center"
            style={{ animation: `subir 0.8s cubic-bezier(0.2,0.8,0.2,1) ${200 + i * 150}ms both` }}
          >
            <div className={`recorte-ondulado relative aspect-[4/5] overflow-hidden ${i === 1 ? "md:mt-10" : ""}`}>
              <Image
                src={t.foto}
                alt={t.titulo}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <span className="mt-6 inline-block rounded-md border border-resalte px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-resalte">
              {t.etiqueta}
            </span>
            <h3 className="mt-3 font-display text-3xl uppercase tracking-[0.02em] text-white sm:text-4xl">{t.titulo}</h3>
            <p className="mt-3 flex justify-center gap-5 font-display text-lg tracking-[0.02em] text-resalte">
              {t.datos.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </p>
            <Link
              href={hrefTodo}
              className="mt-6 inline-block rounded-[15px] bg-acento px-3.5 py-2 font-display text-[16px] uppercase tracking-[0.03em] text-white transition-colors hover:bg-acento-hover"
            >
              Ver más
            </Link>
          </article>
        ))}
      </div>

      {/* "Ver todo" entre dos líneas */}
      <div className="mt-16 flex items-center gap-6">
        <span className="h-px flex-1 bg-resalte/60" />
        <Link
          href={hrefTodo}
          className="group rounded-[15px] bg-acento px-5 py-2.5 font-display text-xl uppercase tracking-[0.03em] text-white hover:bg-acento-hover"
        >
          <span className="mr-2 inline-block text-xs transition-transform group-hover:translate-x-1">›</span>
          Ver todo
          <span className="ml-2 inline-block text-xs transition-transform group-hover:-translate-x-1">‹</span>
        </Link>
        <span className="h-px flex-1 bg-resalte/60" />
      </div>
    </div>
  );
}
