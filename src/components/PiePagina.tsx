import Link from "next/link";
import { PawPrint } from "lucide-react";
import { caso, distritos } from "@/lib/config";

// Pie de página verde oscuro
export function PiePagina() {
  return (
    <footer className="bg-oscuro text-sobre-oscuro">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3 sm:px-6">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <PawPrint size={20} aria-hidden /> {caso.nombre}
          </p>
          <p className="mt-2 opacity-75">{caso.eslogan}</p>
        </div>
        <div>
          <p className="font-semibold">Distritos</p>
          <ul className="mt-2 space-y-1 opacity-75">
            {distritos.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Enlaces</p>
          <ul className="mt-2 space-y-1 opacity-75">
            <li><Link href="/mapa" className="hover:underline">Mapa de puntos críticos</Link></li>
            <li><Link href="/registro" className="hover:underline">Crear cuenta</Link></li>
            <li><Link href="/login" className="hover:underline">Iniciar sesión</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/15 px-4 py-4 text-center text-xs opacity-60">
        Proyecto Final de Carrera III · USIL · Rolando Roller V.
      </p>
    </footer>
  );
}
