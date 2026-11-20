import { beforeEach, describe, expect, it, vi } from "vitest";

// ============================================================
// PRUEBA DE INTEGRACIÓN (Bottom-Up)
// Une los módulos ya probados por separado (Zod + regla de stock)
// con la acción que crea la transacción. Solo se simulan los bordes
// externos: la sesión, Supabase y la navegación de Next.js.
// ============================================================

// --- Base de datos falsa en memoria ---
const productosBD = [
  { id: 1, nombre: "Polo básico", precio: "25.00", stock: 50 },
  { id: 2, nombre: "Jean clásico", precio: "79.90", stock: 20 },
  { id: 3, nombre: "Casaca", precio: "120.00", stock: 8 },
];
let llamadasRpc: { funcion: string; parametros: unknown }[] = [];

function crearSupabaseFalso() {
  return {
    from() {
      return {
        // SELECT ... IN (ids) -> devuelve los productos pedidos
        select: () => ({
          in: (_columna: string, ids: number[]) =>
            Promise.resolve({ data: productosBD.filter((p) => ids.includes(p.id)), error: null }),
        }),
      };
    },
    // crear_pedido (función de la BD) -> devuelve el id del pedido nuevo
    rpc: (funcion: string, parametros: unknown) => {
      llamadasRpc.push({ funcion, parametros });
      return Promise.resolve({ data: 101, error: null });
    },
  };
}

// --- Bordes externos simulados ---
vi.mock("@/lib/sesion", () => ({
  exigirRol: vi.fn(async () => ({ id: "uuid-comprador", email: "demo@demo.com", nombre: "Demo", rol: "comprador" })),
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

import { crearTransaccion } from "@/lib/acciones/transaccion";

function formulario(cantidades: Record<number, number>) {
  const fd = new FormData();
  for (const [id, cantidad] of Object.entries(cantidades)) fd.append(`cantidad_${id}`, String(cantidad));
  return fd;
}

describe("Integración: crear transacción con su detalle", () => {
  beforeEach(() => {
    llamadasRpc = [];
  });

  it("llama a crear_pedido con los ítems validados y redirige al detalle", async () => {
    await expect(crearTransaccion({}, formulario({ 1: 2, 2: 1 }))).rejects.toThrow("REDIRECT:/pedidos/101");

    expect(llamadasRpc).toEqual([
      {
        funcion: "crear_pedido",
        parametros: {
          p_items: [
            { producto_id: 1, cantidad: 2 },
            { producto_id: 2, cantidad: 1 },
          ],
        },
      },
    ]);
  });

  it("no llama a la BD si una cantidad supera el stock", async () => {
    const estado = await crearTransaccion({}, formulario({ 3: 9 }));

    expect(estado.error).toContain("solo hay 8");
    expect(llamadasRpc).toHaveLength(0);
  });

  it("no llama a la BD si no se eligió ningún ítem (Zod)", async () => {
    const estado = await crearTransaccion({}, formulario({ 1: 0 }));

    expect(estado.error).toBe("Elige al menos un producto");
    expect(llamadasRpc).toHaveLength(0);
  });
});
