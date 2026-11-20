// Estado que devuelve cada server action a su formulario
export type EstadoFormulario = {
  error?: string; // error general (ej. credenciales inválidas)
  exito?: string; // mensaje de éxito
  errores?: Record<string, string>; // errores por campo (de Zod)
  valores?: Record<string, string>; // lo que escribió el usuario, para no perderlo
};

export const estadoInicial: EstadoFormulario = {};

// Convierte el FormData en { campo: valor } (solo textos).
export function leerFormulario(formData: FormData): Record<string, string> {
  const datos: Record<string, string> = {};
  for (const [clave, valor] of formData.entries()) {
    if (typeof valor === "string") datos[clave] = valor;
  }
  return datos;
}

// Lo que se devuelve al navegador para rellenar el formulario si hay error:
// NUNCA la contraseña ni los campos internos de Next.js ($ACTION_...).
export function valoresSeguros(datos: Record<string, string>): Record<string, string> {
  const seguros: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(datos)) {
    if (clave !== "password" && !clave.startsWith("$")) seguros[clave] = valor;
  }
  return seguros;
}
