import { posicionEnMapa, urlOpenStreetMap } from "@/lib/reglas";
import { tiposReporte, type TipoReporte } from "@/lib/config";

export type PuntoMapa = {
  id: number;
  tipo: string;
  lat: number;
  lng: number;
  distrito: string;
  estado: string;
};

// Mapa estilizado propio (sin librerías): un recuadro que representa Lima Norte
// y pines posicionados con porcentajes a partir de lat/lng.
// Pendiente = ámbar, atendido = verde. Cada pin abre el punto en OpenStreetMap.
export function MapaLimaNorte({ puntos }: { puntos: PuntoMapa[] }) {
  return (
    <div>
      <div
        role="img"
        aria-label={`Mapa esquemático de Lima Norte con ${puntos.length} puntos críticos`}
        className="relative aspect-[5/6] w-full overflow-hidden rounded-tarjeta border border-borde-suave bg-seccion sm:aspect-[4/3]"
        style={{
          // Cuadrícula suave que imita un plano
          backgroundImage:
            "linear-gradient(to right, rgb(15 118 110 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 118 110 / 0.08) 1px, transparent 1px)",
          backgroundSize: "10% 10%",
        }}
      >
        <span className="absolute left-3 top-2 text-xs font-semibold uppercase tracking-widest text-texto-3">Norte ↑</span>
        <span className="absolute bottom-2 right-3 text-xs text-texto-3">Lima Norte (esquema)</span>

        {puntos.map((p) => {
          const { x, y } = posicionEnMapa(p.lat, p.lng);
          const atendido = p.estado === "atendido";
          const nombre = tiposReporte[p.tipo as TipoReporte]?.etiqueta ?? p.tipo;
          return (
            <a
              key={p.id}
              href={urlOpenStreetMap(p.lat, p.lng)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${nombre} · ${p.distrito} · ${atendido ? "Atendido" : "Pendiente"}`}
              aria-label={`${nombre} en ${p.distrito}, ${atendido ? "atendido" : "pendiente"}. Ver en OpenStreetMap`}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-transform hover:z-10 hover:scale-150 ${
                atendido ? "bg-acento" : "bg-resalte"
              }`}
            />
          );
        })}
      </div>

      {/* Leyenda */}
      <ul className="mt-3 flex flex-wrap gap-4 text-sm text-texto-2">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-resalte" aria-hidden /> Pendiente
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-acento" aria-hidden /> Atendido
        </li>
      </ul>
    </div>
  );
}
