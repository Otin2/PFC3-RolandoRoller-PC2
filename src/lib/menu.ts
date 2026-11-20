import type { Rol } from "./config";

export type OpcionMenu = {
  etiqueta: string;
  ruta: string;
  descripcion: string;
};

// Opciones del panel según el rol del usuario
export function menuPorRol(rol: Rol | null): OpcionMenu[] {
  if (rol === "vecino") {
    return [
      { etiqueta: "Mis mascotas", ruta: "/mascotas", descripcion: "Registra a tus mascotas (tenencia responsable)." },
      { etiqueta: "Nuevo reporte", ruta: "/reportes/nuevo", descripcion: "Reporta un punto crítico con foto y ubicación." },
      { etiqueta: "Mis reportes", ruta: "/reportes", descripcion: "Mira el estado de lo que reportaste." },
      { etiqueta: "Mapa", ruta: "/mapa", descripcion: "Puntos críticos de Lima Norte." },
    ];
  }
  if (rol === "fiscalizador") {
    return [
      { etiqueta: "Bandeja", ruta: "/fiscalizacion", descripcion: "Reportes de tu distrito por atender." },
      { etiqueta: "Mapa", ruta: "/mapa", descripcion: "Puntos críticos de Lima Norte." },
    ];
  }
  if (rol === "admin") {
    return [
      { etiqueta: "Indicadores", ruta: "/admin", descripcion: "Reportes y mascotas por distrito." },
      { etiqueta: "Mapa", ruta: "/mapa", descripcion: "Puntos críticos de Lima Norte." },
    ];
  }
  return [];
}
