import Link from "next/link";
import { roles } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { menuPorRol } from "@/lib/menu";
import { Aviso, Contenedor, Encabezado, EstadoVacio } from "@/components/ui";

// Panel: el menú cambia según el rol del usuario
export default async function Panel({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const usuario = await exigirRol();
  const { error } = await searchParams;
  const menu = menuPorRol(usuario.rol);

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Panel"
        titulo={`Hola, ${usuario.nombre}`}
        descripcion={usuario.rol ? `Entraste como ${roles[usuario.rol].etiqueta.toLowerCase()}.` : undefined}
      />

      <div className="flex flex-col gap-6 py-10">
        {error === "sin-permiso" && <Aviso>No tienes permiso para entrar a esa sección.</Aviso>}

        {menu.length === 0 ? (
          <EstadoVacio
            titulo="Tu perfil todavía no tiene un rol"
            descripcion="Pide al administrador que revise tu cuenta."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((op) => (
              <li key={op.ruta}>
                <Link
                  href={op.ruta}
                  className="revelar group block h-full border bg-superficie transition-all duration-300 rounded-[38px] border-black p-8 hover:-rotate-1 hover:scale-[1.02] hover:border-acento"
                >
                  <p className="font-display text-4xl font-normal uppercase leading-[0.9] tracking-[0.02em] text-acento">{op.etiqueta}</p>
                  <p className="text-sm text-texto-2 mt-4">{op.descripcion}</p>
                  <p className="etiqueta mt-6 text-sm font-medium group-hover:underline text-white no-underline">Abrir ›</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Contenedor>
  );
}
