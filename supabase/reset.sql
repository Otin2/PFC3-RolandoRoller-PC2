-- ============================================================
-- BORRA TODO EL ESQUEMA DE LA APP (para volver a aplicar schema.sql)
-- ¡Cuidado! Elimina tablas y datos. No borra los usuarios de Auth.
-- ============================================================
drop trigger if exists al_registrar_usuario on auth.users;
drop table if exists public.detalle_pedido cascade;
drop table if exists public.pedidos cascade;
drop table if exists public.productos cascade;
drop table if exists public.tiendas cascade;
drop table if exists public.usuarios cascade;
drop function if exists public.cambiar_rol(uuid, public.rol_usuario);
drop function if exists public.cambiar_estado_pedido(bigint, text);
drop function if exists public.cancelar_pedido(bigint);
drop function if exists public.crear_pedido(jsonb);
drop function if exists public.es_vendedor_del_pedido(bigint);
drop function if exists public.crear_perfil_usuario();
drop function if exists public.rol_actual();
drop type if exists public.rol_usuario;
