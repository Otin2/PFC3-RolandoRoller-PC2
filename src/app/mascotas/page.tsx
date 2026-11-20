import { Cat, Dog, PawPrint } from "lucide-react";
import { distritos, especies, type Especie } from "@/lib/config";
import { exigirRol } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearMascota } from "@/lib/acciones/mascotas";
import { Formulario } from "@/components/Formulario";
import { Contenedor, Encabezado, EstadoVacio, Tarjeta } from "@/components/ui";

// Icono según la especie
const iconos: Record<Especie, typeof Dog> = { perro: Dog, gato: Cat, otro: PawPrint };

// Mis mascotas (solo vecinos): lista en tarjetas + formulario de registro
export default async function Mascotas() {
  const usuario = await exigirRol(["vecino"]);
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("mascotas")
    .select("id, nombre, especie, distrito")
    .eq("usuario_id", usuario.id)
    .order("creado_en", { ascending: false });
  const mascotas = data ?? [];

  return (
    <Contenedor>
      <Encabezado
        antetitulo="Tenencia responsable"
        titulo="Mis mascotas"
        descripcion="Registra a tus mascotas para que el municipio sepa quién cuida a cada una."
      />

      <div className="grid gap-8 pb-12 lg:grid-cols-[1fr_380px]">
        <section aria-label="Lista de mascotas">
          {mascotas.length === 0 ? (
            <EstadoVacio
              titulo="Aún no registraste mascotas"
              descripcion="Usa el formulario para registrar a tu primera mascota."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {mascotas.map((m) => {
                const Icono = iconos[m.especie as Especie] ?? PawPrint;
                return (
                  <li key={m.id}>
                    <Tarjeta className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-acento-suave text-acento">
                        <Icono size={24} aria-hidden />
                      </span>
                      <div>
                        <p className="font-bold">{m.nombre}</p>
                        <p className="text-sm text-texto-2">
                          {especies[m.especie as Especie]?.etiqueta ?? m.especie} · {m.distrito}
                        </p>
                      </div>
                    </Tarjeta>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside>
          <Tarjeta>
            <h2 className="titulo-seccion mb-4">Registrar mascota</h2>
            <Formulario
              accion={crearMascota}
              textoBoton="Registrar mascota"
              campos={[
                { nombre: "nombre", etiqueta: "Nombre" },
                {
                  nombre: "especie",
                  etiqueta: "Especie",
                  tipo: "select",
                  opciones: Object.values(especies).map((e) => ({ valor: e.valor, etiqueta: e.etiqueta })),
                },
                {
                  nombre: "distrito",
                  etiqueta: "Distrito",
                  tipo: "select",
                  valorInicial: usuario.distrito ?? "",
                  opciones: distritos.map((d) => ({ valor: d, etiqueta: d })),
                },
              ]}
            />
          </Tarjeta>
        </aside>
      </div>
    </Contenedor>
  );
}
