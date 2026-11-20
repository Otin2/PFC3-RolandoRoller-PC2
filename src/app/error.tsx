"use client";

import { Boton } from "@/components/ui";

// Si algo falla (ej. Supabase no responde), se muestra esto en vez de una pantalla en blanco
export default function ErrorPagina({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-24 text-center">
      <h1 className="titulo-pagina">Algo salió mal</h1>
      <p className="mt-3 text-texto-2">No pudimos cargar la información. Inténtalo de nuevo.</p>
      <div className="mt-8">
        <Boton onClick={reset}>Reintentar</Boton>
      </div>
    </div>
  );
}
