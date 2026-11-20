import { BarChart3 } from "lucide-react";
import { roles, type Rol } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { indicadoresPorDistrito } from "@/lib/reglas";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Celda, Chip, Contenedor, Encabezado, EstadoVacio, Tabla, Tarjeta } from "@/components/ui";

// Panel del administrador: indicadores por distrito calculados con la regla pura
// indicadoresPorDistrito. Solo el admin entra (middleware + exigirRol + RLS).
export default async function Admin() {
  await exigirRol(["admin"]);
  const supabase = await crearClienteServidor();

  const [{ data: reportes }, { data: mascotas }, { data: usuarios }] = await Promise.all([
    supabase.from("reportes").select("distrito, estado"),
    supabase.from("mascotas").select("distrito"),
    supabase.from("usuarios").select("id, nombre, email, rol, distrito, creado_en").order("creado_en", { ascending: false }),
  ]);

  const distritos = indicadoresPorDistrito(reportes ?? [], mascotas ?? []);
  const maximo = Math.max(1, ...distritos.map((d) => d.reportes)); // para escalar las barras
  const listaUsuarios = usuarios ?? [];

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Administración"
        titulo="Indicadores por distrito"
        descripcion="Cifras calculadas en vivo desde la base de datos."
      />

      {/* Tarjetas por distrito */}
      <section aria-label="Resumen por distrito" className="grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        {distritos.map((d) => (
          <Tarjeta key={d.distrito}>
            <h2 className="font-bold text-acento">{d.distrito}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-texto-2">Reportes</dt><dd className="tabular-nums font-bold">{d.reportes}</dd></div>
              <div className="flex justify-between"><dt className="text-texto-2">Atendidos</dt><dd className="tabular-nums font-bold">{d.porcentaje}%</dd></div>
              <div className="flex justify-between"><dt className="text-texto-2">Mascotas</dt><dd className="tabular-nums font-bold">{d.mascotas}</dd></div>
            </dl>
          </Tarjeta>
        ))}
      </section>

      {/* Gráfico de barras simple con divs: reportes atendidos y pendientes por distrito */}
      <section aria-label="Gráfico de reportes por distrito" className="pb-10">
        <h2 className="titulo-seccion flex items-center gap-2"><BarChart3 size={22} aria-hidden /> Reportes por distrito</h2>
        <Tarjeta className="mt-4">
          <ul className="flex flex-col gap-4">
            {distritos.map((d) => (
              <li key={d.distrito}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{d.distrito}</span>
                  <span className="tabular-nums text-texto-2">{d.atendidos} atendidos de {d.reportes}</span>
                </div>
                {/* El largo de la barra es proporcional al distrito con más reportes */}
                <div className="h-5 w-full overflow-hidden rounded-full bg-seccion">
                  <div className="flex h-full" style={{ width: `${(d.reportes / maximo) * 100}%` }}>
                    <div className="h-full bg-acento" style={{ flexGrow: d.atendidos }} />
                    <div className="h-full bg-resalte" style={{ flexGrow: d.reportes - d.atendidos }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex flex-wrap gap-4 text-sm text-texto-2">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-acento" aria-hidden /> Atendidos</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-resalte" aria-hidden /> Pendientes</li>
          </ul>
        </Tarjeta>
      </section>

      {/* Lista de usuarios (opcional) */}
      <section className="pb-12">
        <h2 className="titulo-seccion">Usuarios registrados</h2>
        <div className="mt-4">
          {listaUsuarios.length === 0 ? (
            <EstadoVacio titulo="No hay usuarios" />
          ) : (
            <Tabla columnas={["Nombre", "Correo", "Rol", "Distrito", "Registro"]}>
              {listaUsuarios.map((u) => (
                <tr key={u.id}>
                  <Celda className="font-medium">{u.nombre}</Celda>
                  <Celda className="text-texto-2">{u.email}</Celda>
                  <Celda><Chip>{roles[u.rol as Rol]?.etiqueta ?? u.rol}</Chip></Celda>
                  <Celda className="text-texto-2">{u.distrito}</Celda>
                  <Celda className="text-texto-2">{new Date(u.creado_en).toLocaleDateString("es-PE")}</Celda>
                </tr>
              ))}
            </Tabla>
          )}
        </div>
      </section>
    </Contenedor>
  );
}
