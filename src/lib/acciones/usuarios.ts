"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaCambioRol } from "@/lib/validaciones";
import { leerFormulario } from "./estado";

// Gestionar roles (solo admin). Zod valida el formulario y la función SQL
// cambiar_rol vuelve a verificar que sea admin y que no cambie su propio rol.
export async function cambiarRol(formData: FormData) {
  const admin = await exigirRol(["admin"]);

  const resultado = esquemaCambioRol.safeParse(leerFormulario(formData));
  if (!resultado.success) redirect("/admin?aviso=rol-invalido");
  if (resultado.data.usuario_id === admin.id) redirect("/admin?aviso=propio-rol");

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cambiar_rol", {
    p_usuario: resultado.data.usuario_id,
    p_rol: resultado.data.rol,
  });
  revalidatePath("/admin");
  redirect(`/admin?aviso=${error ? "no-permitido" : "rol-actualizado"}`);
}
