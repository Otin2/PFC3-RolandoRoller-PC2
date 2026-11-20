"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { entidades } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { exigirRol } from "@/lib/sesion";
import { esquemaEstado, esquemaTransaccion } from "@/lib/validaciones";
import { puedeCancelar, transicionValida, validarStock, type ProductoDisponible } from "@/lib/reglas";
import type { EstadoFormulario } from "./estado";

const { transaccion, hija } = entidades;

// Crea la transacción (cabecera + detalle).
// 1) Valida en la app (Zod + regla de stock) para dar un mensaje claro.
// 2) La función crear_pedido de la BD lo guarda TODO en una sola transacción:
//    descuenta el stock, usa el precio de la BD y calcula el total.
export async function crearTransaccion(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirRol(["comprador"]);

  // Leer los campos "cantidad_<id>" con cantidad mayor a 0
  const items = [...formData.entries()]
    .filter(([clave, valor]) => clave.startsWith("cantidad_") && Number(valor) > 0)
    .map(([clave, valor]) => ({
      producto_id: Number(clave.replace("cantidad_", "")),
      cantidad: Number(valor),
    }));

  // Validar con Zod (al menos un ítem, cantidades enteras > 0)
  const resultado = esquemaTransaccion.safeParse({ items });
  if (!resultado.success) {
    return { error: resultado.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // Regla de negocio: no pedir más que el stock (con datos reales de la BD)
  const supabase = await crearClienteServidor();
  const ids = resultado.data.items.map((i) => i.producto_id);
  const { data: productos } = await supabase
    .from(hija.tabla)
    .select("id, nombre, precio, stock")
    .in("id", ids);
  const disponibles = (productos ?? []).map((p) => ({ ...p, precio: Number(p.precio) })) as ProductoDisponible[];
  const erroresStock = validarStock(resultado.data.items, disponibles);
  if (erroresStock.length > 0) return { error: erroresStock.join(" · ") };

  // Guardar todo de forma atómica en la BD (vuelve a validar el stock con bloqueo)
  const { data: idPedido, error } = await supabase.rpc("crear_pedido", { p_items: resultado.data.items });
  if (error || !idPedido) {
    // Los mensajes de crear_pedido ya están en español (ej. "solo hay 3")
    return { error: error?.message ?? "No se pudo registrar. Inténtalo de nuevo." };
  }

  revalidatePath(transaccion.ruta);
  revalidatePath(hija.ruta);
  redirect(`${transaccion.ruta}/${idPedido}`);
}

// Lee el estado actual (RLS: solo si el usuario puede ver ese pedido)
async function estadoActual(id: number): Promise<string | null> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from(transaccion.tabla).select("estado").eq("id", id).maybeSingle();
  return (data?.estado as string | undefined) ?? null;
}

// Atender pedido: el vendedor del pedido o el admin avanzan el estado.
// La regla se valida aquí (mensaje claro) y otra vez en la función SQL (seguridad).
export async function cambiarEstadoPedido(id: number, nuevo: string) {
  await exigirRol(["vendedor", "admin"]);
  const ruta = `${transaccion.ruta}/${id}`;

  const estado = esquemaEstado.safeParse(nuevo);
  const actual = await estadoActual(id);
  if (!estado.success || !actual || !transicionValida(actual, estado.data)) {
    redirect(`${ruta}?aviso=transicion-invalida`);
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cambiar_estado_pedido", { p_pedido_id: id, p_estado: estado.data });
  revalidatePath(transaccion.ruta);
  redirect(`${ruta}?aviso=${error ? "no-permitido" : "estado-actualizado"}`);
}

// Cancelar pedido: solo el comprador dueño y solo si está pendiente.
// La función SQL devuelve el stock de cada línea en la misma transacción.
export async function cancelarPedido(id: number) {
  await exigirRol(["comprador"]);
  const ruta = `${transaccion.ruta}/${id}`;

  const actual = await estadoActual(id);
  if (!actual || !puedeCancelar(actual)) redirect(`${ruta}?aviso=no-cancelable`);

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cancelar_pedido", { p_pedido_id: id });
  revalidatePath(transaccion.ruta);
  revalidatePath(hija.ruta);
  redirect(`${ruta}?aviso=${error ? "no-permitido" : "cancelado"}`);
}
