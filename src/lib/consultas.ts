import { entidades } from "./config";
import { crearClienteServidor } from "./supabase/server";
import type { UsuarioActual } from "./sesion";

// Entidades principales que el usuario puede usar en un formulario:
// el vendedor solo las suyas; el admin todas.
export async function opcionesPrincipales(usuario: UsuarioActual) {
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from(entidades.principal.tabla)
    .select("id, nombre")
    .order("nombre");
  if (usuario.rol !== "admin") consulta = consulta.eq("usuario_id", usuario.id);

  const { data } = await consulta;
  return (data ?? []).map((r) => ({ valor: String(r.id), etiqueta: r.nombre as string }));
}
