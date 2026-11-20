import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { Acceso } from "@/components/Acceso";

// /login y /registro muestran la misma pantalla; solo cambia el modo inicial del switch
export default async function Registro() {
  if (await obtenerUsuarioActual()) redirect("/panel");
  return <Acceso modoInicial="registro" />;
}
