"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { entidades } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaPrincipal, erroresPorCampo } from "@/lib/validaciones";
import { leerFormulario, valoresSeguros, type EstadoFormulario } from "./estado";

const { tabla, ruta } = entidades.principal;

// Crear entidad principal (ej. tienda). Solo el vendedor.
export async function crearPrincipal(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirRol(["vendedor"]);
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos);

  const resultado = esquemaPrincipal.safeParse(datos);
  if (!resultado.success) return { errores: erroresPorCampo(resultado.error), valores };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from(tabla).insert({
    ...resultado.data,
    usuario_id: usuario.id, // el dueño es SIEMPRE el usuario con sesión
  });
  if (error) return { error: "No se pudo guardar. Inténtalo de nuevo.", valores };

  revalidatePath(ruta);
  redirect(ruta);
}

// Eliminar entidad principal (caso de uso "Moderar"). RLS solo deja
// borrar al dueño o al admin. Sus productos se borran en cascada.
export async function eliminarPrincipal(id: number) {
  await exigirRol(["vendedor", "admin"]);
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase.from(tabla).delete().eq("id", id).select("id");

  let aviso = "eliminada";
  // 23503 = violación de FK: algún producto ya está en un pedido (se protege el historial)
  if (error?.code === "23503") aviso = "con-pedidos";
  else if (error || !data || data.length === 0) aviso = "no-permitido";

  revalidatePath(ruta);
  redirect(`${ruta}?aviso=${aviso}`);
}

// Editar entidad principal. RLS solo deja editar al dueño o al admin.
export async function editarPrincipal(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirRol(["vendedor", "admin"]);
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos);

  const resultado = esquemaPrincipal.safeParse(datos);
  if (!resultado.success) return { errores: erroresPorCampo(resultado.error), valores };

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from(tabla)
    .update(resultado.data)
    .eq("id", id)
    .select("id");
  // Si RLS bloquea, no hay error pero tampoco filas actualizadas
  if (error || !data || data.length === 0) {
    return { error: "No se pudo actualizar (¿es tuyo este registro?).", valores };
  }

  revalidatePath(ruta);
  redirect(ruta);
}
