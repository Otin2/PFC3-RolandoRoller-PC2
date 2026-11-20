import Image from "next/image";
import Link from "next/link";
import { caso, entidades, moneda } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearMonto } from "@/lib/reglas";
import { ejemplosCarrusel, fotosProductos, hero, inspiracion, localizador, mision, preguntas, suscripcion } from "@/lib/contenido";
import { BotonEnlace, Contenedor } from "@/components/ui";
import { Carrusel, type GrupoCarrusel } from "@/components/Carrusel";
import { Inspiracion } from "@/components/Inspiracion";
import { PestanasMision } from "@/components/PestanasMision";

// ============================================================
// LANDING (plantilla estilo póster)
// Secciones: 1 Hero · 2 Pestañas + carrusel (datos reales de la BD)
// 3 Inspiración · 4 Misión · 5 Preguntas · 6 Localizador · 7 Suscripción
// Los textos y fotos se editan en src/lib/contenido.ts
// ============================================================
export default async function Inicio() {
  const { principal, hija } = entidades;
  const supabase = await crearClienteServidor();

  // Datos reales: entidades principales con sus productos (RLS permite leer el catálogo)
  const { data } = await supabase
    .from(principal.tabla)
    .select(`id, nombre, ${hija.tabla}(id, nombre, precio, stock)`)
    .order("creado_en", { ascending: false })
    .limit(4);

  let indiceFoto = 0;
  const gruposReales: GrupoCarrusel[] = ((data ?? []) as unknown as Record<string, unknown>[])
    .map((padre) => ({
      id: padre.id as number,
      nombre: padre.nombre as string,
      items: ((padre[hija.tabla] as Record<string, unknown>[] | null) ?? []).map((h) => ({
        id: h.id as number,
        nombre: h.nombre as string,
        detalle: `${formatearMonto(h.precio as number, moneda)} · ${(h.stock as number) > 0 ? `Stock: ${h.stock}` : "Sin stock"}`,
        foto: fotosProductos[indiceFoto++ % fotosProductos.length],
        hrefPrincipal: `${hija.rutaCatalogo}?q=${encodeURIComponent(h.nombre as string)}`,
        hrefSecundario: `${hija.rutaCatalogo}/${padre.id}`,
      })),
    }))
    .filter((g) => g.items.length > 0)
    .slice(0, 3);

  // Si la BD todavía no tiene datos, se muestran ejemplos (se reemplazan solos)
  const usaEjemplos = gruposReales.length === 0;
  const grupos: GrupoCarrusel[] = usaEjemplos
    ? ejemplosCarrusel.grupos.map((g, gi) => ({
        id: `ejemplo-${gi}`,
        nombre: g.nombre,
        items: g.items.map((nombre, i) => ({
          id: `${gi}-${i}`,
          nombre,
          detalle: "Ejemplo",
          foto: fotosProductos[(gi * 3 + i) % fotosProductos.length],
          hrefPrincipal: hija.rutaCatalogo,
          hrefSecundario: hija.rutaCatalogo,
        })),
      }))
    : gruposReales;

  // Posiciones de las 4 fotos del hero (esquinas) y su velocidad de parallax
  const esquinas = [
    "left-[6%] top-4 w-[13vw] min-w-[110px] -rotate-6 parallax-lento",
    "right-[8%] top-16 w-[12vw] min-w-[100px] rotate-6 parallax-rapido",
    "left-[3%] bottom-0 w-[14vw] min-w-[120px] rotate-3 parallax-rapido",
    "right-[4%] bottom-6 w-[13vw] min-w-[110px] -rotate-3 parallax-lento",
  ];

  return (
    <div>
      {/* ===== 1) HERO ===== */}
      <section className="relative overflow-hidden pb-24 pt-6 sm:pb-32">
        {hero.fotosEsquinas.map((foto, i) => (
          <div
            key={foto}
            aria-hidden
            className={`absolute hidden aspect-[3/4] sm:block ${esquinas[i]}`}
          >
            {/* 3 capas, cada una con su animación: parallax (afuera), entrada, flotar (adentro) */}
            <div className="h-full w-full" style={{ animation: `subir 1s cubic-bezier(0.2,0.8,0.2,1) ${300 + i * 150}ms both` }}>
              <div className="recorte-ondulado-animado relative h-full w-full overflow-hidden animate-flotar" style={{ animationDelay: `${-i * 1.7}s` }}>
                <Image src={foto} alt="" fill sizes="15vw" className="object-cover" />
              </div>
            </div>
          </div>
        ))}

        <Contenedor>
          <div className="relative z-10 mx-auto max-w-4xl py-16 text-center sm:py-24">
            <p className="font-display text-xl tracking-[0.02em] text-white">{caso.nombre}</p>
            <p className="antetitulo mt-6 text-sm font-black uppercase tracking-[0.12em] text-acento">{hero.antetitulo}</p>
            <h1 className="titulo-display mt-3" style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}>
              <span className="block overflow-hidden">
                <span className="inline-block animate-subir">{hero.linea1}</span>
              </span>
              {/* Foto redonda que "se asoma" entre las dos líneas */}
              <span className="relative z-10 mx-auto -my-[0.18em] block h-[0.42em] w-[0.9em] overflow-hidden rounded-[50%] border-4 border-white/90 shadow-none animate-flotar">
                <Image src={hero.fotoCentral} alt="" fill sizes="160px" className="object-cover" priority />
              </span>
              <span className="block overflow-hidden">
                <span className="inline-block whitespace-nowrap animate-subir text-[0.78em] [animation-delay:150ms]">{hero.linea2}</span>
              </span>
            </h1>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <BotonEnlace href="/registro" chevrones>
                Empezar
              </BotonEnlace>
              <BotonEnlace href={hija.rutaCatalogo} chevrones>
                Buscar {hija.plural.toLowerCase()}
              </BotonEnlace>
            </div>
          </div>
        </Contenedor>

        {/* Sticker que se balancea */}
        <span className="sticker absolute right-[22%] top-[44%] z-20 hidden rounded-[40%] bg-resalte px-4 py-2 font-display text-2xl uppercase text-fondo lg:block">
          {hero.sticker}
        </span>
      </section>

      {/* ===== 2) PESTAÑAS + CARRUSEL ===== */}
      <section className="py-20">
        <p className="revelar text-center font-display text-2xl tracking-[0.02em] text-resalte">
          Hablando de {hija.plural.toLowerCase()}…
        </p>
        <div className="revelar mt-8">
          <Carrusel grupos={grupos} textoPrincipal="Ver más" textoSecundario="Dónde" />
        </div>
        {usaEjemplos && <p className="mt-6 text-center text-xs text-resalte/70">{ejemplosCarrusel.aviso}</p>}
      </section>

      {/* ===== 3) INSPIRACIÓN ===== */}
      <section className="py-20">
        <Contenedor>
          <div className="revelar">
            <Inspiracion datos={inspiracion} hrefTodo={hija.rutaCatalogo} />
          </div>
        </Contenedor>
      </section>

      {/* ===== 4) MISIÓN ===== */}
      <section id="mision" className="scroll-mt-24 py-24">
        <Contenedor>
          <div className="revelar relative text-center">
            <h2 className="titulo-display">
              <span className="block">{mision.linea1}</span>
              <span className="mt-[0.1em] block">{mision.linea2}</span>
            </h2>
            <span className="sticker absolute left-[58%] top-[38%] rounded-[40%] bg-resalte px-4 py-1.5 font-display text-xl uppercase text-fondo">
              {mision.sticker}
            </span>
            <p className="mx-auto mt-10 max-w-2xl text-lg text-white">{mision.texto}</p>
            <p className="mt-8 font-display text-lg uppercase tracking-[0.03em] text-resalte">{mision.autor}</p>
          </div>
          <div className="mt-20">
            <PestanasMision datos={mision} hrefs={[hija.rutaCatalogo, "/registro"]} />
          </div>
        </Contenedor>
      </section>

      {/* ===== 5) PREGUNTAS FRECUENTES ===== */}
      <section id="preguntas" className="scroll-mt-24 py-24">
        <Contenedor>
          <div className="revelar text-center">
            <p className="antetitulo text-sm font-black uppercase tracking-[0.12em] text-acento">{preguntas.linea1}</p>
            <h2 className="titulo-display mt-3">{preguntas.linea2}</h2>
            <p className="mx-auto mt-8 max-w-xl text-lg text-white">{preguntas.texto}</p>
          </div>
          <div className="mx-auto mt-14 flex max-w-2xl flex-col gap-4">
            {preguntas.items.map((item, i) => (
              // <details> es un acordeón nativo de HTML: no necesita JavaScript
              <details
                key={item.pregunta}
                className="revelar group rounded-[30px] bg-seccion px-7 py-6"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl uppercase leading-tight tracking-[0.02em] text-white sm:text-3xl [&::-webkit-details-marker]:hidden">
                  {item.pregunta}
                  <span aria-hidden className="text-2xl transition-transform duration-300 group-open:rotate-180">↓</span>
                </summary>
                <p className="mt-4 text-base text-resalte">{item.respuesta}</p>
              </details>
            ))}
          </div>
          <div className="revelar mt-20 text-center">
            <h3 className="titulo-seccion">{preguntas.pie}</h3>
            <p className="mt-6 text-white">{preguntas.pieTexto}</p>
            <div className="mt-6">
              <BotonEnlace href="/registro" chevrones>
                Contáctanos
              </BotonEnlace>
            </div>
          </div>
        </Contenedor>
      </section>

      {/* ===== 6) LOCALIZADOR (tarjeta rosa con punta y mapa) ===== */}
      <section className="py-20">
        <Contenedor>
          <div className="abrir recorte-punta mx-auto max-w-4xl overflow-hidden bg-resalte">
            <div className="px-6 pb-10 pt-20 text-center">
              <p className="antetitulo text-sm font-black uppercase tracking-[0.12em] text-fondo">{localizador.antetitulo}</p>
              <h2 className="mt-3 font-display text-[clamp(3.5rem,10vw,7rem)] uppercase leading-[0.8] tracking-[0.03em] text-fondo">
                {localizador.titulo}
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-fondo">{localizador.texto}</p>
            </div>
            <div className="mapa relative flex h-64 items-center justify-center">
              <Link
                href={hija.rutaCatalogo}
                className="group rounded-[15px] bg-fondo px-5 py-2.5 font-display text-lg uppercase tracking-[0.03em] text-white transition-transform hover:scale-105"
              >
                <span className="mr-2 text-xs">›</span>
                {localizador.boton}
                <span className="ml-2 text-xs">‹</span>
              </Link>
            </div>
          </div>
        </Contenedor>
      </section>

      {/* ===== 7) SUSCRIPCIÓN / REGISTRO ===== */}
      <section className="pb-24 pt-10">
        <Contenedor>
          <div className="revelar grid items-center gap-8 md:grid-cols-2">
            <h2 className="font-display text-3xl uppercase leading-tight tracking-[0.02em] text-white sm:text-4xl">
              {suscripcion.titulo}
            </h2>
            <div className="flex items-center justify-between gap-4 rounded-full bg-white py-2 pl-6 pr-2">
              <span className="text-sm text-fondo/70">{suscripcion.campo}</span>
              <Link
                href="/registro"
                className="shrink-0 rounded-full bg-acento px-4 py-2 font-display text-base uppercase tracking-[0.03em] text-white hover:bg-acento-hover"
              >
                {suscripcion.boton}
              </Link>
            </div>
          </div>
        </Contenedor>
      </section>
    </div>
  );
}
