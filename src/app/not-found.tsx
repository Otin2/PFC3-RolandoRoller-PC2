import { Antetitulo, BotonEnlace } from "@/components/ui";

export default function NoEncontrado() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
      <Antetitulo>Error 404</Antetitulo>
      {/* el "404" gigante es el protagonista */}
      <p aria-hidden className="mt-4 font-display text-[clamp(8rem,30vw,16rem)] leading-[0.8] tracking-[0.06em] text-acento block">
        404
      </p>
      <h1 className="titulo-pagina mt-6">No encontramos esta página</h1>
      <p className="text-texto-2 mt-6">El registro no existe o no tienes permiso para verlo.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <BotonEnlace href="/panel">Ir al panel</BotonEnlace>
        <BotonEnlace href="/" variante="secundario">
          Inicio
        </BotonEnlace>
      </div>
    </div>
  );
}
