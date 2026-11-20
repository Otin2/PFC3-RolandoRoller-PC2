"use client";

import { useFormStatus } from "react-dom";

function BotonEnvio({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="font-medium text-error underline disabled:opacity-50">
      {pending ? "Eliminando..." : texto}
    </button>
  );
}

// Botón que pide confirmación antes de ejecutar una acción de borrado
export function BotonEliminar({
  accion,
  confirmacion,
  texto = "Eliminar",
}: {
  accion: () => Promise<void>;
  confirmacion: string;
  texto?: string;
}) {
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (!window.confirm(confirmacion)) e.preventDefault();
      }}
    >
      <BotonEnvio texto={texto} />
    </form>
  );
}
