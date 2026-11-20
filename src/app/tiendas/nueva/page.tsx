import { entidades } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearPrincipal } from "@/lib/acciones/principal";
import { Formulario } from "@/components/Formulario";
import { Contenedor, Encabezado, Tarjeta } from "@/components/ui";

export default async function NuevaPrincipal() {
  await exigirRol(["vendedor"]);
  const { principal } = entidades;

  return (
    <Contenedor>
      <Encabezado antetitulo={principal.plural} titulo={`Nueva ${principal.singular.toLowerCase()}`} />
      <div className="max-w-xl py-10 mx-auto">
        <Tarjeta destacada>
          <Formulario
            accion={crearPrincipal}
            textoBoton="Guardar"
            campos={[
              { nombre: "nombre", etiqueta: "Nombre" },
              { nombre: "rubro", etiqueta: principal.campoExtra, ayuda: "Opcional." },
            ]}
          />
        </Tarjeta>
      </div>
    </Contenedor>
  );
}
