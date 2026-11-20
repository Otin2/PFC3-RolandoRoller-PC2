import { z } from "zod";
import { distritos } from "./config";
import { LIMITES_LIMA_NORTE as L, MULTA_MAXIMA } from "./reglas";

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

// Un campo vacío ("") se trata como "no llenado" para que NO se convierta en 0
const vacioComoNulo = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

// Reporte de un punto crítico (la foto se valida aparte con validarFoto)
export const esquemaReporte = z.object({
  tipo: z.enum(["heces", "orina", "mascota_suelta"], { error: "Elige el tipo de punto crítico" }),
  descripcion: z
    .string()
    .trim()
    .max(300, { error: "Máximo 300 caracteres" })
    .optional(),
  lat: z.preprocess(
    vacioComoNulo,
    z.coerce
      .number({ error: "Indica la ubicación" })
      .min(L.latMin, { error: "La ubicación debe estar en Lima Norte" })
      .max(L.latMax, { error: "La ubicación debe estar en Lima Norte" }),
  ),
  lng: z.preprocess(
    vacioComoNulo,
    z.coerce
      .number({ error: "Indica la ubicación" })
      .min(L.lngMin, { error: "La ubicación debe estar en Lima Norte" })
      .max(L.lngMax, { error: "La ubicación debe estar en Lima Norte" }),
  ),
  distrito: esquemaDistrito,
});

// Atender un reporte: la nota es obligatoria (la BD también lo exige)
export const esquemaAtencion = z.object({
  reporte_id: z.coerce.number().int().positive({ error: "Reporte no válido" }),
  nota: z
    .string()
    .trim()
    .min(3, { error: "Escribe una nota de atención (mínimo 3 caracteres)" })
    .max(300, { error: "Máximo 300 caracteres" }),
});

// Sanción sobre un reporte: acción en texto y multa en soles (0 o más)
export const esquemaSancion = z.object({
  reporte_id: z.coerce.number().int().positive({ error: "Reporte no válido" }),
  accion: z
    .string()
    .trim()
    .min(3, { error: "Describe la acción (mínimo 3 caracteres)" })
    .max(200, { error: "Máximo 200 caracteres" }),
  multa: z.preprocess(
    vacioComoNulo,
    z.coerce
      .number({ error: "Ingresa la multa (puede ser 0)" })
      .min(0, { error: "La multa no puede ser negativa" })
      .max(MULTA_MAXIMA, { error: "Multa demasiado alta" }),
  ),
});
