-- ============================================================
-- BORRA TODO EL ESQUEMA DE PATALIMPIA (para volver a aplicar schema.sql)
-- ¡Cuidado! Elimina tablas y datos. No borra los usuarios de Auth.
-- ============================================================
drop policy if exists "vecino sube fotos a su carpeta" on storage.objects;
drop trigger if exists al_registrar_usuario on auth.users;
drop table if exists public.sanciones cascade;
drop table if exists public.reportes cascade;
drop table if exists public.mascotas cascade;
drop table if exists public.usuarios cascade;
drop function if exists public.atender_reporte(bigint, text);
drop function if exists public.registrar_sancion(bigint, text, numeric);
drop function if exists public.puntos_criticos();
drop function if exists public.estadisticas_publicas();
drop function if exists public.crear_perfil_usuario();
drop function if exists public.rol_actual();
drop function if exists public.distrito_actual();
drop function if exists public.distrito_valido(text);
drop type if exists public.rol_usuario;
