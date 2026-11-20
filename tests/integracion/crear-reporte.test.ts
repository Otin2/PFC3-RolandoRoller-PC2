import { beforeEach, describe, expect, it, vi } from "vitest";

// ============================================================
// PRUEBA DE INTEGRACIÓN (Bottom-Up)
// Une los módulos ya probados por separado (Zod + reglas de foto y
// coordenadas) con la acción que crea el reporte. Solo se simulan los
// bordes externos: la sesión, Supabase (Storage + BD) y Next.js.
// ============================================================

// --- Supabase falso: guarda lo que la acción le pide ---
let subidas: { ruta: string; tipo: string | undefined }[] = [];
let borradas: string[][] = [];
let insertados: Record<string, unknown>[] = [];
let fallaInsert = false;

function crearSupabaseFalso() {
  return {
    storage: {
      from: () => ({
        upload: (ruta: string, _archivo: File, opciones?: { contentType?: string }) => {
          subidas.push({ ruta, tipo: opciones?.contentType });
          return Promise.resolve({ error: null });
        },
        getPublicUrl: (ruta: string) => ({ data: { publicUrl: `https://demo.supabase.co/storage/v1/object/public/reportes/${ruta}` } }),
        remove: (rutas: string[]) => {
          borradas.push(rutas);
          return Promise.resolve({ error: null });
        },
      }),
    },
    from: () => ({
      insert: (fila: Record<string, unknown>) => {
        insertados.push(fila);
        return Promise.resolve({ error: fallaInsert ? { message: "falla" } : null });
      },
    }),
  };
}

// --- Bordes externos simulados ---
vi.mock("@/lib/sesion", () => ({
  exigirRol: vi.fn(async () => ({ id: "uuid-vecino", email: "v@demo.com", nombre: "Vecino", distrito: "Los Olivos", rol: "vecino" })),
}));
vi.mock("@/lib/supabase/server", () => ({
  crearClienteServidor: vi.fn(async () => crearSupabaseFalso()),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  // redirect() de Next.js corta la ejecución lanzando un error; aquí igual
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { crearReporte } from "@/lib/acciones/reportes";

type Opciones = { foto?: File | null; campos?: Record<string, string> };

function formulario({ foto, campos }: Opciones = {}) {
  const fd = new FormData();
  const base = { tipo: "heces", lat: "-11.962", lng: "-77.071", distrito: "Los Olivos", descripcion: "Frente al parque", ...campos };
  for (const [k, v] of Object.entries(base)) fd.append(k, v);
  const archivo = foto === undefined ? new File(["x"], "foto.jpg", { type: "image/jpeg" }) : foto;
  if (archivo) fd.append("foto", archivo);
  return fd;
}

describe("Integración: crear reporte con foto", () => {
  beforeEach(() => {
    subidas = [];
    borradas = [];
    insertados = [];
    fallaInsert = false;
  });

  it("sube la foto a la carpeta del usuario, guarda el reporte pendiente y redirige", async () => {
    await expect(crearReporte({}, formulario())).rejects.toThrow("REDIRECT:/reportes?aviso=creado");

    expect(subidas).toHaveLength(1);
    expect(subidas[0].ruta).toMatch(/^uuid-vecino\/\d+\.jpg$/);
    expect(subidas[0].tipo).toBe("image/jpeg");
    expect(insertados).toHaveLength(1);
    expect(insertados[0]).toMatchObject({
      usuario_id: "uuid-vecino",
      tipo: "heces",
      lat: -11.962,
      distrito: "Los Olivos",
      estado: "pendiente",
    });
    expect(String(insertados[0].foto_url)).toContain("/reportes/uuid-vecino/");
  });

  it("no toca Storage ni la BD si no se adjuntó foto", async () => {
    const estado = await crearReporte({}, formulario({ foto: null }));

    expect(estado.errores?.foto).toBe("Agrega una foto del lugar");
    expect(subidas).toHaveLength(0);
    expect(insertados).toHaveLength(0);
  });

  it("rechaza un archivo que no es imagen permitida", async () => {
    const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const estado = await crearReporte({}, formulario({ foto: pdf }));

    expect(estado.errores?.foto).toBe("La foto debe ser JPG, PNG o WebP");
    expect(subidas).toHaveLength(0);
  });

  it("rechaza coordenadas fuera de Lima Norte (Zod) sin subir la foto", async () => {
    const estado = await crearReporte({}, formulario({ campos: { lat: "-12.5" } }));

    expect(estado.errores?.lat).toBe("La ubicación debe estar en Lima Norte");
    expect(subidas).toHaveLength(0);
    expect(insertados).toHaveLength(0);
  });

  it("si falla el insert, borra la foto subida y devuelve un error", async () => {
    fallaInsert = true;
    const estado = await crearReporte({}, formulario());

    expect(estado.error).toContain("No se pudo guardar");
    expect(borradas).toEqual([[subidas[0].ruta]]);
  });
});
