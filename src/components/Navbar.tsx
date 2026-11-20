import Link from "next/link";
import { PawPrint } from "lucide-react";
import { caso, roles } from "@/lib/config";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { cerrarSesion } from "@/lib/acciones/auth";
import { Chip } from "./ui";

const enlace = "text-sm font-medium text-texto-2 transition-colors hover:text-acento";

// Barra superior clara con el logo (huella) y el acceso según la sesión
export async function Navbar() {
  const usuario = await obtenerUsuarioActual();

  return (
    <header className="sticky top-0 z-30 border-b border-borde-suave bg-superficie/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-texto">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-acento text-white">
            <PawPrint size={20} aria-hidden />
          </span>
          {caso.nombre}
        </Link>

        <nav aria-label="Menú principal" className="hidden items-center gap-6 md:flex">
          <Link href="/mapa" className={enlace}>Mapa</Link>
          {usuario && <Link href="/panel" className={enlace}>Mi panel</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <Link href="/panel" className={`${enlace} md:hidden`}>Panel</Link>
              <span className="hidden text-sm font-medium text-texto lg:inline">{usuario.nombre}</span>
              {usuario.rol && <Chip>{roles[usuario.rol].etiqueta}</Chip>}
              <form action={cerrarSesion}>
                <button
                  type="submit"
                  className="rounded-full border border-borde px-4 py-1.5 text-sm font-semibold text-texto hover:bg-seccion"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={`${enlace} hidden sm:inline`}>Iniciar sesión</Link>
              <Link
                href="/registro"
                className="rounded-full bg-acento px-4 py-1.5 text-sm font-semibold text-white hover:bg-acento-hover"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
