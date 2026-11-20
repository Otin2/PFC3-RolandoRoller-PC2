import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { obtenerEnvSupabase } from "./env";

// Cliente de Supabase para el SERVIDOR (páginas y server actions).
// Lee la sesión del usuario desde las cookies.
export async function crearClienteServidor(): Promise<SupabaseClient> {
  // Primero las cookies: marca la página como dinámica (se genera en cada
  // visita, no en el build), así el build no necesita las variables.
  const almacenCookies = await cookies();

  const { url, clave } = obtenerEnvSupabase();
  return createServerClient(url, clave, {
    cookies: {
      getAll() {
        return almacenCookies.getAll();
      },
      setAll(cookiesNuevas) {
        try {
          cookiesNuevas.forEach(({ name, value, options }) =>
            almacenCookies.set(name, value, options),
          );
        } catch {
          // En un Server Component no se pueden escribir cookies;
          // el middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}
