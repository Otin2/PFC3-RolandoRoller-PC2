import { z } from "zod";
import { distritos } from "./config";

// ============================================================
// CAPA DE NEGOCIO: esquemas Zod.
// Toda entrada del usuario pasa por aquí ANTES de ir a la BD.
// ============================================================

// Supabase exige mínimo 6 caracteres en la contraseña
export const LARGO_MINIMO_CLAVE = 6;

export const esquemaLogin = z.object({
  email: z.email({ error: "Ingresa un correo válido" }),
  password: z
    .string()
    .min(LARGO_MINIMO_CLAVE, { error: `Mínimo ${LARGO_MINIMO_CLAVE} caracteres` }),
});

export const esquemaRegistro = esquemaLogin.extend({
  nombre: z
    .string()
    .trim()
    .min(2, { error: "Ingresa tu nombre" })
    .max(80, { error: "Máximo 80 caracteres" }),
  // El admin NO se puede elegir al registrarse
  rol: z.enum(["vecino", "fiscalizador"], { error: "Elige un rol válido" }),
  // Distrito de Lima Norte: el fiscalizador atiende SOLO su distrito
  distrito: z.enum(distritos, { error: "Elige tu distrito" }),
});

// Convierte los errores de Zod en { campo: "mensaje" } para el formulario
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const planos = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const resultado: Record<string, string> = {};
  for (const [campo, mensajes] of Object.entries(planos)) {
    if (mensajes && mensajes.length > 0) resultado[campo] = mensajes[0];
  }
  return resultado;
}

// Distrito: debe ser uno de los 4 de Lima Norte (registro, mascotas y reportes)
export const esquemaDistrito = z.enum(distritos, { error: "Elige un distrito" });

// Mascota del vecino (tabla mascotas)
export const esquemaMascota = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: "Ingresa el nombre de la mascota" })
    .max(60, { error: "Máximo 60 caracteres" }),
  especie: z.enum(["perro", "gato", "otro"], { error: "Elige la especie" }),
  distrito: esquemaDistrito,
});
