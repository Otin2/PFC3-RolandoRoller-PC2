"use client";

import { useActionState } from "react";
import { Gavel } from "lucide-react";
import { registrarSancion } from "@/lib/acciones/fiscalizacion";
import { moneda } from "@/lib/config";
import { Aviso, Boton } from "./ui";

const clasesCampo = "campo w-full rounded-control border border-borde bg-superficie px-4 py-2.5 text-base outline-none";

// Botón "Registrar sanción": acción (texto) + multa en soles (puede ser 0)
export function RegistrarSancion({ reporteId, volver }: { reporteId: number; volver: string }) {
  const [estado, enviar, enviando] = useActionState(registrarSancion, {});
  const errores = estado.errores ?? {};

  return (
    <details className="mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-borde bg-superficie px-5 py-2 text-sm font-semibold text-texto hover:bg-seccion [&::-webkit-details-marker]:hidden">
        <Gavel size={16} aria-hidden /> Registrar sanción
      </summary>
      <form action={enviar} className="mt-3 flex flex-col gap-3" noValidate>
        <input type="hidden" name="reporte_id" value={reporteId} />
        <input type="hidden" name="volver" value={volver} />
        {estado.error && <Aviso>{estado.error}</Aviso>}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`accion-${reporteId}`} className="etiqueta text-sm">Acción</label>
          <input
            id={`accion-${reporteId}`}
            name="accion"
            defaultValue={estado.valores?.accion ?? ""}
            placeholder="Ej. Amonestación al dueño de la mascota"
            className={clasesCampo}
            aria-invalid={!!errores.accion}
          />
          {errores.accion && <p className="text-sm text-error">{errores.accion}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`multa-${reporteId}`} className="etiqueta text-sm">Multa ({moneda})</label>
          <input
            id={`multa-${reporteId}`}
            name="multa"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={estado.valores?.multa ?? ""}
            placeholder="0.00"
            className={clasesCampo}
            aria-invalid={!!errores.multa}
          />
          {errores.multa && <p className="text-sm text-error">{errores.multa}</p>}
        </div>

        <div>
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar sanción"}
          </Boton>
        </div>
      </form>
    </details>
  );
}
