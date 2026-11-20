"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { entidades } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaHija, erroresPorCampo } from "@/lib/validaciones";
import { leerFormulario, valoresSeguros, type EstadoFormulario } from "./estado";

const { tabla, ruta } = entidades.hija;

// Crear entidad hija (ej. producto) dentro de una entidad principal propia.
// RLS rechaza el insert si la tienda no es del usuario.
export async function crearHija(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirRol(["vendedor", "admin"]);
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos);

  const resultado = esquemaHija.safeParse(datos);
  if (!resultado.success) return { errores: erroresPorCampo(resultado.error), valores };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from(tabla).insert(resultado.data);
  if (error) return { error: "No se pudo guardar. Revisa que la opción elegida sea tuya.", valores };

  revalidatePath(ruta);
  redirect(ruta);
}

export async function editarHija(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirRol(["vendedor", "admin"]);
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos);

  const resultado = esquemaHija.safeParse(datos);
  if (!resultado.success) return { errores: erroresPorCampo(resultado.error), valores };

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from(tabla)
    .update(resultado.data)
    .eq("id", id)
    .select("id");
  if (error || !data || data.length === 0) {
    return { error: "No se pudo actualizar (¿es tuyo este registro?).", valores };
  }

  revalidatePath(ruta);
  redirect(ruta);
}
