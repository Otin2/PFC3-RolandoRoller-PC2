-- ============================================================
-- ESQUEMA PC2 (PostgreSQL / Supabase)
-- Modelo: usuarios 1:N tiendas 1:N productos
--         usuarios 1:N pedidos 1:N detalle_pedido N:1 productos
-- Nombres de EJEMPLO: se renombran según el caso del examen.
-- ============================================================

-- Roles del sistema (renombrar actores según el caso)
create type public.rol_usuario as enum ('comprador', 'vendedor', 'admin');

-- Perfil de cada usuario (1:1 con auth.users)
create table public.usuarios (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  email      text not null unique,
  rol        public.rol_usuario not null default 'comprador',
  creado_en  timestamptz not null default now()
);

-- Entidad principal (ej. tiendas). 1 usuario : N tiendas
create table public.tiendas (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.usuarios(id) on delete cascade,
  nombre      text not null,
  rubro       text,
  creado_en   timestamptz not null default now()
);

-- Entidad hija (ej. productos). 1 tienda : N productos
create table public.productos (
  id         bigint generated always as identity primary key,
  tienda_id  bigint not null references public.tiendas(id) on delete cascade,
  nombre     text not null,
  precio     numeric(10,2) not null check (precio >= 0),
  stock      integer not null default 0 check (stock >= 0)
);

-- Transacción (ej. pedidos). 1 usuario : N pedidos
create table public.pedidos (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.usuarios(id) on delete cascade,
  estado      text not null default 'pendiente'
              check (estado in ('pendiente', 'confirmado', 'entregado', 'cancelado')),
  total       numeric(10,2) not null default 0 check (total >= 0),
  fecha       timestamptz not null default now()
);

-- Detalle (2FN): un pedido tiene muchos productos
create table public.detalle_pedido (
  id               bigint generated always as identity primary key,
  pedido_id        bigint not null references public.pedidos(id) on delete cascade,
  producto_id      bigint not null references public.productos(id),
  cantidad         integer not null check (cantidad > 0),
  precio_unitario  numeric(10,2) not null check (precio_unitario >= 0)
);

-- Índices en las FK
create index on public.tiendas (usuario_id);
create index on public.productos (tienda_id);
create index on public.pedidos (usuario_id);
create index on public.detalle_pedido (pedido_id);
create index on public.detalle_pedido (producto_id);

-- Rol del usuario actual (security definer para evitar recursión en RLS)
create or replace function public.rol_actual()
returns public.rol_usuario
language sql stable security definer set search_path = ''
as $$ select rol from public.usuarios where id = auth.uid() $$;

-- Crea el perfil al registrarse. El rol admin NO se puede elegir al registrarse.
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.usuarios (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    case when new.raw_user_meta_data->>'rol' in ('comprador', 'vendedor')
         then (new.raw_user_meta_data->>'rol')::public.rol_usuario
         else 'comprador'::public.rol_usuario end
  );
  return new;
end;
$$;

create trigger al_registrar_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- ¿El usuario actual vende algún producto de este pedido?
-- (security definer: evita la recursión entre las políticas de pedidos y detalle_pedido)
create or replace function public.es_vendedor_del_pedido(p_pedido_id bigint)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.detalle_pedido d
    join public.productos p on p.id = d.producto_id
    join public.tiendas t on t.id = p.tienda_id
    where d.pedido_id = p_pedido_id and t.usuario_id = auth.uid()
  )
$$;

-- ===== Row Level Security =====
alter table public.usuarios        enable row level security;
alter table public.tiendas         enable row level security;
alter table public.productos       enable row level security;
alter table public.pedidos         enable row level security;
alter table public.detalle_pedido  enable row level security;

-- usuarios: cada uno ve y edita su perfil; el admin ve todos. Nadie se cambia el rol.
create policy "ver propio perfil o admin" on public.usuarios
  for select to authenticated
  using (id = auth.uid() or public.rol_actual() = 'admin');
create policy "editar propio perfil sin cambiar rol" on public.usuarios
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and rol = public.rol_actual());

-- tiendas: catálogo público; solo el vendedor dueño (o admin) las modifica
create policy "tiendas visibles" on public.tiendas
  for select to anon, authenticated using (true);
create policy "vendedor crea su tienda" on public.tiendas
  for insert to authenticated
  with check (usuario_id = auth.uid() and public.rol_actual() = 'vendedor');
create policy "dueño o admin edita tienda" on public.tiendas
  for update to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() = 'admin')
  -- with check: nadie puede "regalar" su tienda cambiando usuario_id
  with check (usuario_id = auth.uid() or public.rol_actual() = 'admin');
create policy "dueño o admin borra tienda" on public.tiendas
  for delete to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() = 'admin');

-- productos: catálogo público; solo el dueño de la tienda los modifica
create policy "productos visibles" on public.productos
  for select to anon, authenticated using (true);
create policy "dueño de la tienda gestiona productos" on public.productos
  for all to authenticated
  using (exists (select 1 from public.tiendas t where t.id = tienda_id and t.usuario_id = auth.uid())
         or public.rol_actual() = 'admin')
  with check (exists (select 1 from public.tiendas t where t.id = tienda_id and t.usuario_id = auth.uid())
              or public.rol_actual() = 'admin');

-- pedidos: el comprador ve los suyos; el vendedor ve los que incluyen sus productos; admin ve todo
create policy "ver pedidos propios, de mis productos o admin" on public.pedidos
  for select to authenticated
  using (
    usuario_id = auth.uid()
    or public.rol_actual() = 'admin'
    or public.es_vendedor_del_pedido(id)
  );
-- Los pedidos NO se insertan ni se modifican directo desde la API (no hay
-- políticas INSERT/UPDATE). Todo pasa por funciones que validan las reglas:
--   crear_pedido, cancelar_pedido y cambiar_estado_pedido (abajo).

-- detalle: el comprador ve sus líneas, el admin todas y el vendedor
-- SOLO las líneas de sus propios productos (no las de otras tiendas)
create policy "ver detalle propio, de mis productos o admin" on public.detalle_pedido
  for select to authenticated
  using (
    exists (select 1 from public.pedidos pe
            where pe.id = pedido_id and (pe.usuario_id = auth.uid() or public.rol_actual() = 'admin'))
    or exists (select 1 from public.productos p
               join public.tiendas t on t.id = p.tienda_id
               where p.id = producto_id and t.usuario_id = auth.uid())
  );

-- ===== Crear pedido (transacción atómica) =====
-- Recibe [{"producto_id": 1, "cantidad": 2}, ...] y en UNA sola transacción:
-- bloquea cada producto (for update), valida stock, descuenta stock,
-- guarda el detalle con el precio histórico y calcula el total.
-- Si algo falla, PostgreSQL deshace todo (no quedan pedidos a medias).
create or replace function public.crear_pedido(p_items jsonb)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_pedido   bigint;
  v_total    numeric(10,2) := 0;
  v_item     jsonb;
  v_cantidad integer;
  v_producto record;
begin
  if auth.uid() is null or public.rol_actual() is distinct from 'comprador' then
    raise exception 'Solo un comprador con sesión puede crear pedidos';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Elige al menos un producto';
  end if;

  insert into public.pedidos (usuario_id, estado, total)
  values (auth.uid(), 'pendiente', 0)
  returning id into v_pedido;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cantidad := (v_item->>'cantidad')::integer;
    if v_cantidad is null or v_cantidad <= 0 then
      raise exception 'La cantidad debe ser mayor a 0';
    end if;

    select id, nombre, precio, stock into v_producto
    from public.productos
    where id = (v_item->>'producto_id')::bigint
    for update; -- evita que dos compras simultáneas vendan el mismo stock

    if not found then
      raise exception 'Un producto elegido ya no existe';
    end if;
    if v_cantidad > v_producto.stock then
      raise exception '"%": pediste % y solo hay %', v_producto.nombre, v_cantidad, v_producto.stock;
    end if;

    update public.productos set stock = stock - v_cantidad where id = v_producto.id;

    insert into public.detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
    values (v_pedido, v_producto.id, v_cantidad, v_producto.precio);

    v_total := v_total + v_producto.precio * v_cantidad;
  end loop;

  update public.pedidos set total = v_total where id = v_pedido;
  return v_pedido;
end;
$$;

-- Solo usuarios con sesión pueden llamarla
revoke execute on function public.crear_pedido(jsonb) from public, anon;
grant execute on function public.crear_pedido(jsonb) to authenticated;

-- ===== Cancelar pedido (solo el comprador dueño, solo si está pendiente) =====
-- Devuelve el stock de cada línea en la MISMA transacción.
create or replace function public.cancelar_pedido(p_pedido_id bigint)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_pedido record;
begin
  select id, usuario_id, estado into v_pedido
  from public.pedidos where id = p_pedido_id
  for update;

  if not found or v_pedido.usuario_id is distinct from auth.uid() then
    raise exception 'Solo el comprador dueño puede cancelar este pedido';
  end if;
  if v_pedido.estado <> 'pendiente' then
    raise exception 'Solo se puede cancelar un pedido pendiente (este está %)', v_pedido.estado;
  end if;

  -- Devolver el stock de cada producto del pedido
  update public.productos p
  set stock = p.stock + d.cantidad
  from public.detalle_pedido d
  where d.pedido_id = p_pedido_id and d.producto_id = p.id;

  update public.pedidos set estado = 'cancelado' where id = p_pedido_id;
end;
$$;

-- ===== Atender pedido (vendedor del pedido o admin) =====
-- Solo avanza: pendiente -> confirmado -> entregado. No retrocede ni toca un cancelado.
create or replace function public.cambiar_estado_pedido(p_pedido_id bigint, p_estado text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_actual text;
begin
  if auth.uid() is null
     or not (public.rol_actual() = 'admin' or public.es_vendedor_del_pedido(p_pedido_id)) then
    raise exception 'Solo el vendedor del pedido o el admin pueden cambiar su estado';
  end if;

  select estado into v_actual from public.pedidos where id = p_pedido_id for update;
  if not found then
    raise exception 'El pedido no existe';
  end if;

  if not ((v_actual = 'pendiente' and p_estado = 'confirmado')
       or (v_actual = 'confirmado' and p_estado = 'entregado')) then
    raise exception 'No se puede pasar de % a %', v_actual, p_estado;
  end if;

  update public.pedidos set estado = p_estado where id = p_pedido_id;
end;
$$;

-- ===== Gestionar roles (solo admin, y nunca su propio rol) =====
create or replace function public.cambiar_rol(p_usuario uuid, p_rol public.rol_usuario)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or public.rol_actual() is distinct from 'admin' then
    raise exception 'Solo el administrador puede cambiar roles';
  end if;
  if p_usuario = auth.uid() then
    raise exception 'No puedes cambiar tu propio rol (el sistema se quedaría sin admin)';
  end if;

  update public.usuarios set rol = p_rol where id = p_usuario;
  if not found then
    raise exception 'El usuario no existe';
  end if;
end;
$$;

revoke execute on function public.cancelar_pedido(bigint) from public, anon;
revoke execute on function public.cambiar_estado_pedido(bigint, text) from public, anon;
revoke execute on function public.cambiar_rol(uuid, public.rol_usuario) from public, anon;
grant execute on function public.cancelar_pedido(bigint) to authenticated;
grant execute on function public.cambiar_estado_pedido(bigint, text) to authenticated;
grant execute on function public.cambiar_rol(uuid, public.rol_usuario) to authenticated;

-- Funciones internas: nadie las llama por la API.
-- rol_actual y es_vendedor_del_pedido solo las usan las políticas RLS
-- (que se ejecutan como "authenticated"); el trigger no necesita permiso.
revoke execute on function public.crear_perfil_usuario() from public, anon, authenticated;
revoke execute on function public.rol_actual() from public, anon;
revoke execute on function public.es_vendedor_del_pedido(bigint) from public, anon;
grant execute on function public.rol_actual() to authenticated;
grant execute on function public.es_vendedor_del_pedido(bigint) to authenticated;
