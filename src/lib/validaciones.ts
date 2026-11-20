import { z } from "zod";

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
  rol: z.enum(["comprador", "vendedor"], { error: "Elige un rol válido" }),
});

// Entidad principal (ej. tienda)
export const esquemaPrincipal = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, { error: "Mínimo 2 caracteres" })
    .max(100, { error: "Máximo 100 caracteres" }),
  rubro: z.string().trim().max(60, { error: "Máximo 60 caracteres" }).optional(),
});

// Un campo vacío ("") se trata como "no llenado" para que NO se convierta en 0
const vacioComoNulo = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

// Entidad hija (ej. producto): precio y stock obligatorios y no negativos
export const esquemaHija = z.object({
  tienda_id: z.coerce
    .number({ error: "Elige una opción" })
    .int()
    .positive({ error: "Elige una opción" }),
  nombre: z
    .string()
    .trim()
    .min(2, { error: "Mínimo 2 caracteres" })
    .max(100, { error: "Máximo 100 caracteres" }),
  precio: z.preprocess(
    vacioComoNulo,
    z.coerce
      .number({ error: "Ingresa el precio" })
      .min(0, { error: "El precio no puede ser negativo" })
      .max(999999, { error: "Precio demasiado alto" }),
  ),
  stock: z.preprocess(
    vacioComoNulo,
    z.coerce
      .number({ error: "Ingresa el stock" })
      .int({ error: "El stock debe ser entero" })
      .min(0, { error: "El stock no puede ser negativo" })
      .max(1000000, { error: "Stock demasiado alto" }),
  ),
});

// Un ítem de la transacción (ej. producto + cantidad)
export const esquemaItem = z.object({
  producto_id: z.coerce.number().int().positive(),
  cantidad: z.coerce
    .number()
    .int({ error: "La cantidad debe ser entera" })
    .positive({ error: "La cantidad debe ser mayor a 0" }),
});

// La transacción completa: al menos un ítem
export const esquemaTransaccion = z.object({
  items: z.array(esquemaItem).min(1, { error: "Elige al menos un producto" }),
});

// Nuevo estado de una transacción (atender pedido)
export const esquemaEstado = z.enum(["confirmado", "entregado"], { error: "Estado no válido" });

// Cambio de rol desde el panel admin
export const esquemaCambioRol = z.object({
  usuario_id: z.uuid({ error: "Usuario no válido" }),
  rol: z.enum(["comprador", "vendedor", "admin"], { error: "Elige un rol válido" }),
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
