import { entidades } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { opcionesPrincipales } from "@/lib/consultas";
import { crearHija } from "@/lib/acciones/hija";
import { Formulario } from "@/components/Formulario";
import { BotonEnlace, Contenedor, Encabezado, EstadoVacio, Tarjeta } from "@/components/ui";

export default async function NuevaHija() {
  const usuario = await exigirRol(["vendedor", "admin"]);
  const { principal, hija } = entidades;
  const opciones = await opcionesPrincipales(usuario);

  return (
    <Contenedor>
      <Encabezado antetitulo={hija.plural} titulo={`Nuevo ${hija.singular.toLowerCase()}`} />
      <div className="max-w-xl py-10 mx-auto">
        {opciones.length === 0 ? (
          <EstadoVacio
            titulo={`Primero necesitas una ${principal.singular.toLowerCase()}`}
            accion={
              usuario.rol === "vendedor" && (
                <BotonEnlace href={`${principal.ruta}/nueva`}>Crear {principal.singular.toLowerCase()}</BotonEnlace>
              )
            }
          />
        ) : (
          <Tarjeta destacada>
            <Formulario
              accion={crearHija}
              textoBoton="Guardar"
              campos={[
                { nombre: "tienda_id", etiqueta: principal.singular, tipo: "select", opciones },
                { nombre: "nombre", etiqueta: "Nombre" },
                { nombre: "precio", etiqueta: "Precio (S/)", tipo: "number", paso: "0.01" },
                { nombre: "stock", etiqueta: "Stock", tipo: "number", paso: "1" },
              ]}
            />
          </Tarjeta>
        )}
      </div>
    </Contenedor>
  );
}
