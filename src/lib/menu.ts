import { entidades, type Rol } from "./config";

export type OpcionMenu = {
  etiqueta: string;
  ruta: string;
  descripcion: string;
};

// El menú cambia según el rol del usuario
export function menuPorRol(rol: Rol | null): OpcionMenu[] {
  const { principal, hija, transaccion } = entidades;

  if (rol === "vendedor") {
    return [
      { etiqueta: `Mis ${principal.plural.toLowerCase()}`, ruta: principal.ruta, descripcion: `Registra y edita tus ${principal.plural.toLowerCase()}.` },
      { etiqueta: `Mis ${hija.plural.toLowerCase()}`, ruta: hija.ruta, descripcion: `Publica ${hija.plural.toLowerCase()} con precio y stock.` },
      { etiqueta: `${transaccion.plural} recibidos`, ruta: transaccion.ruta, descripcion: `${transaccion.plural} que incluyen tus ${hija.plural.toLowerCase()}.` },
    ];
  }

  if (rol === "comprador") {
    return [
      { etiqueta: `Buscar ${hija.plural.toLowerCase()}`, ruta: hija.rutaCatalogo, descripcion: `Encuentra ${hija.plural.toLowerCase()} y mira la ${principal.singular.toLowerCase()} que los vende.` },
      { etiqueta: `Nuevo ${transaccion.singular.toLowerCase()}`, ruta: `${transaccion.ruta}/nuevo`, descripcion: `Elige ${hija.plural.toLowerCase()} y cantidades.` },
      { etiqueta: `Mis ${transaccion.plural.toLowerCase()}`, ruta: transaccion.ruta, descripcion: `Revisa el estado y el detalle.` },
    ];
  }

  if (rol === "admin") {
    return [
      { etiqueta: "Indicadores", ruta: "/admin", descripcion: "Usuarios, registros y montos totales." },
      { etiqueta: principal.plural, ruta: principal.ruta, descripcion: `Todas las ${principal.plural.toLowerCase()} registradas.` },
      { etiqueta: hija.plural, ruta: hija.ruta, descripcion: `Todos los ${hija.plural.toLowerCase()}.` },
      { etiqueta: transaccion.plural, ruta: transaccion.ruta, descripcion: `Todos los ${transaccion.plural.toLowerCase()}.` },
    ];
  }

  return [];
}
