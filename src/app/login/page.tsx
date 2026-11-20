import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { Acceso } from "@/components/Acceso";

// /login y /registro muestran la misma pantalla; solo cambia el modo inicial del switch
export default async function Login() {
  // Si ya tiene sesión, no tiene sentido mostrar el login
  if (await obtenerUsuarioActual()) redirect("/panel");
  return <Acceso modoInicial="login" />;
}
