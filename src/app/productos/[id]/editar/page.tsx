import { notFound } from "next/navigation";
import { entidades } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { opcionesPrincipales } from "@/lib/consultas";
import { editarHija } from "@/lib/acciones/hija";
import { Formulario } from "@/components/Formulario";
import { Contenedor, Encabezado, Tarjeta } from "@/components/ui";

export default async function EditarHija({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirRol(["vendedor", "admin"]);
  const { principal, hija } = entidades;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await crearClienteServidor();
  const { data: registro } = await supabase
    .from(hija.tabla)
    .select("id, tienda_id, nombre, precio, stock")
    .eq("id", id)
    .maybeSingle();

  const opciones = await opcionesPrincipales(usuario);
  // Solo puede editar si la entidad principal del registro es suya (o es admin)
  if (!registro || !opciones.some((o) => o.valor === String(registro.tienda_id))) notFound();

  return (
    <Contenedor>
      <Encabezado antetitulo={hija.plural} titulo={`Editar ${hija.singular.toLowerCase()}`} descripcion={registro.nombre} />
      <div className="max-w-xl py-10 mx-auto">
        <Tarjeta destacada>
          <Formulario
            accion={editarHija.bind(null, id)}
            textoBoton="Guardar cambios"
            campos={[
              { nombre: "tienda_id", etiqueta: principal.singular, tipo: "select", opciones, valorInicial: String(registro.tienda_id) },
              { nombre: "nombre", etiqueta: "Nombre", valorInicial: registro.nombre },
              { nombre: "precio", etiqueta: "Precio (S/)", tipo: "number", paso: "0.01", valorInicial: String(registro.precio) },
              { nombre: "stock", etiqueta: "Stock", tipo: "number", paso: "1", valorInicial: String(registro.stock) },
            ]}
          />
        </Tarjeta>
      </div>
    </Contenedor>
  );
}
