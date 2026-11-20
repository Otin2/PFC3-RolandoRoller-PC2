import { entidades, moneda, roles, type Rol } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearMonto, sumarMontos } from "@/lib/reglas";
import { cambiarRol } from "@/lib/acciones/usuarios";
import { Aviso, Celda, Chip, Contenedor, Encabezado, EstadoVacio, Tabla } from "@/components/ui";

// Panel de administración: indicadores + listado de usuarios.
// Solo el admin entra (middleware + exigirRol + RLS).
// Mensajes de la acción "cambiar rol"
const avisos: Record<string, { tipo: "exito" | "error"; texto: string }> = {
  "rol-actualizado": { tipo: "exito", texto: "Rol actualizado." },
  "propio-rol": { tipo: "error", texto: "No puedes cambiar tu propio rol (el sistema se quedaría sin admin)." },
  "rol-invalido": { tipo: "error", texto: "Elige un rol válido." },
  "no-permitido": { tipo: "error", texto: "No se pudo cambiar el rol." },
};

export default async function Admin({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const admin = await exigirRol(["admin"]);
  const aviso = avisos[(await searchParams).aviso ?? ""];
  const { principal, hija, transaccion } = entidades;
  const supabase = await crearClienteServidor();

  const contar = async (tabla: string) => {
    const { count } = await supabase.from(tabla).select("id", { count: "exact", head: true });
    return count ?? 0;
  };

  const [{ data: usuarios }, totalPrincipal, totalHija, { data: transacciones }] = await Promise.all([
    supabase.from("usuarios").select("id, nombre, email, rol, creado_en").order("creado_en", { ascending: false }),
    contar(principal.tabla),
    contar(hija.tabla),
    supabase.from(transaccion.tabla).select("total, estado"),
  ]);

  const listaUsuarios = usuarios ?? [];
  const porRol = (rol: Rol) => listaUsuarios.filter((u) => u.rol === rol).length;
  // El monto total no cuenta las transacciones canceladas
  const validas = (transacciones ?? []).filter((t) => t.estado !== "cancelado");

  const indicadores = [
    { etiqueta: "Usuarios", valor: String(listaUsuarios.length), detalle: `${porRol("comprador")} compradores · ${porRol("vendedor")} vendedores · ${porRol("admin")} admin` },
    { etiqueta: principal.plural, valor: String(totalPrincipal) },
    { etiqueta: hija.plural, valor: String(totalHija) },
    { etiqueta: transaccion.plural, valor: String(transacciones?.length ?? 0) },
    { etiqueta: "Monto total", valor: formatearMonto(sumarMontos(validas), moneda), detalle: "Sin contar cancelados" },
  ];

  return (
    <Contenedor>
      <Encabezado antetitulo="Administración" titulo="Indicadores" descripcion="Indicadores calculados en vivo desde la base de datos." />

      <section className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        {indicadores.map((ind, i) => (
          <div
            key={ind.etiqueta}
            className="revelar rounded-tarjeta bg-seccion p-6 border border-black"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <p className="etiqueta text-sm text-texto-2">{ind.etiqueta}</p>
            <p className="tabular-nums mt-4 font-display text-5xl font-normal tracking-[0.02em] text-acento">
              {ind.valor}
            </p>
            {ind.detalle && <p className="mt-2 text-xs text-texto-3">{ind.detalle}</p>}
          </div>
        ))}
      </section>

      <section className="pb-10">
        <h2 className="font-display text-4xl font-normal uppercase tracking-[0.03em] text-acento">
          Usuarios registrados
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
          {listaUsuarios.length === 0 ? (
            <EstadoVacio titulo="No hay usuarios" />
          ) : (
            <Tabla columnas={["Nombre", "Correo", "Rol", "Registro", "Cambiar rol"]}>
              {listaUsuarios.map((u) => (
                <tr key={u.id}>
                  <Celda className="font-medium">{u.nombre}</Celda>
                  <Celda className="text-texto-2">{u.email}</Celda>
                  <Celda><Chip>{roles[u.rol as Rol]?.etiqueta ?? u.rol}</Chip></Celda>
                  <Celda className="text-texto-2">{new Date(u.creado_en).toLocaleDateString("es-PE")}</Celda>
                  <Celda>
                    {u.id === admin.id ? (
                      <span className="text-xs text-texto-2">(tú)</span>
                    ) : (
                      // Gestionar roles: formulario pequeño por fila (Zod + función SQL cambiar_rol)
                      <form action={cambiarRol} className="flex items-center gap-2">
                        <input type="hidden" name="usuario_id" value={u.id} />
                        <label className="sr-only" htmlFor={`rol-${u.id}`}>Rol de {u.nombre}</label>
                        <select
                          id={`rol-${u.id}`}
                          name="rol"
                          defaultValue={u.rol}
                          className="campo rounded-control border px-2 py-1.5 text-sm"
                        >
                          {(Object.keys(roles) as Rol[]).map((r) => (
                            <option key={r} value={r}>{roles[r].etiqueta}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-control bg-acento px-3 py-1.5 font-display text-sm uppercase tracking-[0.03em] text-white hover:bg-acento-hover"
                        >
                          Guardar
                        </button>
                      </form>
                    )}
                  </Celda>
                </tr>
              ))}
            </Tabla>
          )}
        </div>
      </section>
    </Contenedor>
  );
}
