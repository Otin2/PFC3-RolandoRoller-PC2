import Image from "next/image";
import { ImageOff } from "lucide-react";
import { estadosReporte, tiposReporte, type EstadoReporte, type TipoReporte } from "@/lib/config";
import { esEstadoReporte, esTipoReporte } from "@/lib/reglas";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { AtenderReporte } from "@/components/AtenderReporte";
import { Aviso, Chip, Contenedor, Encabezado, EstadoVacio, PildoraFiltro, Tarjeta } from "@/components/ui";

// Arma el enlace de un filtro conservando el otro filtro
function enlace(estado: string, tipo: string) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (tipo) params.set("tipo", tipo);
  const texto = params.toString();
  return texto ? `/fiscalizacion?${texto}` : "/fiscalizacion";
}

// Bandeja del fiscalizador: reportes de SU distrito (la política RLS ya filtra;
// aquí además se filtra por distrito para que el admin vea el distrito elegido).
export default async function Bandeja({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; tipo?: string; aviso?: string }>;
}) {
  const usuario = await exigirRol(["fiscalizador", "admin"]);
  const parametros = await searchParams;
  // Solo se aceptan valores conocidos (cualquier otra cosa = sin filtro)
  const estado = parametros.estado && esEstadoReporte(parametros.estado) ? parametros.estado : "";
  const tipo = parametros.tipo && esTipoReporte(parametros.tipo) ? parametros.tipo : "";

  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("reportes")
    .select("id, tipo, descripcion, foto_url, distrito, estado, nota, creado_en")
    .order("creado_en", { ascending: false });
  if (usuario.rol === "fiscalizador" && usuario.distrito) consulta = consulta.eq("distrito", usuario.distrito);
  if (estado) consulta = consulta.eq("estado", estado);
  if (tipo) consulta = consulta.eq("tipo", tipo);
  const { data } = await consulta;
  const reportes = data ?? [];

  const titulo = usuario.rol === "fiscalizador" && usuario.distrito ? `Bandeja de ${usuario.distrito}` : "Bandeja de reportes";

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Fiscalización"
        titulo={titulo}
        descripcion="Reportes de los vecinos que esperan atención del municipio."
      />

      {/* Filtros por estado y por tipo (query params) */}
      <div className="flex flex-col gap-3 pb-6">
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtrar por estado">
          <span className="mr-1 text-sm font-semibold text-texto-2">Estado</span>
          <PildoraFiltro href={enlace("", tipo)} activa={estado === ""}>Todos</PildoraFiltro>
          {Object.values(estadosReporte).map((e) => (
            <PildoraFiltro key={e.valor} href={enlace(e.valor, tipo)} activa={estado === e.valor}>
              {e.etiqueta}
            </PildoraFiltro>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtrar por tipo">
          <span className="mr-1 text-sm font-semibold text-texto-2">Tipo</span>
          <PildoraFiltro href={enlace(estado, "")} activa={tipo === ""}>Todos</PildoraFiltro>
          {Object.values(tiposReporte).map((t) => (
            <PildoraFiltro key={t.valor} href={enlace(estado, t.valor)} activa={tipo === t.valor}>
              {t.etiqueta}
            </PildoraFiltro>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-12">
        {parametros.aviso === "atendido" && <Aviso tipo="exito">El reporte quedó marcado como atendido.</Aviso>}
        {reportes.length === 0 ? (
          <EstadoVacio titulo="No hay reportes con esos filtros" descripcion="Cambia los filtros o vuelve más tarde." />
        ) : (
          <ul className="flex flex-col gap-4">
            {reportes.map((r) => (
              <li key={r.id}>
                <Tarjeta className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-seccion sm:h-24 sm:w-24">
                    {r.foto_url ? (
                      <Image src={r.foto_url} alt={`Foto del reporte #${r.id}`} fill sizes="96px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-tenue">
                        <ImageOff size={24} aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{tiposReporte[r.tipo as TipoReporte]?.etiqueta ?? r.tipo}</p>
                      <Chip tono={r.estado === "atendido" ? "atendido" : "pendiente"}>
                        {estadosReporte[r.estado as EstadoReporte]?.etiqueta ?? r.estado}
                      </Chip>
                    </div>
                    <p className="mt-1 text-sm text-texto-2">
                      {r.distrito} · {new Date(r.creado_en).toLocaleDateString("es-PE")}
                    </p>
                    {r.descripcion && <p className="mt-2 text-sm">{r.descripcion}</p>}
                    {r.nota && (
                      <p className="mt-2 rounded-control bg-seccion px-3 py-2 text-sm">
                        <span className="font-semibold">Nota:</span> {r.nota}
                      </p>
                    )}
                    {r.estado === "pendiente" && <AtenderReporte reporteId={r.id} volver={enlace(estado, tipo)} />}
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Contenedor>
  );
}
