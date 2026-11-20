"use client";

import { useActionState, useState, startTransition } from "react";
import { Camera, Cat, Droplets, MapPin, Siren } from "lucide-react";
import { crearReporte } from "@/lib/acciones/reportes";
import { distritos, tiposReporte, type TipoReporte } from "@/lib/config";
import { validarFoto } from "@/lib/reglas";
import { Aviso, Boton } from "./ui";

// Un icono por tipo de punto crítico
const iconos: Record<TipoReporte, typeof Camera> = {
  heces: Siren,
  orina: Droplets,
  mascota_suelta: Cat,
};

const clasesCampo =
  "campo w-full rounded-control border border-borde bg-superficie px-4 py-2.5 text-base outline-none";

// Formulario de nuevo reporte: tipo con botones grandes, foto con vista previa,
// ubicación (GPS o manual) y distrito.
// Se envía con onSubmit (y no con action=) para que React NO borre la foto
// ni los demás campos cuando el servidor devuelve un error.
export function FormularioReporte({ distritoInicial }: { distritoInicial: string }) {
  const [estado, enviar, enviando] = useActionState(crearReporte, {});
  const [tipo, setTipo] = useState<string>(estado.valores?.tipo ?? "");
  const [distrito, setDistrito] = useState(estado.valores?.distrito ?? distritoInicial);
  const [lat, setLat] = useState(estado.valores?.lat ?? "");
  const [lng, setLng] = useState(estado.valores?.lng ?? "");
  const [vista, setVista] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [avisoGps, setAvisoGps] = useState<string | null>(null);

  const errores = estado.errores ?? {};

  function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (vista) URL.revokeObjectURL(vista);
    if (!archivo) {
      setVista(null);
      setErrorFoto(null);
      return;
    }
    const error = validarFoto(archivo);
    setErrorFoto(error);
    setVista(error ? null : URL.createObjectURL(archivo));
    if (error) e.target.value = "";
  }

  function usarMiUbicacion() {
    setAvisoGps(null);
    if (!navigator.geolocation) {
      setAvisoGps("Tu navegador no permite obtener la ubicación. Escríbela a mano.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => setAvisoGps("No pudimos obtener tu ubicación. Revisa el permiso o escríbela a mano."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function alEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  }

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-6" noValidate>
      {estado.error && <Aviso>{estado.error}</Aviso>}

      {/* 1) Tipo */}
      <fieldset>
        <legend className="etiqueta mb-2 text-sm">¿Qué encontraste?</legend>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(tiposReporte).map((t) => {
            const Icono = iconos[t.valor];
            const activo = tipo === t.valor;
            return (
              <label
                key={t.valor}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-tarjeta border-2 px-2 py-4 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-acento ${
                  activo ? "border-acento bg-acento-suave text-acento" : "border-borde-suave bg-superficie text-texto-2 hover:border-acento"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t.valor}
                  checked={activo}
                  onChange={() => setTipo(t.valor)}
                  className="sr-only"
                />
                <Icono size={30} aria-hidden />
                {t.etiqueta}
              </label>
            );
          })}
        </div>
        {errores.tipo && <p className="mt-1 text-sm text-error">{errores.tipo}</p>}
      </fieldset>

      {/* 2) Foto */}
      <div className="flex flex-col gap-2">
        <label htmlFor="campo-foto" className="etiqueta text-sm">Foto del lugar</label>
        <input
          id="campo-foto"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={elegirFoto}
          className="block w-full text-sm text-texto-2 file:mr-3 file:rounded-full file:border-0 file:bg-acento file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-acento-hover"
        />
        <p className="text-sm text-texto-3">JPG, PNG o WebP de hasta 5 MB.</p>
        {(errorFoto || errores.foto) && <p className="text-sm text-error">{errorFoto ?? errores.foto}</p>}
        {vista?.startsWith("blob:") && (
          // Vista previa local (blob:); no pasa por next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={encodeURI(vista)} alt="Vista previa de la foto" className="max-h-64 w-full rounded-tarjeta border border-borde-suave object-cover" />
        )}
      </div>

      {/* 3) Ubicación */}
      <div className="flex flex-col gap-2">
        <span className="etiqueta text-sm">Ubicación</span>
        <div>
          <Boton type="button" variante="secundario" onClick={usarMiUbicacion}>
            <MapPin size={16} aria-hidden /> Usar mi ubicación
          </Boton>
        </div>
        {avisoGps && <p className="text-sm text-amber-700">{avisoGps}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="campo-lat" className="text-sm text-texto-2">Latitud</label>
            <input id="campo-lat" name="lat" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-11.9600" className={clasesCampo} aria-invalid={!!errores.lat} />
            {errores.lat && <p className="mt-1 text-sm text-error">{errores.lat}</p>}
          </div>
          <div>
            <label htmlFor="campo-lng" className="text-sm text-texto-2">Longitud</label>
            <input id="campo-lng" name="lng" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-77.0700" className={clasesCampo} aria-invalid={!!errores.lng} />
            {errores.lng && <p className="mt-1 text-sm text-error">{errores.lng}</p>}
          </div>
        </div>
      </div>

      {/* 4) Distrito y descripción */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="campo-distrito" className="etiqueta text-sm">Distrito</label>
        <select id="campo-distrito" name="distrito" value={distrito} onChange={(e) => setDistrito(e.target.value)} className={clasesCampo}>
          {distritos.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errores.distrito && <p className="text-sm text-error">{errores.distrito}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="campo-descripcion" className="etiqueta text-sm">Descripción (opcional)</label>
        <textarea id="campo-descripcion" name="descripcion" rows={3} maxLength={300} defaultValue={estado.valores?.descripcion ?? ""} className={clasesCampo} />
        {errores.descripcion && <p className="text-sm text-error">{errores.descripcion}</p>}
      </div>

      <div>
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar reporte"}
        </Boton>
      </div>
    </form>
  );
}
