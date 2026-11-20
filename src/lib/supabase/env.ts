// Lee las variables de Supabase en TIEMPO DE EJECUCIÓN (no en el build).
// Así el build de CI no se rompe si los secrets todavía no existen.
export function obtenerEnvSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa .env.local o las variables de Vercel.",
    );
  }
  return { url, clave };
}
