-- ============================================================
-- DATOS DE PRUEBA
-- PASO PREVIO: registrar estos 3 usuarios desde /registro de la app
-- (todos con la contraseña 123456):
--   test@test.com  -> rol Vendedor
--   demo@demo.com  -> rol Comprador
--   exam@exam.com  -> rol Comprador (aquí se convierte en admin)
-- Luego ejecutar este archivo en Supabase -> SQL Editor.
-- ============================================================

-- El admin no se puede elegir al registrarse: se asigna por SQL
update public.usuarios set rol = 'admin' where email = 'exam@exam.com';

-- Entidad principal (ej. tiendas) del vendedor
insert into public.tiendas (usuario_id, nombre, rubro)
select u.id, x.nombre, x.rubro
from public.usuarios u
cross join (values
  ('Tienda Demo 1', 'Textil'),
  ('Tienda Demo 2', 'Calzado'),
  ('Tienda Demo 3', 'Accesorios')
) as x(nombre, rubro)
where u.email = 'test@test.com';

-- Entidad hija (ej. productos)
insert into public.productos (tienda_id, nombre, precio, stock)
select t.id, x.nombre, x.precio, x.stock
from public.tiendas t
join (values
  ('Tienda Demo 1', 'Polo básico',   25.00, 50),
  ('Tienda Demo 1', 'Jean clásico',  79.90, 20),
  ('Tienda Demo 1', 'Casaca',       120.00,  8),
  ('Tienda Demo 2', 'Zapatilla urbana', 149.90, 12),
  ('Tienda Demo 3', 'Gorra',         19.90, 30)
) as x(tienda, nombre, precio, stock) on x.tienda = t.nombre;

-- Transacción con su detalle (ej. pedido del comprador)
-- total = 2 x 25.00 + 1 x 79.90 = 129.90
with nuevo as (
  insert into public.pedidos (usuario_id, estado, total)
  select id, 'confirmado', 129.90 from public.usuarios where email = 'demo@demo.com'
  returning id
)
insert into public.detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
select nuevo.id, p.id, x.cantidad, p.precio
from nuevo
join public.productos p on p.nombre in ('Polo básico', 'Jean clásico')
join (values ('Polo básico', 2), ('Jean clásico', 1)) as x(nombre, cantidad) on x.nombre = p.nombre;

-- Segundo pedido: 1 x 149.90 + 3 x 19.90 = 209.60
with nuevo as (
  insert into public.pedidos (usuario_id, estado, total)
  select id, 'pendiente', 209.60 from public.usuarios where email = 'demo@demo.com'
  returning id
)
insert into public.detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
select nuevo.id, p.id, x.cantidad, p.precio
from nuevo
join public.productos p on p.nombre in ('Zapatilla urbana', 'Gorra')
join (values ('Zapatilla urbana', 1), ('Gorra', 3)) as x(nombre, cantidad) on x.nombre = p.nombre;
