import { notFound } from "next/navigation";
import { entidades, moneda } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearMonto, puedeCancelar, redondear, siguienteEstado } from "@/lib/reglas";
import { cambiarEstadoPedido, cancelarPedido } from "@/lib/acciones/transaccion";
import { BotonEliminar } from "@/components/BotonEliminar";
import { Aviso, Boton, BotonEnlace, Celda, Chip, Contenedor, Encabezado, Tabla } from "@/components/ui";

// Mensajes que devuelven las acciones de esta página
const avisos: Record<string, { tipo: "exito" | "error"; texto: string }> = {
  "estado-actualizado": { tipo: "exito", texto: "Estado actualizado." },
  cancelado: { tipo: "exito", texto: "Pedido cancelado. El stock se devolvió." },
  "transicion-invalida": { tipo: "error", texto: "Ese cambio de estado no está permitido." },
  "no-cancelable": { tipo: "error", texto: "Solo se puede cancelar un pedido pendiente." },
  "no-permitido": { tipo: "error", texto: "No tienes permiso para hacer ese cambio." },
};

// Detalle de una transacción: cabecera + líneas (tabla detalle) + acciones según el rol
export default async function DetalleTransaccion({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  const usuario = await exigirRol();
  const { transaccion, hija } = entidades;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const aviso = avisos[(await searchParams).aviso ?? ""];

  const supabase = await crearClienteServidor();
  // RLS: si no le corresponde ver este pedido, la consulta devuelve null -> 404
  const [{ data: cabecera }, { data: lineas }] = await Promise.all([
    supabase.from(transaccion.tabla).select("id, usuario_id, estado, total, fecha").eq("id", id).maybeSingle(),
    supabase.from(transaccion.tablaDetalle).select(`id, cantidad, precio_unitario, ${hija.tabla}(nombre)`).eq("pedido_id", id),
  ]);
  if (!cabecera) notFound();

  const filas = (lineas ?? []) as unknown as Record<string, unknown>[];

  // Acciones visibles según el rol (la BD vuelve a validar todo):
  // - vendedor (si ve el pedido, es porque incluye sus productos) o admin: avanzar el estado
  // - comprador dueño: cancelar si sigue pendiente
  const siguiente = siguienteEstado(cabecera.estado);
  const puedeAtender = (usuario.rol === "vendedor" || usuario.rol === "admin") && siguiente !== null;
  const esDueno = usuario.rol === "comprador" && cabecera.usuario_id === usuario.id;
  const mostrarCancelar = esDueno && puedeCancelar(cabecera.estado);

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Detalle"
        titulo={`${transaccion.singular} #${cabecera.id}`}
        descripcion={new Date(cabecera.fecha).toLocaleString("es-PE")}
        accion={<BotonEnlace href={transaccion.ruta} variante="secundario">Volver</BotonEnlace>}
      />
      <div className="flex flex-col gap-6 py-10">
        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="etiqueta text-sm text-texto-2">Estado</p>
              <div className="mt-1"><Chip>{cabecera.estado}</Chip></div>
            </div>
            <div>
              <p className="etiqueta text-sm text-texto-2">Total</p>
              <p className="mt-1 font-display text-4xl tracking-[0.02em] text-acento tabular-nums">
                {formatearMonto(cabecera.total, moneda)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {puedeAtender && (
              <form action={cambiarEstadoPedido.bind(null, cabecera.id, siguiente)}>
                <Boton type="submit">Marcar como {siguiente}</Boton>
              </form>
            )}
            {mostrarCancelar && (
              <BotonEliminar
                accion={cancelarPedido.bind(null, cabecera.id)}
                confirmacion={`¿Cancelar el ${transaccion.singular.toLowerCase()} #${cabecera.id}? El stock se devolverá.`}
                texto={`Cancelar ${transaccion.singular.toLowerCase()}`}
              />
            )}
          </div>
        </div>

        <Tabla columnas={[hija.singular, "Cantidad", "Precio unitario", "Subtotal"]}>
          {filas.map((l) => {
            const cantidad = l.cantidad as number;
            const precio = Number(l.precio_unitario);
            return (
              <tr key={l.id as number}>
                <Celda className="font-medium">{(l[hija.tabla] as { nombre: string } | null)?.nombre ?? "—"}</Celda>
                <Celda className="tabular-nums">{cantidad}</Celda>
                <Celda className="tabular-nums">{formatearMonto(precio, moneda)}</Celda>
                <Celda className="tabular-nums">{formatearMonto(redondear(cantidad * precio), moneda)}</Celda>
              </tr>
            );
          })}
        </Tabla>
        {usuario.rol === "vendedor" && (
          <p className="text-sm text-texto-2">Solo ves las líneas de tus propios productos.</p>
        )}
      </div>
    </Contenedor>
  );
}
