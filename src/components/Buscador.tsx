// Buscador simple: formulario GET que agrega ?q=texto a la URL.
// No necesita JavaScript: la página lee "q" y filtra en el servidor.
export function Buscador({
  accion,
  valor,
  placeholder,
}: {
  accion: string;
  valor?: string;
  placeholder: string;
}) {
  return (
    <form action={accion} method="get" role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="buscar" className="sr-only">
        Buscar
      </label>
      <input
        id="buscar"
        name="q"
        type="search"
        defaultValue={valor}
        placeholder={placeholder}
        maxLength={60}
        className="campo w-full rounded-control border border-borde bg-superficie px-4 py-2.5 text-base outline-none placeholder:text-tenue focus:border-texto"
      />
      <button
        type="submit"
        className="rounded-control bg-acento px-4 py-2.5 text-sm text-sobre-acento hover:bg-acento-hover font-medium uppercase tracking-[0.02em]"
      >
        Buscar
      </button>
    </form>
  );
}
