-- ============================================================
-- DATOS DE PRUEBA — PataLimpia (correr UNA sola vez)
-- PASO PREVIO: registrar en /registro (contraseña 123456 para todos):
--   vecino@pata.com -> rol Vecino,        distrito Los Olivos
--   fiscal@pata.com -> rol Fiscalizador,  distrito Los Olivos
--   admin@pata.com  -> rol Vecino (aquí se convierte en admin)
-- ============================================================

-- El admin no se elige al registrarse: se asigna por SQL
update public.usuarios set rol = 'admin' where email = 'admin@pata.com';

-- Mascotas registradas (en los 4 distritos)
insert into public.mascotas (usuario_id, nombre, especie, distrito)
select u.id, x.nombre, x.especie, x.distrito
from public.usuarios u
cross join (values
  ('Firulais', 'perro', 'Los Olivos'),
  ('Michi',    'gato',  'Los Olivos'),
  ('Rocky',    'perro', 'Comas'),
  ('Luna',     'perro', 'San Martín de Porres'),
  ('Pelusa',   'gato',  'Independencia'),
  ('Toby',     'perro', 'Comas'),
  ('Coco',     'otro',  'San Martín de Porres'),
  ('Max',      'perro', 'Independencia')
) as x(nombre, especie, distrito)
where u.email = 'vecino@pata.com';

-- Reportes de puntos críticos (algunos ya atendidos)
insert into public.reportes (usuario_id, tipo, descripcion, lat, lng, distrito, estado, nota, atendido_por, atendido_en)
select v.id, x.tipo, x.descripcion, x.lat, x.lng, x.distrito, x.estado,
       case when x.estado = 'atendido' then 'Se limpió la zona y se notificó a los vecinos.' end,
       case when x.estado = 'atendido' then f.id end,
       case when x.estado = 'atendido' then now() - interval '1 day' end
from public.usuarios v
cross join public.usuarios f
cross join (values
  ('heces',          'Heces en la vereda frente al parque',      -11.9620, -77.0710, 'Los Olivos',            'pendiente'),
  ('orina',          'Esquina con fuerte olor a orina',          -11.9585, -77.0752, 'Los Olivos',            'atendido'),
  ('mascota_suelta', 'Perro suelto sin collar todas las mañanas', -11.9655, -77.0688, 'Los Olivos',            'pendiente'),
  ('heces',          'Berma central llena de heces',              -11.9302, -77.0480, 'Comas',                 'pendiente'),
  ('heces',          'Parque zonal sin recojo de heces',          -11.9355, -77.0545, 'Comas',                 'atendido'),
  ('orina',          'Fachada deteriorada por orina',             -12.0015, -77.0830, 'San Martín de Porres',  'pendiente'),
  ('mascota_suelta', 'Jauría suelta cerca del colegio',           -12.0060, -77.0790, 'San Martín de Porres',  'pendiente'),
  ('heces',          'Vereda del mercado con heces',              -11.9905, -77.0520, 'Independencia',         'atendido')
) as x(tipo, descripcion, lat, lng, distrito, estado)
where v.email = 'vecino@pata.com' and f.email = 'fiscal@pata.com';

-- Una sanción registrada sobre un reporte atendido
insert into public.sanciones (reporte_id, fiscalizador_id, accion, multa)
select r.id, f.id, 'Notificación al dueño por no recoger las heces', 172.00
from public.reportes r cross join public.usuarios f
where r.descripcion = 'Esquina con fuerte olor a orina' and f.email = 'fiscal@pata.com';
