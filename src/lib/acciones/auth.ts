"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { esquemaLogin, esquemaRegistro, erroresPorCampo } from "@/lib/validaciones";
import { leerFormulario, valoresSeguros, type EstadoFormulario } from "@/lib/acciones/estado";

// Inicio de sesión: valida con Zod y luego pregunta a Supabase Auth
export async function iniciarSesion(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos); // sin contraseña
  const resultado = esquemaLogin.safeParse(datos);
  if (!resultado.success) {
    return { errores: erroresPorCampo(resultado.error), valores };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword(resultado.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirma tu correo antes de iniciar sesión.", valores };
    }
    // Mensaje genérico: no revela si el correo existe o no
    return { error: "Correo o contraseña incorrectos.", valores };
  }
  redirect("/panel");
}

// Registro: el nombre y el rol viajan como metadata; el trigger del SQL
// crea el perfil en public.usuarios (y nunca permite el rol admin).
export async function registrarUsuario(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = leerFormulario(formData);
  const valores = valoresSeguros(datos);
  const resultado = esquemaRegistro.safeParse(datos);
  if (!resultado.success) {
    return { errores: erroresPorCampo(resultado.error), valores };
  }

  const { email, password, nombre, rol } = resultado.data;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, rol } },
  });

  // Supabase no da error si el correo ya existe: devuelve un usuario sin identidades
  const yaExiste = error?.message.toLowerCase().includes("already") || data.user?.identities?.length === 0;
  if (yaExiste) return { error: "Ese correo ya está registrado.", valores };
  if (error) return { error: "No se pudo registrar. Inténtalo de nuevo.", valores };

  // Si Supabase pide confirmar el correo, no habrá sesión todavía
  if (!data.session) {
    return { exito: "Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión." };
  }
  redirect("/panel");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
