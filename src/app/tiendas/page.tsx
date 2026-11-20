import Link from "next/link";
import { entidades } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { eliminarPrincipal } from "@/lib/acciones/principal";
import { BotonEliminar } from "@/components/BotonEliminar";
import { Aviso, BotonEnlace, Celda, Chip, Contenedor, Encabezado, EstadoVacio, Tabla } from "@/components/ui";

// Listado de la entidad principal: el vendedor ve las suyas, el admin todas
// Mensajes que devuelve la acción de eliminar
const avisos: Record<string, { tipo: "exito" | "error"; texto: string }> = {
  eliminada: { tipo: "exito", texto: "Registro eliminado." },
  "con-pedidos": { tipo: "error", texto: "No se puede eliminar: tiene productos que ya están en pedidos (se conserva el historial)." },
  "no-permitido": { tipo: "error", texto: "No se pudo eliminar (¿es tuyo este registro?)." },
};

export default async function ListadoPrincipal({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const usuario = await exigirRol(["vendedor", "admin"]);
  const { principal } = entidades;
  const aviso = avisos[(await searchParams).aviso ?? ""];
  const supabase = await crearClienteServidor();

  let consulta = supabase
    .from(principal.tabla)
    .select("id, nombre, rubro, creado_en")
    .order("creado_en", { ascending: false });
  if (usuario.rol === "vendedor") consulta = consulta.eq("usuario_id", usuario.id);

  const { data: registros } = await consulta;
  const puedeCrear = usuario.rol === "vendedor"; // RLS: solo el vendedor inserta

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Gestionar"
        titulo={usuario.rol === "admin" ? principal.plural : `Mis ${principal.plural.toLowerCase()}`}
        descripcion={`Registra y edita ${principal.plural.toLowerCase()}.`}
        accion={puedeCrear && <BotonEnlace href={`${principal.ruta}/nueva`}>Nueva {principal.singular.toLowerCase()}</BotonEnlace>}
      />
      <div className="flex flex-col gap-6 py-10">
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
        {!registros || registros.length === 0 ? (
          <EstadoVacio
            titulo={`Todavía no hay ${principal.plural.toLowerCase()}`}
            descripcion={puedeCrear ? "Crea la primera para empezar a publicar." : undefined}
          />
        ) : (
          <Tabla columnas={["Nombre", principal.campoExtra, "Creada", ""]}>
            {registros.map((r) => (
              <tr key={r.id}>
                <Celda className="font-medium">{r.nombre}</Celda>
                <Celda>{r.rubro ? <Chip>{r.rubro}</Chip> : "—"}</Celda>
                <Celda className="text-texto-2">{new Date(r.creado_en).toLocaleDateString("es-PE")}</Celda>
                <Celda>
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`${principal.ruta}/${r.id}/editar`} className="font-medium underline">
                      Editar
                    </Link>
                    <BotonEliminar
                      accion={eliminarPrincipal.bind(null, r.id)}
                      confirmacion={`¿Eliminar "${r.nombre}" y todos sus productos? No se puede deshacer.`}
                    />
                  </div>
                </Celda>
              </tr>
            ))}
          </Tabla>
        )}
      </div>
    </Contenedor>
  );
}
