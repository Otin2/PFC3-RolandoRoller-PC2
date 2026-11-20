import { cache } from "react";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "./supabase/server";
import type { Rol } from "./config";

export type UsuarioActual = {
  id: string;
  email: string;
  nombre: string;
  distrito: string | null; // distrito del perfil (el fiscalizador atiende solo ese)
  rol: Rol | null; // null si todavía no tiene perfil en public.usuarios
};

// Devuelve el usuario con sesión y su rol, o null si no inició sesión.
// El rol se lee de la tabla public.usuarios (NO del metadata, que el
// usuario podría modificar).
// cache(): en una misma petición (barra + página) se consulta UNA sola vez.
export const obtenerUsuarioActual = cache(async (): Promise<UsuarioActual | null> => {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nombre, rol, distrito")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    nombre: perfil?.nombre ?? user.email ?? "Usuario",
    distrito: perfil?.distrito ?? null,
    rol: (perfil?.rol as Rol | undefined) ?? null,
  };
});

// Protege una página: exige sesión y (opcional) uno de los roles dados.
export async function exigirRol(rolesPermitidos?: Rol[]): Promise<UsuarioActual> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");
  if (rolesPermitidos && (!usuario.rol || !rolesPermitidos.includes(usuario.rol))) {
    redirect("/panel?error=sin-permiso");
  }
  return usuario;
}
