import { entidades } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioTransaccion } from "@/components/FormularioTransaccion";
import { Buscador } from "@/components/Buscador";
import { patronBusqueda } from "@/lib/reglas";
import { Contenedor, Encabezado, EstadoVacio } from "@/components/ui";

export default async function NuevaTransaccion({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await exigirRol(["comprador"]);
  const { principal, hija, transaccion } = entidades;
  const { q } = await searchParams;
  const patron = patronBusqueda(q);
  const supabase = await crearClienteServidor();

  // Solo se ofrecen ítems con stock disponible (y que coincidan con la búsqueda)
  let consulta = supabase
    .from(hija.tabla)
    .select(`id, nombre, precio, stock, ${principal.tabla}(nombre)`)
    .gt("stock", 0)
    .order("nombre");
  if (patron) consulta = consulta.ilike("nombre", patron);
  const { data } = await consulta;

  const productos = ((data ?? []) as unknown as Record<string, unknown>[]).map((p) => ({
    id: p.id as number,
    nombre: p.nombre as string,
    precio: Number(p.precio),
    stock: p.stock as number,
    principal: (p[principal.tabla] as { nombre: string } | null)?.nombre ?? "",
  }));

  return (
    <Contenedor>
      <Encabezado
        antetitulo={transaccion.plural}
        titulo={`Nuevo ${transaccion.singular.toLowerCase()}`}
        descripcion={`Elige ${hija.plural.toLowerCase()} y cantidades. No puedes pedir más que el stock disponible.`}
      />
      <div className="flex flex-col gap-8 py-10">
        <Buscador accion={`${transaccion.ruta}/nuevo`} valor={q} placeholder={`Buscar ${hija.singular.toLowerCase()} por nombre`} />
        {productos.length === 0 ? (
          <EstadoVacio
            titulo={patron ? "Sin resultados" : `No hay ${hija.plural.toLowerCase()} con stock`}
            descripcion={patron ? "Prueba con otra palabra." : "Vuelve más tarde."}
          />
        ) : (
          <FormularioTransaccion productos={productos} />
        )}
      </div>
    </Contenedor>
  );
}
