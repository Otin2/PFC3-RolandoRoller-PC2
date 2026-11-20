import { Camera, ClipboardCheck, MapPin, PawPrint, ShieldCheck } from "lucide-react";
import { caso, distritos } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { porcentajeAtendidos } from "@/lib/reglas";
import { BotonEnlace, Contenedor } from "@/components/ui";

type Estadisticas = { reportes: number; atendidos: number; mascotas: number };

// Indicadores reales de la BD (función pública estadisticas_publicas).
// Si algo falla (sin conexión, sin tablas), se muestran ceros.
async function leerEstadisticas(): Promise<Estadisticas> {
  try {
    const supabase = await crearClienteServidor();
    const { data, error } = await supabase.rpc("estadisticas_publicas");
    const fila = Array.isArray(data) ? data[0] : data;
    if (error || !fila) return { reportes: 0, atendidos: 0, mascotas: 0 };
    return {
      reportes: Number(fila.reportes ?? 0),
      atendidos: Number(fila.atendidos ?? 0),
      mascotas: Number(fila.mascotas ?? 0),
    };
  } catch {
    return { reportes: 0, atendidos: 0, mascotas: 0 };
  }
}

const pasos = [
  { icono: Camera, titulo: "Reporta con foto", texto: "Toma una foto del punto crítico, marca dónde está y envía el reporte desde tu celular." },
  { icono: ClipboardCheck, titulo: "El municipio atiende", texto: "El fiscalizador de tu distrito revisa el reporte, limpia la zona y registra sanciones si corresponde." },
  { icono: ShieldCheck, titulo: "Tu distrito mejora", texto: "Ves el estado de tu reporte y el mapa público muestra cómo baja la cantidad de puntos críticos." },
];

export default async function Inicio() {
  const stats = await leerEstadisticas();
  const indicadores = [
    { valor: stats.reportes, etiqueta: "Reportes recibidos" },
    { valor: `${porcentajeAtendidos(stats.atendidos, stats.reportes)}%`, etiqueta: "Reportes atendidos" },
    { valor: stats.mascotas, etiqueta: "Mascotas registradas" },
  ];

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="bg-seccion">
        <Contenedor>
          <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="antetitulo text-xs text-acento">{caso.eslogan}</p>
              <h1 className="titulo-display mt-3">Lima Norte más limpia, una huella a la vez</h1>
              <p className="mt-5 max-w-xl text-lg text-texto-2">
                Las calles con heces, orina y mascotas sueltas afectan la salud de todos. Aquí los vecinos
                reportan estos puntos críticos y el municipio los atiende de forma ordenada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <BotonEnlace href="/reportes/nuevo">Reportar un punto crítico</BotonEnlace>
                <BotonEnlace href="/mascotas" variante="secundario">Registrar mi mascota</BotonEnlace>
              </div>
            </div>

            {/* Ilustración simple hecha con iconos */}
            <div aria-hidden className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-acento-suave sm:h-72 sm:w-72">
              <PawPrint className="h-28 w-28 text-acento sm:h-36 sm:w-36" strokeWidth={1.5} />
              <span className="absolute left-2 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-superficie text-acento border border-borde-suave">
                <MapPin size={26} />
              </span>
              <span className="absolute bottom-6 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-resalte text-white">
                <Camera size={26} />
              </span>
            </div>
          </div>
        </Contenedor>
      </section>

      {/* ===== Indicadores reales ===== */}
      <section className="border-b border-borde-suave bg-superficie">
        <Contenedor>
          <dl className="grid grid-cols-3 gap-4 py-8 text-center">
            {indicadores.map((ind) => (
              <div key={ind.etiqueta}>
                <dd className="tabular-nums text-3xl font-extrabold text-acento sm:text-4xl">{ind.valor}</dd>
                <dt className="mt-1 text-xs text-texto-2 sm:text-sm">{ind.etiqueta}</dt>
              </div>
            ))}
          </dl>
        </Contenedor>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section className="py-16">
        <Contenedor>
          <h2 className="titulo-seccion text-center">Cómo funciona</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {pasos.map((paso, i) => {
              const Icono = paso.icono;
              return (
                <li key={paso.titulo} className="rounded-tarjeta border border-borde-suave bg-superficie p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-acento-suave text-acento">
                      <Icono size={22} aria-hidden />
                    </span>
                    <span className="text-sm font-bold text-resalte">Paso {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{paso.titulo}</h3>
                  <p className="mt-2 text-sm text-texto-2">{paso.texto}</p>
                </li>
              );
            })}
          </ol>
        </Contenedor>
      </section>

      {/* ===== Distritos ===== */}
      <section className="bg-acento py-10 text-white">
        <Contenedor>
          <p className="text-center text-sm font-semibold uppercase tracking-widest opacity-80">Distritos que cubrimos</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {distritos.map((d) => (
              <li key={d} className="flex items-center justify-center gap-2 rounded-control bg-white/10 px-3 py-3 text-center text-sm font-semibold">
                <MapPin size={16} aria-hidden /> {d}
              </li>
            ))}
          </ul>
        </Contenedor>
      </section>
    </div>
  );
}
