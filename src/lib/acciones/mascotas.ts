"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaMascota, erroresPorCampo } from "@/lib/validaciones";
import { leerFormulario, valoresSeguros, type EstadoFormulario } from "./estado";

// Registra una mascota del vecino con sesión.
// Zod valida el formulario y la política RLS vuelve a exigir que sea SU mascota.
export async function crearMascota(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirRol(["vecino"]);
  const datos = leerFormulario(formData);
  const resultado = esquemaMascota.safeParse(datos);
  if (!resultado.success) {
    return { errores: erroresPorCampo(resultado.error), valores: valoresSeguros(datos) };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("mascotas")
    .insert({ ...resultado.data, usuario_id: usuario.id });
  if (error) return { error: "No se pudo registrar la mascota.", valores: valoresSeguros(datos) };

  revalidatePath("/mascotas");
  return { exito: `${resultado.data.nombre} quedó registrado.` };
}
