// ============================================================
// REGLAS DE NEGOCIO PURAS (sin BD, sin React).
// Se prueban con pruebas unitarias en tests/reglas.test.ts
// ============================================================

export type ItemPedido = {
  producto_id: number;
  cantidad: number;
};

export type ProductoDisponible = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
};

// Redondea a 2 decimales (soles y céntimos)
export function redondear(monto: number): number {
  return Math.round(monto * 100) / 100;
}

// Total = suma de (precio x cantidad) de cada ítem
export function calcularTotal(
  items: { cantidad: number; precio_unitario: number }[],
): number {
  const total = items.reduce(
    (suma, item) => suma + item.cantidad * item.precio_unitario,
    0,
  );
  return redondear(total);
}

// Regla: no se puede pedir más de lo que hay en stock.
// Devuelve la lista de errores (vacía si todo está bien).
export function validarStock(
  items: ItemPedido[],
  productos: ProductoDisponible[],
): string[] {
  const errores: string[] = [];

  for (const item of items) {
    const producto = productos.find((p) => p.id === item.producto_id);
    if (!producto) {
      errores.push(`El producto ${item.producto_id} no existe`);
    } else if (item.cantidad > producto.stock) {
      errores.push(
        `"${producto.nombre}": pediste ${item.cantidad} y solo hay ${producto.stock}`,
      );
    }
  }
  return errores;
}

// Suma los montos de varias transacciones (indicador del panel admin)
export function sumarMontos(transacciones: { total: number | string }[]): number {
  return redondear(
    transacciones.reduce((suma, t) => suma + Number(t.total), 0),
  );
}

// Búsqueda: convierte lo que escribe el usuario en un patrón para ILIKE.
// Escapa % y _ para que se busquen como texto y no como comodines.
// Devuelve null si no hay nada que buscar.
export function patronBusqueda(texto: string | undefined | null): string | null {
  const limpio = (texto ?? "").trim().slice(0, 60);
  if (limpio.length === 0) return null;
  const escapado = limpio.replace(/[\\%_]/g, (c) => `\\${c}`);
  return `%${escapado}%`;
}

// ---------- Estados de la transacción ----------
// Flujo permitido: pendiente -> confirmado -> entregado (solo avanza).
// "cancelado" es final y solo se llega desde "pendiente" (lo hace el comprador).
const SIGUIENTE_ESTADO: Record<string, string | undefined> = {
  pendiente: "confirmado",
  confirmado: "entregado",
};

// ¿Se puede pasar del estado actual al nuevo? (lo usa el vendedor / admin)
export function transicionValida(actual: string, nuevo: string): boolean {
  return SIGUIENTE_ESTADO[actual] === nuevo;
}

// El siguiente estado posible, o null si ya no avanza (entregado / cancelado)
export function siguienteEstado(actual: string): string | null {
  return SIGUIENTE_ESTADO[actual] ?? null;
}

// Regla: el comprador solo puede cancelar si el pedido sigue pendiente
export function puedeCancelar(estado: string): boolean {
  return estado === "pendiente";
}

// Formato de dinero para mostrar en pantalla
export function formatearMonto(monto: number | string, moneda = "S/"): string {
  return `${moneda} ${Number(monto).toFixed(2)}`;
}
