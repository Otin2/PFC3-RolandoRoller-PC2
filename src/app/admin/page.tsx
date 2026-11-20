import { exigirRol } from "@/lib/sesion";
import { Contenedor, Encabezado, EstadoVacio } from "@/components/ui";

// Panel de administración (solo admin: middleware + exigirRol).
// Los indicadores por distrito se agregan en la historia PC2-16.
export default async function Admin() {
  await exigirRol(["admin"]);
  return (
    <Contenedor>
      <Encabezado antetitulo="Administración" titulo="Indicadores" />
      <EstadoVacio titulo="Indicadores en construcción" descripcion="Pronto verás los reportes por distrito." />
    </Contenedor>
  );
}
