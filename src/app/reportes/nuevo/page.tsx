import { exigirRol } from "@/lib/sesion";
import { FormularioReporte } from "@/components/FormularioReporte";
import { Contenedor, Encabezado, Tarjeta } from "@/components/ui";

// Nuevo reporte de punto crítico (solo vecinos)
export default async function NuevoReporte() {
  const usuario = await exigirRol(["vecino"]);
  return (
    <Contenedor>
      <Encabezado
        antetitulo="Reportes"
        titulo="Reportar un punto crítico"
        descripcion="Cuéntanos qué encontraste, adjunta una foto y marca dónde está."
      />
      <div className="max-w-2xl pb-12">
        <Tarjeta>
          <FormularioReporte distritoInicial={usuario.distrito ?? "Los Olivos"} />
        </Tarjeta>
      </div>
    </Contenedor>
  );
}
