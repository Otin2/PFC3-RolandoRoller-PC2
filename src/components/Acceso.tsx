"use client";

import { useState } from "react";
import { iniciarSesion, registrarUsuario } from "@/lib/acciones/auth";
import { roles, rolesRegistro } from "@/lib/config";
import { LARGO_MINIMO_CLAVE } from "@/lib/validaciones";
import { Formulario } from "./Formulario";
import { Antetitulo, Tarjeta } from "./ui";

type Modo = "login" | "registro";

// Textos de cada modo
const textos: Record<Modo, { antetitulo: string; titulo: string; descripcion: string }> = {
  login: {
    antetitulo: "Bienvenido",
    titulo: "Iniciar sesión",
    descripcion: "Ingresa con tu correo y contraseña.",
  },
  registro: {
    antetitulo: "Únete",
    titulo: "Crear cuenta",
    descripcion: "Elige tu rol. El rol de administrador no se puede elegir.",
  },
};

// Una sola pantalla para entrar o registrarse: el switch alterna entre los dos
// formularios sin recargar. La URL cambia a /login o /registro para que se pueda
// compartir el enlace directo (y el middleware sigue mandando a /login).
export function Acceso({ modoInicial }: { modoInicial: Modo }) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const t = textos[modo];

  function cambiar(nuevo: Modo) {
    setModo(nuevo);
    window.history.replaceState(null, "", nuevo === "login" ? "/login" : "/registro");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      {/* Switch: la píldora roja se desliza al lado elegido */}
      <div role="tablist" aria-label="Elegir acción" className="relative mx-auto grid w-full max-w-xs grid-cols-2 rounded-control bg-seccion p-1">
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-[12px] bg-acento transition-transform duration-300 ${
            modo === "registro" ? "translate-x-full" : ""
          }`}
        />
        {(["login", "registro"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={modo === m}
            onClick={() => cambiar(m)}
            className={`relative z-10 py-2 font-display text-base uppercase tracking-[0.03em] transition-colors ${
              modo === m ? "text-white" : "text-resalte hover:text-white"
            }`}
          >
            {textos[m].titulo}
          </button>
        ))}
      </div>

      {/* Encabezado (key: se anima al cambiar de modo) */}
      <div key={modo} className="mt-12 text-center">
        <div className="mb-4 animate-subir">
          <Antetitulo>{t.antetitulo}</Antetitulo>
        </div>
        <h1 className="titulo-pagina animate-subir [animation-delay:80ms]">{t.titulo}</h1>
        <p className="mt-5 animate-subir text-texto-2 [animation-delay:160ms]">{t.descripcion}</p>
      </div>

      {/* Formulario del modo elegido */}
      <div key={`f-${modo}`} className="mt-8 animate-subir [animation-delay:200ms]">
        <Tarjeta>
          {modo === "login" ? (
            <Formulario
              accion={iniciarSesion}
              textoBoton="Iniciar sesión"
              campos={[
                { nombre: "email", etiqueta: "Correo", tipo: "email", autoComplete: "email" },
                { nombre: "password", etiqueta: "Contraseña", tipo: "password", autoComplete: "current-password" },
              ]}
            />
          ) : (
            <Formulario
              accion={registrarUsuario}
              textoBoton="Crear cuenta"
              campos={[
                { nombre: "nombre", etiqueta: "Nombre", autoComplete: "name" },
                { nombre: "email", etiqueta: "Correo", tipo: "email", autoComplete: "email" },
                {
                  nombre: "password",
                  etiqueta: "Contraseña",
                  tipo: "password",
                  autoComplete: "new-password",
                  ayuda: `Mínimo ${LARGO_MINIMO_CLAVE} caracteres.`,
                },
                {
                  nombre: "rol",
                  etiqueta: "Rol",
                  tipo: "select",
                  opciones: rolesRegistro.map((r) => ({ valor: r, etiqueta: roles[r].etiqueta })),
                },
              ]}
            />
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
