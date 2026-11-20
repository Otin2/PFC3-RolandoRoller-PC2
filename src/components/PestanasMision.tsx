"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { mision as Contenido } from "@/lib/contenido";

// Bloque de misión: pestañas a la izquierda, texto al centro y foto a la derecha.
// La tarjeta completa "se abre" desde una línea al aparecer (clase .abrir).
export function PestanasMision({ datos, hrefs }: { datos: typeof Contenido; hrefs: string[] }) {
  const [activa, setActiva] = useState(0);
  const p = datos.pestanas[activa];

  return (
    <div className="abrir recorte-punta bg-seccion px-6 py-20 sm:px-12 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr_300px] lg:items-center">
        {/* Pestañas laterales */}
        <ul className="flex flex-wrap gap-2 lg:flex-col">
          {datos.pestanas.map((pes, i) => (
            <li key={pes.nombre}>
              <button
                type="button"
                onClick={() => setActiva(i)}
                className={`flex w-full items-center justify-between gap-4 rounded-[15px] px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                  i === activa ? "bg-resalte text-fondo" : "text-resalte hover:text-white"
                }`}
              >
                {pes.nombre}
                <span aria-hidden>{i === activa ? "›" : "+"}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Texto (key: se anima al cambiar) */}
        <div key={activa} className="animate-subir">
          <p className="text-2xl leading-snug text-white sm:text-3xl">{p.titulo}</p>
          <p className="mt-6 text-base text-resalte">{p.texto}</p>
          <Link
            href={hrefs[activa % hrefs.length]}
            className="mt-8 inline-block rounded-[15px] bg-acento px-4 py-2.5 font-display text-lg uppercase tracking-[0.03em] text-white hover:bg-acento-hover"
          >
            {p.boton}
          </Link>
        </div>

        {/* Foto con borde ondulado que gira un poco según la pestaña */}
        <div
          className="recorte-ondulado relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden transition-transform duration-700"
          style={{ transform: `rotate(${(activa - 1.5) * 3}deg)` }}
        >
          <Image src={datos.fotoPestanas} alt="" fill sizes="300px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}
