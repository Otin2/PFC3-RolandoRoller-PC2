"use client";

import { useState } from "react";
import { iniciarSesion, registrarUsuario } from "@/lib/acciones/auth";
import { distritos, roles, rolesRegistro } from "@/lib/config";
import { LARGO_MINIMO_CLAVE } from "@/lib/validaciones";
import { Formulario } from "./Formulario";
import { Tarjeta } from "./ui";

type Modo = "login" | "registro";

// Textos de cada modo
const textos: Record<Modo, { titulo: string; descripcion: string }> = {
  login: { titulo: "Iniciar sesión", descripcion: "Ingresa con tu correo y contraseña." },
  registro: {
    titulo: "Crear cuenta",
    descripcion: "Elige tu distrito y tu rol. El rol de administrador no se puede elegir.",
  },
};

// Una sola pantalla para entrar o registrarse: el switch alterna entre los dos
// formularios sin recargar. La URL cambia a /login o /registro para poder
// compartir el enlace directo.
export function Acceso({ modoInicial }: { modoInicial: Modo }) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const t = textos[modo];

  function cambiar(nuevo: Modo) {
    setModo(nuevo);
    window.history.replaceState(null, "", nuevo === "login" ? "/login" : "/registro");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      {/* Switch: la píldora verde se desliza al lado elegido */}
      <div
        role="tablist"
        aria-label="Elegir acción"
        className="relative mx-auto grid w-full max-w-xs grid-cols-2 rounded-full bg-seccion p-1"
      >
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-acento transition-transform duration-300 ${
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
            className={`relative z-10 py-2 text-sm font-semibold transition-colors ${
              modo === m ? "text-white" : "text-texto-2 hover:text-acento"
            }`}
          >
            {textos[m].titulo}
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <h1 className="titulo-pagina">{t.titulo}</h1>
        <p className="mt-2 text-texto-2">{t.descripcion}</p>
      </div>

      <div className="mt-6">
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
                  nombre: "distrito",
                  etiqueta: "Distrito",
                  tipo: "select",
                  opciones: distritos.map((d) => ({ valor: d, etiqueta: d })),
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
