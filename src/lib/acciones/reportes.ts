"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaReporte, erroresPorCampo } from "@/lib/validaciones";
import { extensionFoto, validarFoto } from "@/lib/reglas";
import { leerFormulario, valoresSeguros, type EstadoFormulario } from "./estado";

// Crea un reporte: valida (Zod + regla de la foto), sube la foto a Storage
// (carpeta del usuario) y guarda el reporte como "pendiente".
export async function crearReporte(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirRol(["vecino"]);
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos);

  const resultado = esquemaReporte.safeParse(datos);
  const errores = resultado.success ? {} : erroresPorCampo(resultado.error);

  const foto = formData.get("foto");
  const archivo = foto instanceof File ? foto : null;
  const errorFoto = validarFoto(archivo ?? { size: 0, type: "" });
  if (errorFoto) errores.foto = errorFoto;

  if (!resultado.success || !archivo || errorFoto) return { errores, valores };

  const supabase = await crearClienteServidor();

  // 1) Subir la foto a la carpeta del usuario: {uid}/{fecha}.ext
  const ruta = `${usuario.id}/${Date.now()}.${extensionFoto(archivo.type)}`;
  const { error: errorSubida } = await supabase.storage
    .from("reportes")
    .upload(ruta, archivo, { contentType: archivo.type });
  if (errorSubida) return { error: "No se pudo subir la foto. Inténtalo de nuevo.", valores };
  const { data: publica } = supabase.storage.from("reportes").getPublicUrl(ruta);

  // 2) Guardar el reporte (la política RLS exige que sea del usuario y pendiente)
  const { descripcion, ...resto } = resultado.data;
  const { error } = await supabase.from("reportes").insert({
    ...resto,
    descripcion: descripcion || null,
    foto_url: publica.publicUrl,
    usuario_id: usuario.id,
    estado: "pendiente",
  });
  if (error) {
    await supabase.storage.from("reportes").remove([ruta]); // no dejar fotos huérfanas
    return { error: "No se pudo guardar el reporte. Inténtalo de nuevo.", valores };
  }

  revalidatePath("/reportes");
  redirect("/reportes?aviso=creado");
}
