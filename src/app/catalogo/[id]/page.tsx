import { notFound } from "next/navigation";
import { entidades, moneda } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { formatearMonto } from "@/lib/reglas";
import { BotonEnlace, Celda, Chip, Contenedor, Encabezado, EstadoVacio, Tabla } from "@/components/ui";

// Caso de uso "Ver detalle de tienda" (extiende "Buscar productos"):
// datos de la entidad principal + todos sus productos.
export default async function DetalleCatalogo({ params }: { params: Promise<{ id: string }> }) {
  const { principal, hija, transaccion } = entidades;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  // Las 3 consultas no dependen entre sí: se hacen en paralelo
  const supabase = await crearClienteServidor();
  const [{ data: registro }, { data: hijas }, usuario] = await Promise.all([
    supabase.from(principal.tabla).select("id, nombre, rubro, creado_en").eq("id", id).maybeSingle(),
    supabase.from(hija.tabla).select("id, nombre, precio, stock").eq("tienda_id", id).order("nombre"),
    obtenerUsuarioActual(),
  ]);
  if (!registro) notFound();

  const lista = hijas ?? [];
  const conStock = lista.filter((h) => h.stock > 0).length;

  return (
    <Contenedor>
      <Encabezado
        antetitulo={principal.singular}
        titulo={registro.nombre}
        descripcion={`${principal.singular} registrada el ${new Date(registro.creado_en).toLocaleDateString("es-PE")}.`}
        accion={
          <>
            {usuario?.rol === "comprador" && conStock > 0 && (
              <BotonEnlace href={`${transaccion.ruta}/nuevo`}>Hacer {transaccion.singular.toLowerCase()}</BotonEnlace>
            )}
            <BotonEnlace href={hija.rutaCatalogo} variante="secundario">
              Volver a buscar
            </BotonEnlace>
          </>
        }
      />

      <div className="flex flex-col gap-10 py-10">
        <dl className="flex flex-wrap justify-center gap-16 text-center">
          <div className="flex flex-col-reverse">
            <dt className="etiqueta mt-1 text-sm text-texto-2">{principal.campoExtra}</dt>
            <dd className="flex h-16 items-center justify-center">{registro.rubro ? <Chip>{registro.rubro}</Chip> : "—"}</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="etiqueta mt-1 text-sm text-texto-2">{hija.plural}</dt>
            <dd className="tabular-nums font-display text-6xl font-normal text-acento">{lista.length}</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="etiqueta mt-1 text-sm text-texto-2">Con stock</dt>
            <dd className="tabular-nums font-display text-6xl font-normal text-acento">{conStock}</dd>
          </div>
        </dl>

        {lista.length === 0 ? (
          <EstadoVacio titulo={`Esta ${principal.singular.toLowerCase()} aún no tiene ${hija.plural.toLowerCase()}`} />
        ) : (
          <Tabla columnas={[hija.singular, "Precio", "Stock"]}>
            {lista.map((h) => (
              <tr key={h.id}>
                <Celda className="font-medium">{h.nombre}</Celda>
                <Celda className="tabular-nums">{formatearMonto(h.precio, moneda)}</Celda>
                <Celda className={`tabular-nums ${h.stock === 0 ? "text-error" : ""}`}>{h.stock}</Celda>
              </tr>
            ))}
          </Tabla>
        )}
      </div>
    </Contenedor>
  );
}
