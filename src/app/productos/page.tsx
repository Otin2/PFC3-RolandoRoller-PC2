import Link from "next/link";
import { entidades, moneda } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearMonto } from "@/lib/reglas";
import { BotonEnlace, Celda, Contenedor, Encabezado, EstadoVacio, Tabla } from "@/components/ui";

// Listado de la entidad hija con el nombre de su entidad principal (JOIN por FK)
export default async function ListadoHija() {
  const usuario = await exigirRol(["vendedor", "admin"]);
  const { principal, hija } = entidades;
  const supabase = await crearClienteServidor();

  // "!inner" hace un INNER JOIN: permite filtrar por el dueño de la tienda
  let consulta = supabase
    .from(hija.tabla)
    .select(`id, nombre, precio, stock, ${principal.tabla}!inner(nombre, usuario_id)`)
    .order("id", { ascending: false });
  if (usuario.rol === "vendedor") {
    consulta = consulta.eq(`${principal.tabla}.usuario_id`, usuario.id);
  }
  const { data } = await consulta;

  type Fila = {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    [clave: string]: unknown;
  };
  const registros = (data ?? []) as unknown as Fila[];
  const nombrePadre = (f: Fila) => (f[principal.tabla] as { nombre: string } | null)?.nombre ?? "—";

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Gestionar"
        titulo={usuario.rol === "admin" ? hija.plural : `Mis ${hija.plural.toLowerCase()}`}
        descripcion={`Precio y stock de cada ${hija.singular.toLowerCase()}.`}
        accion={<BotonEnlace href={`${hija.ruta}/nuevo`}>Nuevo {hija.singular.toLowerCase()}</BotonEnlace>}
      />
      <div className="py-10">
        {registros.length === 0 ? (
          <EstadoVacio
            titulo={`Todavía no hay ${hija.plural.toLowerCase()}`}
            descripcion={`Primero registra una ${principal.singular.toLowerCase()} y luego publica sus ${hija.plural.toLowerCase()}.`}
          />
        ) : (
          <Tabla columnas={["Nombre", principal.singular, "Precio", "Stock", ""]}>
            {registros.map((r) => (
              <tr key={r.id}>
                <Celda className="font-medium">{r.nombre}</Celda>
                <Celda className="text-texto-2">{nombrePadre(r)}</Celda>
                <Celda className="tabular-nums">{formatearMonto(r.precio, moneda)}</Celda>
                <Celda className={`tabular-nums ${r.stock === 0 ? "text-error" : ""}`}>{r.stock}</Celda>
                <Celda className="text-right">
                  <Link href={`${hija.ruta}/${r.id}/editar`} className="font-medium underline">
                    Editar
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
