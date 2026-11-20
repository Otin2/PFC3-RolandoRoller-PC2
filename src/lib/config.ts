// ============================================================
// CONFIGURACIÓN DEL CASO
// El día del examen se cambian SOLO estos textos para adaptar
// la aplicación al caso (nombres visibles, actores, entidades).
// Los nombres de tablas deben coincidir con supabase/schema.sql.
// ============================================================

export const caso = {
  nombre: "[CASO]",
  eslogan: "Conectamos [actor 2] con [actor 1]",
  // Segunda línea entre paréntesis del título gigante (recurso de la guía de diseño)
  aparte: "(en un solo lugar)",
  descripcion:
    "Plataforma web para registrar [entidad principal], publicar [entidad hija] y gestionar [transacciones] con datos reales.",
};

// Roles del sistema (deben coincidir con el enum rol_usuario del SQL)
export const roles = {
  comprador: { valor: "comprador", etiqueta: "Comprador" },
  vendedor: { valor: "vendedor", etiqueta: "Vendedor" },
  admin: { valor: "admin", etiqueta: "Administrador" },
} as const;

export type Rol = keyof typeof roles;

// Roles que se pueden elegir al registrarse (el admin NO)
export const rolesRegistro: Rol[] = ["comprador", "vendedor"];

// Entidades: nombre de la tabla + textos visibles
export const entidades = {
  principal: {
    tabla: "tiendas",
    singular: "Tienda",
    plural: "Tiendas",
    ruta: "/tiendas",
    campoExtra: "Rubro", // columna "rubro" de la tabla
  },
  hija: {
    tabla: "productos",
    singular: "Producto",
    plural: "Productos",
    ruta: "/productos",
    rutaCatalogo: "/catalogo", // búsqueda pública y detalle de cada entidad principal
  },
  transaccion: {
    tabla: "pedidos",
    tablaDetalle: "detalle_pedido",
    singular: "Pedido",
    plural: "Pedidos",
    ruta: "/pedidos",
  },
} as const;

// Estados posibles de una transacción (check del SQL)
export const estadosTransaccion = [
  "pendiente",
  "confirmado",
  "entregado",
  "cancelado",
] as const;

export const moneda = "S/";
