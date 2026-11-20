import { ExternalLink } from "lucide-react";
import { distritos, estadosReporte, tiposReporte, type EstadoReporte, type TipoReporte } from "@/lib/config";
import { urlOpenStreetMap } from "@/lib/reglas";
import { crearClienteServidor } from "@/lib/supabase/server";
import { MapaLimaNorte, type PuntoMapa } from "@/components/MapaLimaNorte";
import { Chip, Contenedor, Encabezado, EstadoVacio, PildoraFiltro, Tarjeta } from "@/components/ui";

// Mapa público de puntos críticos. Los datos vienen de la función SQL
// puntos_criticos(), que NO incluye quién hizo el reporte.
export default async function Mapa({
  searchParams,
}: {
  searchParams: Promise<{ distrito?: string }>;
}) {
  const { distrito: pedido } = await searchParams;
  const distrito = distritos.find((d) => d === pedido) ?? "";

  let puntos: PuntoMapa[] = [];
  let fallo = false;
  try {
    const supabase = await crearClienteServidor();
    const { data, error } = await supabase.rpc("puntos_criticos");
    if (error) fallo = true;
    puntos = ((data ?? []) as Record<string, unknown>[]).map((f) => ({
      id: Number(f.id),
      tipo: String(f.tipo),
      lat: Number(f.lat),
      lng: Number(f.lng),
      distrito: String(f.distrito),
      estado: String(f.estado),
    }));
  } catch {
    fallo = true;
  }
  if (distrito) puntos = puntos.filter((p) => p.distrito === distrito);

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Mapa público"
        titulo="Puntos críticos de Lima Norte"
        descripcion="Cada punto es un reporte de los vecinos. Toca un punto para verlo en OpenStreetMap."
      />

      <div className="flex flex-wrap items-center gap-2 pb-5">
        <span className="mr-1 text-sm font-semibold text-texto-2">Distrito</span>
        <PildoraFiltro href="/mapa" activa={distrito === ""}>Todos</PildoraFiltro>
        {distritos.map((d) => (
          <PildoraFiltro key={d} href={`/mapa?distrito=${encodeURIComponent(d)}`} activa={distrito === d}>
            {d}
          </PildoraFiltro>
        ))}
      </div>

      <div className="grid gap-8 pb-12 lg:grid-cols-[1.3fr_1fr]">
        <section aria-label="Mapa">
          <MapaLimaNorte puntos={puntos} />
        </section>

        <section aria-label="Lista de puntos">
          {fallo ? (
            <EstadoVacio titulo="No pudimos cargar los puntos" descripcion="Inténtalo de nuevo en unos minutos." />
          ) : puntos.length === 0 ? (
            <EstadoVacio titulo="Sin puntos críticos" descripcion="No hay reportes en este distrito." />
          ) : (
            <ul className="flex max-h-[34rem] flex-col gap-3 overflow-y-auto pr-1">
              {puntos.map((p) => (
                <li key={p.id}>
                  <Tarjeta className="!p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{tiposReporte[p.tipo as TipoReporte]?.etiqueta ?? p.tipo}</p>
                      <Chip tono={p.estado === "atendido" ? "atendido" : "pendiente"}>
                        {estadosReporte[p.estado as EstadoReporte]?.etiqueta ?? p.estado}
                      </Chip>
                    </div>
                    <p className="mt-1 text-sm text-texto-2">{p.distrito}</p>
                    <a
                      href={urlOpenStreetMap(p.lat, p.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-acento hover:underline"
                    >
                      Ver en OpenStreetMap <ExternalLink size={14} aria-hidden />
                    </a>
                  </Tarjeta>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Contenedor>
  );
}
