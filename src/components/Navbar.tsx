import Link from "next/link";
import { caso, entidades, roles } from "@/lib/config";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { menuPorRol } from "@/lib/menu";
import { cerrarSesion } from "@/lib/acciones/auth";
import { Chip } from "./ui";

// Enlaces de la barra: letra condensada, mayúsculas y flecha ⌄
const enlace =
  "relative font-display text-[15px] uppercase tracking-[0.03em] text-white transition-colors hover:text-resalte";

// Botones de la derecha: píldoras vino oscuro sobre la barra roja
const pildoraBarra =
  "rounded-control bg-seccion px-3.5 py-1.5 font-display text-[15px] uppercase tracking-[0.03em] text-white transition-colors hover:bg-black";

export async function Navbar() {
  const usuario = await obtenerUsuarioActual();
  const menu = menuPorRol(usuario?.rol ?? null);

  return (
    // Barra roja flotante en forma de píldora, fija arriba al hacer scroll
    <header className="sticky top-3 z-30 mx-3 mt-3 rounded-control bg-acento sm:mx-5">
      <div className="flex h-[52px] w-full items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="font-display text-[24px] font-normal uppercase tracking-[0.01em] text-white"
        >
          {caso.nombre}
        </Link>

        {usuario && (
          <nav aria-label="Menú principal" className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/panel" className={enlace}>Panel</Link>
            {menu.map((op) => (
              <Link key={op.ruta} href={op.ruta} className={enlace}>
                {op.etiqueta}
              </Link>
            ))}
          </nav>
        )}
        {!usuario && (
          <nav aria-label="Menú principal" className="hidden items-center gap-7 text-sm md:flex">
            <Link href={entidades.hija.rutaCatalogo} className={enlace}>
              {entidades.hija.plural} <span className="text-[10px] inline">⌄</span>
            </Link>
            <Link href="/#mision" className={enlace}>
              Misión <span className="text-[10px] inline">⌄</span>
            </Link>
            <Link href="/#preguntas" className={enlace}>
              Ayuda
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2 text-sm">
          {usuario ? (
            <>
              <Link href="/panel" className={`${enlace} md:hidden`}>Panel</Link>
              <span className="hidden lg:inline font-display uppercase text-white/80">{usuario.nombre}</span>
              {usuario.rol && <Chip>{roles[usuario.rol].etiqueta}</Chip>}
              <form action={cerrarSesion}>
                <button type="submit" className={pildoraBarra}>
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={`${pildoraBarra} hidden sm:inline-flex`}>
                Iniciar sesión
              </Link>
              <Link href="/registro" className={pildoraBarra}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
