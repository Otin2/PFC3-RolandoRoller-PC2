import { createBrowserClient } from "@supabase/ssr";
import { obtenerEnvSupabase } from "./env";

// Cliente de Supabase para componentes que corren en el NAVEGADOR.
// Usa solo la clave pública (anon). La seguridad real la da RLS.
export function crearClienteNavegador() {
  const { url, clave } = obtenerEnvSupabase();
  return createBrowserClient(url, clave);
}
