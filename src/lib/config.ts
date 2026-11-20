// ============================================================
// CONFIGURACIÓN DEL CASO: PataLimpia
// Aquí se centralizan los textos, roles y listas fijas del sistema.
// Los valores deben coincidir con supabase/schema.sql.
// ============================================================

export const caso = {
  nombre: "PataLimpia",
  eslogan: "Mascotas y salubridad en Lima Norte",
  descripcion:
    "Los vecinos reportan puntos críticos con foto y ubicación, registran sus mascotas y el municipio atiende cada caso.",
};

// Roles del sistema (deben coincidir con el enum rol_usuario del SQL)
export const roles = {
  vecino: { valor: "vecino", etiqueta: "Vecino" },
  fiscalizador: { valor: "fiscalizador", etiqueta: "Fiscalizador" },
  admin: { valor: "admin", etiqueta: "Administrador" },
} as const;

export type Rol = keyof typeof roles;

// Roles que se pueden elegir al registrarse (el admin NO)
export const rolesRegistro: Rol[] = ["vecino", "fiscalizador"];

// Distritos de Lima Norte que cubre el sistema (igual que distrito_valido() del SQL)
export const distritos = ["Los Olivos", "Comas", "San Martín de Porres", "Independencia"] as const;
export type Distrito = (typeof distritos)[number];

// Tipos de punto crítico que se pueden reportar (check de reportes.tipo)
export const tiposReporte = {
  heces: { valor: "heces", etiqueta: "Heces" },
  orina: { valor: "orina", etiqueta: "Orina" },
  mascota_suelta: { valor: "mascota_suelta", etiqueta: "Mascota suelta" },
} as const;
export type TipoReporte = keyof typeof tiposReporte;

// Estados de un reporte (check de reportes.estado)
export const estadosReporte = {
  pendiente: { valor: "pendiente", etiqueta: "Pendiente" },
  atendido: { valor: "atendido", etiqueta: "Atendido" },
} as const;
export type EstadoReporte = keyof typeof estadosReporte;

// Especies de mascota (check de mascotas.especie)
export const especies = {
  perro: { valor: "perro", etiqueta: "Perro" },
  gato: { valor: "gato", etiqueta: "Gato" },
  otro: { valor: "otro", etiqueta: "Otro" },
} as const;
export type Especie = keyof typeof especies;

export const moneda = "S/";
