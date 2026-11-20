import Image from "next/image";
import Link from "next/link";
import { fotosProductos } from "@/lib/contenido";
import { entidades, moneda } from "@/lib/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { formatearMonto, patronBusqueda } from "@/lib/reglas";
import { Buscador } from "@/components/Buscador";
import { BotonEnlace, Contenedor, Encabezado, EstadoVacio, PildoraFiltro } from "@/components/ui";

// Filtros de disponibilidad (píldoras)
const filtros = [
  { valor: "", etiqueta: "Todos" },
  { valor: "con", etiqueta: "Con stock" },
  { valor: "sin", etiqueta: "Sin stock" },
] as const;

// Caso de uso "Buscar productos": catálogo público con buscador por nombre
// y filtro por stock. Desde cada resultado se puede "Ver detalle" de su
// entidad principal (caso de uso «extend»).
export default async function Catalogo({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string }>;
}) {
  const { principal, hija, transaccion } = entidades;
  const { q, stock } = await searchParams;
  const patron = patronBusqueda(q);
  const supabase = await crearClienteServidor();

  let consulta = supabase
    .from(hija.tabla)
    .select(`id, nombre, precio, stock, ${principal.tabla}(id, nombre)`)
    .order("nombre")
    .limit(60);
  if (patron) consulta = consulta.ilike("nombre", patron);
  if (stock === "con") consulta = consulta.gt("stock", 0);
  if (stock === "sin") consulta = consulta.eq("stock", 0);
  // La sesión y el catálogo se consultan en paralelo
  const [{ data }, usuario] = await Promise.all([consulta, obtenerUsuarioActual()]);

  const resultados = ((data ?? []) as unknown as Record<string, unknown>[]).map((p) => ({
    id: p.id as number,
    nombre: p.nombre as string,
    precio: Number(p.precio),
    stock: p.stock as number,
    padre: p[principal.tabla] as { id: number; nombre: string } | null,
  }));

  // Arma la URL de un filtro conservando la búsqueda actual
  const urlFiltro = (valor: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (valor) params.set("stock", valor);
    const texto = params.toString();
    return texto ? `${hija.rutaCatalogo}?${texto}` : hija.rutaCatalogo;
  };

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Catálogo"
        titulo={`Buscar ${hija.plural.toLowerCase()}`}
        descripcion={`Encuentra ${hija.plural.toLowerCase()} por nombre y revisa la ${principal.singular.toLowerCase()} que los vende.`}
        accion={
          usuario?.rol === "comprador" && (
            <BotonEnlace href={`${transaccion.ruta}/nuevo${q ? `?q=${encodeURIComponent(q)}` : ""}`}>
              Hacer {transaccion.singular.toLowerCase()}
            </BotonEnlace>
          )
        }
      />

      <div className="flex flex-col gap-8 py-10">
        <div className="flex flex-col items-center gap-5">
          <Buscador accion={hija.rutaCatalogo} valor={q} placeholder={`Nombre del ${hija.singular.toLowerCase()}`} />
          {/* Píldoras de filtro: la activa va en rojo */}
          <nav aria-label="Filtrar por stock" className="flex flex-wrap justify-center gap-1.5">
            {filtros.map((f) => (
              <PildoraFiltro key={f.valor} href={urlFiltro(f.valor)} activa={(stock ?? "") === f.valor}>
                {f.etiqueta}
              </PildoraFiltro>
            ))}
          </nav>
        </div>

        {(patron || stock) && (
          <p className="etiqueta text-center text-sm text-texto-2">
            {resultados.length} resultado(s){patron && <> para “{q?.trim()}”</>}
          </p>
        )}

        {resultados.length === 0 ? (
          <EstadoVacio
            titulo={patron || stock ? "Sin resultados" : `Aún no hay ${hija.plural.toLowerCase()} publicados`}
            descripcion={patron || stock ? "Prueba con otra palabra o quita el filtro." : undefined}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resultados.map((p, i) => (
              <li key={p.id} className="revelar" style={{ transitionDelay: `${(i % 4) * 80}ms` }}>
                <div className="group flex h-full flex-col rounded-tarjeta border bg-superficie transition-all duration-300 border-black hover:-translate-y-1 hover:border-acento">
                  {/* Foto con borde ondulado (se turnan las fotos de contenido.ts) */}
                  <div className="flex aspect-square items-center justify-center rounded-t-tarjeta bg-fondo">
                    <div
                      className={`recorte-ondulado relative h-3/4 w-3/4 overflow-hidden transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 ${
                        p.stock > 0 ? "" : "opacity-40 grayscale"
                      }`}
                    >
                      <Image src={fotosProductos[i % fotosProductos.length]} alt="" fill sizes="(max-width: 640px) 70vw, 20vw" className="object-cover" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-5">
                    <p className="font-display text-2xl font-normal uppercase tracking-[0.02em] text-resalte">
                      {p.nombre}
                    </p>
                    <p className="text-sm text-texto-2 tabular-nums">
                      {formatearMonto(p.precio, moneda)} · {p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                    </p>
                    {p.padre && (
                      <Link
                        href={`${hija.rutaCatalogo}/${p.padre.id}`}
                        className="etiqueta mt-auto pt-4 text-xs font-medium underline-offset-4 text-white no-underline hover:text-resalte"
                      >
                        ⌖ {p.padre.nombre} ›
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Contenedor>
  );
}
