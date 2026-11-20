import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Rol } from "@/lib/config";

// Rutas protegidas y qué roles pueden entrar (vacío = cualquier usuario con sesión)
const reglasDeAcceso: { prefijo: string; roles: Rol[] }[] = [
  { prefijo: "/admin", roles: ["admin"] },
  { prefijo: "/tiendas", roles: ["vendedor", "admin"] },
  { prefijo: "/productos", roles: ["vendedor", "admin"] },
  { prefijo: "/pedidos/nuevo", roles: ["comprador"] },
  { prefijo: "/pedidos", roles: [] },
  { prefijo: "/panel", roles: [] },
];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return NextResponse.next(); // sin configuración no se puede validar

  const ruta = request.nextUrl.pathname;
  const regla = reglasDeAcceso.find((r) => ruta.startsWith(r.prefijo));

  // Ruta pública y sin cookie de sesión: no hay nada que validar ni refrescar
  // (ahorra una consulta a Supabase en cada visita anónima)
  const tieneSesion = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!regla && !tieneSesion) return NextResponse.next();

  let respuesta = NextResponse.next({ request });

  // Cliente que refresca la sesión y la guarda en las cookies de la respuesta
  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesNuevas, cabeceras) {
        cookiesNuevas.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        cookiesNuevas.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options),
        );
        // Evita que un CDN guarde en caché la sesión de un usuario
        Object.entries(cabeceras ?? {}).forEach(([nombre, valor]) =>
          respuesta.headers.set(nombre, valor),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!regla) return respuesta; // ruta pública (solo se refrescó la sesión)

  // Redirige SIN perder las cookies de sesión que Supabase pudo haber renovado
  const redirigir = (pathname: string, search = "") => {
    const destino = request.nextUrl.clone();
    destino.pathname = pathname;
    destino.search = search;
    const redireccion = NextResponse.redirect(destino);
    respuesta.cookies.getAll().forEach((c) => redireccion.cookies.set(c));
    return redireccion;
  };

  // 1) Sin sesión -> al login
  if (!user) return redirigir("/login");

  // 2) Con sesión pero sin el rol necesario -> al panel
  if (regla.roles.length > 0) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle();

    if (!perfil || !regla.roles.includes(perfil.rol as Rol)) {
      return redirigir("/panel", "?error=sin-permiso");
    }
  }

  return respuesta;
}

export const config = {
  // No pasa por el middleware: archivos estáticos e imágenes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
