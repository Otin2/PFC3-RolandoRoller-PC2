import Link from "next/link";
import { roles, tiposReporte, type TipoReporte } from "@/lib/config";
import { fechaLimiteAviso } from "@/lib/reglas";
import { crearClienteServidor } from "@/lib/supabase/server";
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

  // Aviso al vecino: sus reportes atendidos en los últimos 7 días
  let atendidos: { id: number; tipo: string; distrito: string; nota: string | null }[] = [];
  if (usuario.rol === "vecino") {
    const supabase = await crearClienteServidor();
    const { data } = await supabase
      .from("reportes")
      .select("id, tipo, distrito, nota")
      .eq("usuario_id", usuario.id)
      .eq("estado", "atendido")
      .gte("atendido_en", fechaLimiteAviso().toISOString())
      .order("atendido_en", { ascending: false });
    atendidos = data ?? [];
  }

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

        {atendidos.map((r) => (
          <Aviso key={r.id} tipo="exito">
            Tu reporte de {tiposReporte[r.tipo as TipoReporte]?.etiqueta.toLowerCase() ?? r.tipo} en {r.distrito} fue atendido: {r.nota}
          </Aviso>
        ))}

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
