-- TUTEYA — datos de demostración compatibles con el esquema existente de supabase.sql
-- NO elimina tablas ni usuarios.
--
-- PASO 1: En Supabase > Authentication > Users, crea manualmente estos usuarios
-- con correo y contraseña de prueba (puedes usar contraseñas temporales fuertes):
--   demo.estudiante@tuteya.test
--   demo.estudiante2@tuteya.test
--   demo.tutora@tuteya.test
--   demo.tutor@tuteya.test
-- Confirma los correos si tu proyecto lo requiere.
-- PASO 2: ejecuta primero el archivo supabase.sql original del repositorio.
-- PASO 3: ejecuta este script en SQL Editor.
-- Si alguno de los correos no existe en auth.users, ese perfil no se creará.
-- No uses estos usuarios en producción.

insert into public.subjects (name, area) values
 ('Matemáticas', 'Ciencias exactas'),
 ('Física', 'Ciencias naturales'),
 ('Química', 'Ciencias naturales'),
 ('Programación', 'Tecnología'),
 ('Inglés', 'Idiomas'),
 ('Estadística', 'Ciencias exactas'),
 ('Historia', 'Ciencias sociales'),
 ('Contabilidad', 'Negocios')
on conflict (name) do nothing;

-- Crear los perfiles para cuentas creadas previamente en Supabase Auth.
insert into public.profiles (id, full_name, city, education_level, is_active)
select u.id,
       case u.email
         when 'demo.estudiante@tuteya.test' then 'Valentina Gómez'
         when 'demo.estudiante2@tuteya.test' then 'Andrés Martínez'
         when 'demo.tutora@tuteya.test' then 'Laura Rodríguez'
         when 'demo.tutor@tuteya.test' then 'Carlos Pérez'
       end,
       case u.email
         when 'demo.estudiante2@tuteya.test' then 'Soledad'
         when 'demo.tutor@tuteya.test' then 'Soledad'
         else 'Barranquilla'
       end,
       case when u.email like '%estudiante%' then 'Universidad' else null end,
       true
from auth.users u
where u.email in (
  'demo.estudiante@tuteya.test',
  'demo.estudiante2@tuteya.test',
  'demo.tutora@tuteya.test',
  'demo.tutor@tuteya.test'
)
on conflict (id) do update
set full_name = excluded.full_name,
    city = excluded.city,
    education_level = excluded.education_level,
    is_active = true;

-- Asignar roles. Solo para datos demo; no copies el rol admin a usuarios públicos.
insert into public.user_roles (user_id, role)
select u.id,
       case when u.email like '%estudiante%' then 'student'::public.app_role
            else 'tutor'::public.app_role end
from auth.users u
where u.email in (
  'demo.estudiante@tuteya.test',
  'demo.estudiante2@tuteya.test',
  'demo.tutora@tuteya.test',
  'demo.tutor@tuteya.test'
)
on conflict (user_id, role) do nothing;

-- Perfiles de tutor listos para aparecer en la búsqueda.
insert into public.tutor_profiles
  (user_id, headline, bio, experience_years, hourly_rate, modality, levels, city, is_approved)
select u.id,
       case u.email
         when 'demo.tutora@tuteya.test' then 'Matemáticas e inglés sin complicaciones'
         else 'Aprende programación creando proyectos reales'
       end,
       case u.email
         when 'demo.tutora@tuteya.test' then 'Tutora paciente que explica paso a paso y adapta las clases al ritmo de cada estudiante.'
         else 'Desarrollador de software que enseña programación con ejercicios prácticos y proyectos guiados.'
       end,
       case u.email when 'demo.tutora@tuteya.test' then 4 else 3 end,
       case u.email when 'demo.tutora@tuteya.test' then 35000 else 45000 end,
       case u.email when 'demo.tutora@tuteya.test' then 'ambas'::public.modality else 'virtual'::public.modality end,
       array['Secundaria', 'Universidad'],
       case u.email when 'demo.tutor@tuteya.test' then 'Soledad' else 'Barranquilla' end,
       true
from auth.users u
where u.email in ('demo.tutora@tuteya.test', 'demo.tutor@tuteya.test')
on conflict (user_id) do update
set headline = excluded.headline,
    bio = excluded.bio,
    experience_years = excluded.experience_years,
    hourly_rate = excluded.hourly_rate,
    modality = excluded.modality,
    levels = excluded.levels,
    city = excluded.city,
    is_approved = true;

insert into public.tutor_subjects (tutor_id, subject_id)
select u.id, s.id
from auth.users u
join public.subjects s on (
  (u.email = 'demo.tutora@tuteya.test' and s.name in ('Matemáticas', 'Inglés', 'Física'))
  or
  (u.email = 'demo.tutor@tuteya.test' and s.name in ('Programación', 'Matemáticas', 'Estadística'))
)
where u.email in ('demo.tutora@tuteya.test', 'demo.tutor@tuteya.test')
on conflict (tutor_id, subject_id) do nothing;

-- Horarios semanales de muestra: 0=domingo ... 6=sábado.
insert into public.tutor_availability (tutor_id, weekday, start_time, end_time)
select u.id, v.weekday, v.start_time::time, v.end_time::time
from auth.users u
cross join (values
  (1, '15:00', '18:00'),
  (3, '09:00', '12:00'),
  (6, '10:00', '13:00')
) as v(weekday, start_time, end_time)
where u.email = 'demo.tutora@tuteya.test'
  and not exists (
    select 1 from public.tutor_availability a
    where a.tutor_id = u.id and a.weekday = v.weekday
      and a.start_time = v.start_time::time and a.end_time = v.end_time::time
  );

insert into public.tutor_availability (tutor_id, weekday, start_time, end_time)
select u.id, v.weekday, v.start_time::time, v.end_time::time
from auth.users u
cross join (values
  (2, '16:00', '19:00'),
  (4, '10:00', '14:00'),
  (6, '14:00', '17:00')
) as v(weekday, start_time, end_time)
where u.email = 'demo.tutor@tuteya.test'
  and not exists (
    select 1 from public.tutor_availability a
    where a.tutor_id = u.id and a.weekday = v.weekday
      and a.start_time = v.start_time::time and a.end_time = v.end_time::time
  );

-- El script no crea reservas de ejemplo porque las restricciones actuales evitan
-- dos reservas del mismo tutor a la misma hora, pero no cubren todos los solapamientos.
-- Revisa RLS y añade validación transaccional de cruces horarios antes de producción.
