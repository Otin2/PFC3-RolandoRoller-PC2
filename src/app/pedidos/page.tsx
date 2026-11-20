import Link from "next/link";
import { entidades, moneda } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearMonto } from "@/lib/reglas";
import { BotonEnlace, Celda, Chip, Contenedor, Encabezado, EstadoVacio, Tabla } from "@/components/ui";

// Una sola consulta para todos los roles: RLS decide qué filas ve cada uno.
//  - comprador: solo los suyos
//  - vendedor: los que incluyen sus productos
//  - admin: todos
export default async function ListadoTransacciones() {
  const usuario = await exigirRol();
  const { transaccion } = entidades;
  const supabase = await crearClienteServidor();

  const { data: registros } = await supabase
    .from(transaccion.tabla)
    .select(`id, estado, total, fecha, ${transaccion.tablaDetalle}(count)`)
    .order("fecha", { ascending: false });

  const titulo =
    usuario.rol === "comprador"
      ? `Mis ${transaccion.plural.toLowerCase()}`
      : usuario.rol === "vendedor"
        ? `${transaccion.plural} recibidos`
        : transaccion.plural;

  const filas = (registros ?? []) as unknown as Record<string, unknown>[];
  const cantidadItems = (f: Record<string, unknown>) =>
    (f[transaccion.tablaDetalle] as { count: number }[] | null)?.[0]?.count ?? 0;

  return (
    <Contenedor>
      <Encabezado
        antetitulo={transaccion.plural}
        titulo={titulo}
        descripcion="Cada rol solo ve lo que le corresponde (Row Level Security)."
        accion={
          usuario.rol === "comprador" && (
            <BotonEnlace href={`${transaccion.ruta}/nuevo`}>Nuevo {transaccion.singular.toLowerCase()}</BotonEnlace>
          )
        }
      />
      <div className="py-10">
        {filas.length === 0 ? (
          <EstadoVacio titulo={`Todavía no hay ${transaccion.plural.toLowerCase()}`} />
        ) : (
          <Tabla columnas={["N.º", "Fecha", "Ítems", "Estado", "Total", ""]}>
            {filas.map((f) => (
              <tr key={f.id as number}>
                <Celda className="font-medium tabular-nums">#{f.id as number}</Celda>
                <Celda className="text-texto-2">{new Date(f.fecha as string).toLocaleDateString("es-PE")}</Celda>
                <Celda className="tabular-nums">{cantidadItems(f)}</Celda>
                <Celda><Chip>{f.estado as string}</Chip></Celda>
                <Celda className="font-medium tabular-nums">{formatearMonto(f.total as number, moneda)}</Celda>
                <Celda className="text-right">
                  <Link href={`${transaccion.ruta}/${f.id}`} className="font-medium underline">
                    Ver detalle
                  </Link>
                </Celda>
              </tr>
            ))}
          </Tabla>
        )}
      </div>
    </Contenedor>
  );
}
