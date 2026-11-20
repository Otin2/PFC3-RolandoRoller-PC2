import Link from "next/link";
import { roles } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { menuPorRol } from "@/lib/menu";
import { Aviso, Contenedor, Encabezado, EstadoVacio } from "@/components/ui";

// Panel: las opciones cambian según el rol del usuario
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
        descripcion={
          usuario.rol
            ? `Entraste como ${roles[usuario.rol].etiqueta.toLowerCase()}${usuario.distrito ? ` · ${usuario.distrito}` : ""}.`
            : undefined
        }
      />

      <div className="flex flex-col gap-6 pb-12">
        {error === "sin-permiso" && <Aviso>No tienes permiso para entrar a esa sección.</Aviso>}

        {menu.length === 0 ? (
          <EstadoVacio
            titulo="Tu perfil todavía no tiene un rol"
            descripcion="Pide al administrador que revise tu cuenta."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {menu.map((op) => (
              <li key={op.ruta}>
                <Link
                  href={op.ruta}
                  className="block h-full rounded-tarjeta border border-borde-suave bg-superficie p-5 transition-colors hover:border-acento"
                >
                  <p className="text-lg font-bold text-acento">{op.etiqueta}</p>
                  <p className="mt-2 text-sm text-texto-2">{op.descripcion}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Contenedor>
  );
}
