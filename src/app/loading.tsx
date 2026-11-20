// Estado de carga mientras el servidor consulta Supabase
export default function Cargando() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-9 w-64 animate-pulse rounded-control bg-seccion" />
      <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-control bg-seccion" />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-tarjeta bg-seccion" />
        ))}
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
