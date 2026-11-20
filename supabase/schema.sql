-- ============================================================
-- PATALIMPIA — esquema (PostgreSQL / Supabase)
-- Modelo: usuarios 1:N mascotas
--         usuarios 1:N reportes 1:N sanciones
-- Roles: vecino (reporta y registra mascotas), fiscalizador (atiende
-- los reportes de SU distrito) y admin (ve indicadores de todos).
-- ============================================================

create type public.rol_usuario as enum ('vecino', 'fiscalizador', 'admin');

-- Distritos de Lima Norte que cubre el sistema
create or replace function public.distrito_valido(d text)
returns boolean language sql immutable
as $$ select d in ('Los Olivos', 'Comas', 'San Martín de Porres', 'Independencia') $$;

-- Perfil de cada usuario (1:1 con auth.users)
create table public.usuarios (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  email      text not null unique,
  rol        public.rol_usuario not null default 'vecino',
  distrito   text not null check (public.distrito_valido(distrito)),
  creado_en  timestamptz not null default now()
);

-- Mascotas registradas por cada vecino (tenencia responsable). 1 usuario : N mascotas
create table public.mascotas (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.usuarios(id) on delete cascade,
  nombre      text not null check (char_length(nombre) between 1 and 60),
  especie     text not null check (especie in ('perro', 'gato', 'otro')),
  distrito    text not null check (public.distrito_valido(distrito)),
  creado_en   timestamptz not null default now()
);

-- Reportes de puntos críticos. 1 usuario : N reportes
create table public.reportes (
  id            bigint generated always as identity primary key,
  usuario_id    uuid not null references public.usuarios(id) on delete cascade,
  tipo          text not null check (tipo in ('heces', 'orina', 'mascota_suelta')),
  descripcion   text check (char_length(descripcion) <= 300),
  foto_url      text,
  lat           numeric(9,6) not null check (lat between -12.10 and -11.80),
  lng           numeric(9,6) not null check (lng between -77.20 and -76.95),
  distrito      text not null check (public.distrito_valido(distrito)),
  estado        text not null default 'pendiente' check (estado in ('pendiente', 'atendido')),
  nota          text check (char_length(nota) <= 300),
  atendido_por  uuid references public.usuarios(id),
  atendido_en   timestamptz,
  creado_en     timestamptz not null default now()
);

-- Sanciones que registra el fiscalizador sobre un reporte. 1 reporte : N sanciones
create table public.sanciones (
  id               bigint generated always as identity primary key,
  reporte_id       bigint not null references public.reportes(id) on delete cascade,
  fiscalizador_id  uuid not null references public.usuarios(id),
  accion           text not null check (char_length(accion) between 3 and 200),
  multa            numeric(10,2) not null check (multa >= 0),
  creado_en        timestamptz not null default now()
);

-- Índices en las FK y en los filtros más usados
create index on public.mascotas (usuario_id);
create index on public.reportes (usuario_id);
create index on public.reportes (distrito, estado);
create index on public.sanciones (reporte_id);

-- ===== Funciones de apoyo para RLS (security definer: evitan recursión) =====
create or replace function public.rol_actual()
returns public.rol_usuario
language sql stable security definer set search_path = ''
as $$ select rol from public.usuarios where id = auth.uid() $$;

create or replace function public.distrito_actual()
returns text
language sql stable security definer set search_path = ''
as $$ select distrito from public.usuarios where id = auth.uid() $$;

-- Crea el perfil al registrarse. El rol admin NO se puede elegir.
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.usuarios (id, nombre, email, rol, distrito)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    case when new.raw_user_meta_data->>'rol' in ('vecino', 'fiscalizador')
         then (new.raw_user_meta_data->>'rol')::public.rol_usuario
         else 'vecino'::public.rol_usuario end,
    case when public.distrito_valido(new.raw_user_meta_data->>'distrito')
         then new.raw_user_meta_data->>'distrito'
         else 'Los Olivos' end
  );
  return new;
end;
$$;

create trigger al_registrar_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

-- ===== Row Level Security =====
alter table public.usuarios  enable row level security;
alter table public.mascotas  enable row level security;
alter table public.reportes  enable row level security;
alter table public.sanciones enable row level security;

-- usuarios: cada uno ve su perfil; el admin ve todos
create policy "ver propio perfil o admin" on public.usuarios
  for select to authenticated
  using (id = auth.uid() or public.rol_actual() = 'admin');

-- mascotas: el vecino gestiona las suyas; fiscalizador (su distrito) y admin las ven
create policy "ver mascotas" on public.mascotas
  for select to authenticated
  using (
    usuario_id = auth.uid()
    or public.rol_actual() = 'admin'
    or (public.rol_actual() = 'fiscalizador' and distrito = public.distrito_actual())
  );
create policy "vecino registra su mascota" on public.mascotas
  for insert to authenticated
  with check (usuario_id = auth.uid() and public.rol_actual() = 'vecino');
create policy "vecino borra su mascota" on public.mascotas
  for delete to authenticated
  using (usuario_id = auth.uid());

-- reportes: el vecino ve los suyos; el fiscalizador SOLO los de su distrito; admin todos
create policy "ver reportes" on public.reportes
  for select to authenticated
  using (
    usuario_id = auth.uid()
    or public.rol_actual() = 'admin'
    or (public.rol_actual() = 'fiscalizador' and distrito = public.distrito_actual())
  );
create policy "vecino crea reporte pendiente" on public.reportes
  for insert to authenticated
  with check (
    usuario_id = auth.uid() and public.rol_actual() = 'vecino'
    and estado = 'pendiente' and atendido_por is null and nota is null
  );
-- No hay UPDATE directo: atender un reporte pasa por la función atender_reporte

-- sanciones: las ve el fiscalizador de ese distrito y el admin; se crean por función
create policy "ver sanciones" on public.sanciones
  for select to authenticated
  using (
    public.rol_actual() = 'admin'
    or exists (select 1 from public.reportes r
               where r.id = reporte_id and public.rol_actual() = 'fiscalizador'
                 and r.distrito = public.distrito_actual())
  );

-- ===== Atender reporte (fiscalizador de ese distrito o admin) =====
-- Solo pendiente -> atendido, con una nota obligatoria.
create or replace function public.atender_reporte(p_reporte_id bigint, p_nota text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_reporte record;
begin
  select id, distrito, estado into v_reporte
  from public.reportes where id = p_reporte_id for update;
  if not found then
    raise exception 'El reporte no existe';
  end if;
  if not (public.rol_actual() = 'admin'
          or (public.rol_actual() = 'fiscalizador' and v_reporte.distrito = public.distrito_actual())) then
    raise exception 'Solo el fiscalizador de % puede atender este reporte', v_reporte.distrito;
  end if;
  if v_reporte.estado <> 'pendiente' then
    raise exception 'El reporte ya fue atendido';
  end if;
  if p_nota is null or char_length(trim(p_nota)) < 3 then
    raise exception 'Escribe una nota de atención';
  end if;
  update public.reportes
  set estado = 'atendido', nota = trim(p_nota), atendido_por = auth.uid(), atendido_en = now()
  where id = p_reporte_id;
end;
$$;

-- ===== Registrar sanción (fiscalizador de ese distrito o admin) =====
create or replace function public.registrar_sancion(p_reporte_id bigint, p_accion text, p_multa numeric)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  v_distrito text;
  v_id bigint;
begin
  select distrito into v_distrito from public.reportes where id = p_reporte_id;
  if not found then
    raise exception 'El reporte no existe';
  end if;
  if not (public.rol_actual() = 'admin'
          or (public.rol_actual() = 'fiscalizador' and v_distrito = public.distrito_actual())) then
    raise exception 'Solo el fiscalizador de % puede sancionar', v_distrito;
  end if;
  if p_multa is null or p_multa < 0 then
    raise exception 'La multa no puede ser negativa';
  end if;
  insert into public.sanciones (reporte_id, fiscalizador_id, accion, multa)
  values (p_reporte_id, auth.uid(), trim(p_accion), p_multa)
  returning id into v_id;
  return v_id;
end;
$$;

-- ===== Datos públicos (sin datos personales) =====
-- Puntos críticos para el mapa: tipo, ubicación, distrito y estado (sin quién reportó)
create or replace function public.puntos_criticos()
returns table (id bigint, tipo text, lat numeric, lng numeric, distrito text, estado text, creado_en timestamptz)
language sql stable security definer set search_path = ''
as $$
  select id, tipo, lat, lng, distrito, estado, creado_en
  from public.reportes order by creado_en desc limit 300
$$;

-- Cifras para la landing
create or replace function public.estadisticas_publicas()
returns table (reportes bigint, atendidos bigint, mascotas bigint)
language sql stable security definer set search_path = ''
as $$
  select (select count(*) from public.reportes),
         (select count(*) from public.reportes where estado = 'atendido'),
         (select count(*) from public.mascotas)
$$;

-- ===== Permisos de las funciones =====
revoke execute on function public.atender_reporte(bigint, text) from public, anon;
revoke execute on function public.registrar_sancion(bigint, text, numeric) from public, anon;
grant execute on function public.atender_reporte(bigint, text) to authenticated;
grant execute on function public.registrar_sancion(bigint, text, numeric) to authenticated;
grant execute on function public.puntos_criticos() to anon, authenticated;
grant execute on function public.estadisticas_publicas() to anon, authenticated;
revoke execute on function public.crear_perfil_usuario() from public, anon, authenticated;
revoke execute on function public.rol_actual() from public, anon;
revoke execute on function public.distrito_actual() from public, anon;
grant execute on function public.rol_actual() to authenticated;
grant execute on function public.distrito_actual() to authenticated;

-- ===== Storage: fotos de los reportes =====
-- Bucket público de solo lectura; cada vecino sube solo a su carpeta (su uid)
insert into storage.buckets (id, name, public)
values ('reportes', 'reportes', true)
on conflict (id) do nothing;

create policy "vecino sube fotos a su carpeta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reportes' and (storage.foldername(name))[1] = auth.uid()::text);
