import Image from "next/image";
import { ImageOff, Plus } from "lucide-react";
import { estadosReporte, tiposReporte, type EstadoReporte, type TipoReporte } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Aviso, BotonEnlace, Chip, Contenedor, Encabezado, EstadoVacio, Tarjeta } from "@/components/ui";

// Mis reportes (solo vecinos): foto, tipo, distrito, fecha, estado y nota del fiscalizador
export default async function MisReportes({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const usuario = await exigirRol(["vecino"]);
  const { aviso } = await searchParams;
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("reportes")
    .select("id, tipo, descripcion, foto_url, distrito, estado, nota, creado_en")
    .eq("usuario_id", usuario.id)
    .order("creado_en", { ascending: false });
  const reportes = data ?? [];

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Reportes"
        titulo="Mis reportes"
        descripcion="Aquí ves si el municipio ya atendió lo que reportaste."
        accion={
          <BotonEnlace href="/reportes/nuevo">
            <Plus size={16} aria-hidden /> Nuevo reporte
          </BotonEnlace>
        }
      />

      <div className="flex flex-col gap-4 pb-12">
        {aviso === "creado" && <Aviso tipo="exito">Tu reporte fue enviado. Gracias por cuidar tu distrito.</Aviso>}

        {reportes.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hiciste reportes"
            descripcion="Si ves heces, orina o una mascota suelta, repórtalo con una foto."
            accion={<BotonEnlace href="/reportes/nuevo">Reportar un punto crítico</BotonEnlace>}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {reportes.map((r) => {
              const atendido = r.estado === "atendido";
              return (
                <li key={r.id}>
                  <Tarjeta className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-seccion sm:h-24 sm:w-24">
                      {r.foto_url ? (
                        <Image src={r.foto_url} alt={`Foto del reporte de ${tiposReporte[r.tipo as TipoReporte]?.etiqueta ?? r.tipo}`} fill sizes="96px" className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-tenue">
                          <ImageOff size={24} aria-hidden />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{tiposReporte[r.tipo as TipoReporte]?.etiqueta ?? r.tipo}</p>
                        <Chip tono={atendido ? "atendido" : "pendiente"}>
                          {estadosReporte[r.estado as EstadoReporte]?.etiqueta ?? r.estado}
                        </Chip>
                      </div>
                      <p className="mt-1 text-sm text-texto-2">
                        {r.distrito} · {new Date(r.creado_en).toLocaleDateString("es-PE")}
                      </p>
                      {r.descripcion && <p className="mt-2 text-sm">{r.descripcion}</p>}
                      {r.nota && (
                        <p className="mt-2 rounded-control bg-seccion px-3 py-2 text-sm">
                          <span className="font-semibold">Nota del fiscalizador:</span> {r.nota}
                        </p>
                      )}
                    </div>
                  </Tarjeta>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Contenedor>
  );
}
