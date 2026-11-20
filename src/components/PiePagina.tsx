import { caso } from "@/lib/config";

export function PiePagina() {
  return (
    <footer className="overflow-hidden bg-oscuro text-sobre-oscuro mt-0">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-12 text-sm sm:flex-row sm:justify-between sm:px-6">
        <p className="font-semibold uppercase tracking-wide">{caso.nombre}</p>
        <p className="opacity-70">Proyecto Final de Carrera III · USIL · Rolando Roller V.</p>
      </div>
      {/* nombre gigante que sale del borde inferior */}
      <p
        aria-hidden
        className="translate-y-[18%] select-none text-center font-display text-[22vw] leading-[0.8] uppercase text-acento block"
      >
        {caso.nombre}
      </p>
    </footer>
  );
}
