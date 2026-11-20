"use client";

import { useActionState, useState } from "react";
import { crearTransaccion } from "@/lib/acciones/transaccion";
import { calcularTotal, formatearMonto } from "@/lib/reglas";
import { moneda } from "@/lib/config";
import { Aviso, Boton } from "./ui";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  principal: string; // nombre de la entidad principal (ej. tienda)
};

// El usuario elige cantidades; el total se muestra en vivo.
// OJO: el total que se guarda lo recalcula el servidor con precios de la BD.
export function FormularioTransaccion({ productos }: { productos: Producto[] }) {
  const [estado, enviar, enviando] = useActionState(crearTransaccion, {});
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  const seleccion = productos
    .filter((p) => (cantidades[p.id] ?? 0) > 0)
    .map((p) => ({ cantidad: cantidades[p.id], precio_unitario: p.precio }));
  const total = calcularTotal(seleccion);

  return (
    <form action={enviar} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="grid gap-4 sm:grid-cols-2">
        {productos.map((p) => {
          const cantidad = cantidades[p.id] ?? 0;
          const excede = cantidad > p.stock;
          return (
            <li
              key={p.id}
              className={`rounded-tarjeta border bg-superficie p-5 transition-all duration-300 ${
                cantidad > 0 ? "-rotate-1 border-acento" : "border-black"
              }`}
            >
              <p className="etiqueta text-xs text-texto-3">{p.principal}</p>
              <p className="mt-2 font-display text-2xl font-normal uppercase tracking-[0.02em] text-resalte">
                {p.nombre}
              </p>
              <p className="mt-1 text-sm text-texto-2 tabular-nums">
                {formatearMonto(p.precio, moneda)} · Stock: {p.stock}
              </p>
              <label className="etiqueta mt-4 flex items-center gap-3 text-sm">
                Cantidad
                <input
                  type="number"
                  name={`cantidad_${p.id}`}
                  min={0}
                  max={p.stock}
                  step={1}
                  value={cantidad || ""}
                  placeholder="0"
                  onChange={(e) => setCantidades({ ...cantidades, [p.id]: Number(e.target.value) })}
                  className={`campo w-24 rounded-control border bg-superficie px-3 py-2 tabular-nums ${excede ? "border-acento" : "border-borde"}`}
                />
              </label>
              {excede && <p className="mt-2 text-sm text-error">Supera el stock disponible.</p>}
            </li>
          );
        })}
      </ul>

      <aside className="h-fit bg-seccion lg:sticky lg:top-24 rounded-[38px] border border-black p-8">
        <p className="etiqueta text-sm text-texto-2">Resumen</p>
        <p className="tabular-nums mt-4 font-display text-6xl font-normal tracking-[0.02em] text-acento">
          {formatearMonto(total, moneda)}
        </p>
        <p className="mt-1 text-sm text-texto-2">{seleccion.length} ítem(s) seleccionados</p>
        <div className="mt-6 flex flex-col gap-4">
          {estado.error && <Aviso>{estado.error}</Aviso>}
          <Boton type="submit" disabled={enviando || seleccion.length === 0}>
            {enviando ? "Registrando..." : "Confirmar"}
          </Boton>
        </div>
      </aside>
    </form>
  );
}
