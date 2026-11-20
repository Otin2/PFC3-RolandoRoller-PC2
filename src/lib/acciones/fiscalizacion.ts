"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaAtencion, erroresPorCampo } from "@/lib/validaciones";
import { leerFormulario, valoresSeguros, type EstadoFormulario } from "./estado";

// Solo se vuelve a una ruta de la bandeja (evita redirecciones a otros sitios)
function rutaDeVuelta(volver: string | undefined): string {
  return volver && volver.startsWith("/fiscalizacion") ? volver : "/fiscalizacion";
}

// Agrega ?aviso=... conservando los filtros de la bandeja
function conAviso(ruta: string, aviso: string): string {
  return `${ruta}${ruta.includes("?") ? "&" : "?"}aviso=${aviso}`;
}

// Atiende un reporte pendiente. Zod valida la nota y la función SQL
// atender_reporte vuelve a verificar distrito, rol y estado.
export async function atenderReporte(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirRol(["fiscalizador", "admin"]);
  const datos = leerFormulario(formData);
  const resultado = esquemaAtencion.safeParse(datos);
  if (!resultado.success) {
    return { errores: erroresPorCampo(resultado.error), valores: valoresSeguros(datos) };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("atender_reporte", {
    p_reporte_id: resultado.data.reporte_id,
    p_nota: resultado.data.nota,
  });
  if (error) return { error: error.message, valores: valoresSeguros(datos) };

  revalidatePath("/fiscalizacion");
  redirect(conAviso(rutaDeVuelta(datos.volver), "atendido"));
}
