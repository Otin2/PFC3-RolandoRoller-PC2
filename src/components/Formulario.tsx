"use client";

import { useActionState } from "react";
import type { EstadoFormulario } from "@/lib/acciones/estado";
import { Aviso, Boton } from "./ui";

export type Campo = {
  nombre: string;
  etiqueta: string;
  tipo?: "text" | "email" | "password" | "number" | "select";
  opciones?: { valor: string; etiqueta: string }[];
  valorInicial?: string;
  ayuda?: string;
  paso?: string; // "0.01" para precios
  autoComplete?: string;
};

// Formulario genérico: dibuja los campos, envía a una server action
// y muestra los errores que devuelve Zod debajo de cada campo.
export function Formulario({
  accion,
  campos,
  textoBoton,
}: {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  campos: Campo[];
  textoBoton: string;
}) {
  const [estado, enviar, enviando] = useActionState(accion, {});

  return (
    <form action={enviar} className="flex flex-col gap-5" noValidate>
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.exito && <Aviso tipo="exito">{estado.exito}</Aviso>}

      {campos.map((campo) => {
        const error = estado.errores?.[campo.nombre];
        const valor = estado.valores?.[campo.nombre] ?? campo.valorInicial ?? "";
        const id = `campo-${campo.nombre}`;
        const clases = `campo w-full rounded-control border bg-superficie px-4 py-3 text-base outline-none transition-colors placeholder:text-tenue focus:border-texto ${
          error ? "border-acento" : "border-borde"
        }`;

        return (
          <div key={campo.nombre} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="etiqueta text-sm font-medium text-resalte">
              {campo.etiqueta}
            </label>

            {campo.tipo === "select" ? (
              <select id={id} name={campo.nombre} defaultValue={valor} className={clases} aria-invalid={!!error}>
                <option value="" disabled>
                  Elige una opción
                </option>
                {campo.opciones?.map((op) => (
                  <option key={op.valor} value={op.valor}>
                    {op.etiqueta}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={campo.nombre}
                type={campo.tipo ?? "text"}
                defaultValue={campo.tipo === "password" ? "" : valor}
                step={campo.paso}
                min={campo.tipo === "number" ? 0 : undefined}
                autoComplete={campo.autoComplete}
                className={clases}
                aria-invalid={!!error}
              />
            )}

            {error ? (
              <p className="text-sm text-error">{error}</p>
            ) : (
              campo.ayuda && <p className="text-sm text-texto-3">{campo.ayuda}</p>
            )}
          </div>
        );
      })}

      <div>
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : textoBoton}
        </Boton>
      </div>
    </form>
  );
}
