import { notFound } from "next/navigation";
import { entidades } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { editarPrincipal } from "@/lib/acciones/principal";
import { Formulario } from "@/components/Formulario";
import { Contenedor, Encabezado, Tarjeta } from "@/components/ui";

export default async function EditarPrincipal({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirRol(["vendedor", "admin"]);
  const { principal } = entidades;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await crearClienteServidor();
  const { data: registro } = await supabase
    .from(principal.tabla)
    .select("id, nombre, rubro, usuario_id")
    .eq("id", id)
    .maybeSingle();

  // Solo el dueño o el admin pueden editar
  if (!registro || (usuario.rol !== "admin" && registro.usuario_id !== usuario.id)) notFound();

  return (
    <Contenedor>
      <Encabezado antetitulo={principal.plural} titulo={`Editar ${principal.singular.toLowerCase()}`} descripcion={registro.nombre} />
      <div className="max-w-xl py-10 mx-auto">
        <Tarjeta destacada>
          <Formulario
            accion={editarPrincipal.bind(null, id)}
            textoBoton="Guardar cambios"
            campos={[
              { nombre: "nombre", etiqueta: "Nombre", valorInicial: registro.nombre },
              { nombre: "rubro", etiqueta: principal.campoExtra, valorInicial: registro.rubro ?? "" },
            ]}
          />
        </Tarjeta>
      </div>
    </Contenedor>
  );
}
