"use client";

import { useActionState } from "react";
import { ClipboardCheck } from "lucide-react";
import { atenderReporte } from "@/lib/acciones/fiscalizacion";
import { Aviso, Boton } from "./ui";

// Botón "Atender": abre un formulario con la nota de atención (obligatoria)
export function AtenderReporte({ reporteId, volver }: { reporteId: number; volver: string }) {
  const [estado, enviar, enviando] = useActionState(atenderReporte, {});

  return (
    <details className="group mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-acento px-5 py-2 text-sm font-semibold text-white hover:bg-acento-hover [&::-webkit-details-marker]:hidden">
        <ClipboardCheck size={16} aria-hidden /> Atender
      </summary>
      <form action={enviar} className="mt-3 flex flex-col gap-3" noValidate>
        <input type="hidden" name="reporte_id" value={reporteId} />
        <input type="hidden" name="volver" value={volver} />
        {estado.error && <Aviso>{estado.error}</Aviso>}
        <label htmlFor={`nota-${reporteId}`} className="etiqueta text-sm">Nota de atención</label>
        <textarea
          id={`nota-${reporteId}`}
          name="nota"
          rows={2}
          maxLength={300}
          defaultValue={estado.valores?.nota ?? ""}
          placeholder="Ej. Se limpió la zona y se avisó a los vecinos"
          className="campo w-full rounded-control border border-borde bg-superficie px-4 py-2.5 text-base outline-none"
          aria-invalid={!!estado.errores?.nota}
        />
        {estado.errores?.nota && <p className="text-sm text-error">{estado.errores.nota}</p>}
        <div>
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Guardando..." : "Marcar como atendido"}
          </Boton>
        </div>
      </form>
    </details>
  );
}
