-- =====================================================================
-- TUTEYA · DATOS DE DEMOSTRACIÓN (ficticios) — INCREMENTAL, NO destructivo
-- No borra tablas ni usuarios. Idempotente (se puede ejecutar varias veces).
-- NO ejecutes supabase.sql para esto (ese archivo borra tablas).
--
-- PASO 1 (manual, seguro): Supabase > Authentication > Users > Add user > "Create new user"
--   Marca "Auto Confirm User" y define una contraseña fuerte propia (no la escribas en el repo):
--     demo.estudiante@tuteya.test   demo.estudiante2@tuteya.test
--     demo.tutora@tuteya.test       demo.tutor@tuteya.test       demo.tutora2@tuteya.test
--   El trigger on_auth_user_created crea el perfil automáticamente.
--   ⚠ Si la base está vacía, el PRIMER usuario creado será ADMIN: crea antes tu cuenta real.
-- PASO 2: ejecuta este archivo en SQL Editor. Los correos que no existan se ignoran.
-- Todo lo creado aquí es DEMOSTRACIÓN (reseñas con prefijo "[Demo]"). No usar en producción.
-- =====================================================================

insert into public.subjects (name, area) values
 ('Matemáticas','Ciencias exactas'),('Física','Ciencias exactas'),('Química','Ciencias naturales'),
 ('Biología','Ciencias naturales'),('Programación','Tecnología'),('Inglés','Idiomas'),
 ('Estadística','Ciencias exactas'),('Contabilidad','Negocios')
on conflict (name) do nothing;

create temp table _d_users (email text, full_name text, city text, level text) on commit drop;
insert into _d_users values
 ('demo.estudiante@tuteya.test','Valentina Gómez','Barranquilla','Secundaria'),
 ('demo.estudiante2@tuteya.test','Andrés Martínez','Soledad','Universidad'),
 ('demo.tutora@tuteya.test','Laura Rodríguez','Barranquilla',null),
 ('demo.tutor@tuteya.test','Carlos Pérez','Soledad',null),
 ('demo.tutora2@tuteya.test','Sofía Herrera','Barranquilla',null);

-- Perfil (si el trigger ya lo creó, solo se actualizan los datos de demostración)
insert into public.profiles (id, full_name, city, education_level, is_active)
select u.id, d.full_name, d.city, d.level, true
from _d_users d join auth.users u on u.email = d.email
on conflict (id) do update set full_name = excluded.full_name, city = excluded.city,
  education_level = excluded.education_level, is_active = true;

-- Roles (additivo; nunca se asigna 'admin')
insert into public.user_roles (user_id, role)
select u.id, case when d.email like '%estudiante%' then 'student'::public.app_role else 'tutor'::public.app_role end
from _d_users d join auth.users u on u.email = d.email
on conflict (user_id, role) do nothing;

create temp table _d_tutor (email text, headline text, bio text, years int, rate numeric, modality text, levels text[], city text) on commit drop;
insert into _d_tutor values
 ('demo.tutora@tuteya.test','Matemáticas e inglés sin complicaciones','Tutora paciente que explica paso a paso y adapta cada clase al ritmo del estudiante. (Perfil de demostración)',4,35000,'ambas',array['Secundaria','Universidad'],'Barranquilla'),
 ('demo.tutor@tuteya.test','Aprende programación creando proyectos reales','Desarrollador que enseña con ejercicios prácticos y proyectos guiados. (Perfil de demostración)',3,45000,'virtual',array['Secundaria','Universidad'],'Soledad'),
 ('demo.tutora2@tuteya.test','Química y biología con ejemplos cotidianos','Licenciada en ciencias naturales; prepara para pruebas Saber y parciales universitarios. (Perfil de demostración)',6,40000,'presencial',array['Primaria','Secundaria'],'Barranquilla');

insert into public.tutor_profiles (user_id, headline, bio, experience_years, hourly_rate, modality, levels, city, is_approved)
select u.id, t.headline, t.bio, t.years, t.rate, t.modality::public.modality, t.levels, t.city, true
from _d_tutor t join auth.users u on u.email = t.email
on conflict (user_id) do update set headline = excluded.headline, bio = excluded.bio,
  experience_years = excluded.experience_years, hourly_rate = excluded.hourly_rate,
  modality = excluded.modality, levels = excluded.levels, city = excluded.city, is_approved = true;

create temp table _d_ts (email text, subject text) on commit drop;
insert into _d_ts values
 ('demo.tutora@tuteya.test','Matemáticas'),('demo.tutora@tuteya.test','Inglés'),('demo.tutora@tuteya.test','Física'),
 ('demo.tutor@tuteya.test','Programación'),('demo.tutor@tuteya.test','Matemáticas'),('demo.tutor@tuteya.test','Estadística'),
 ('demo.tutora2@tuteya.test','Química'),('demo.tutora2@tuteya.test','Biología');
insert into public.tutor_subjects (tutor_id, subject_id)
select u.id, s.id from _d_ts x join auth.users u on u.email = x.email join public.subjects s on s.name = x.subject
on conflict do nothing;

-- Disponibilidad semanal (0=domingo ... 6=sábado)
create temp table _d_av (email text, weekday int, st time, en time) on commit drop;
insert into _d_av values
 ('demo.tutora@tuteya.test',1,'15:00','18:00'),('demo.tutora@tuteya.test',3,'09:00','12:00'),('demo.tutora@tuteya.test',6,'10:00','13:00'),
 ('demo.tutor@tuteya.test',2,'16:00','19:00'),('demo.tutor@tuteya.test',4,'10:00','14:00'),('demo.tutor@tuteya.test',6,'14:00','17:00'),
 ('demo.tutora2@tuteya.test',1,'14:00','17:00'),('demo.tutora2@tuteya.test',5,'08:00','11:00');
insert into public.tutor_availability (tutor_id, weekday, start_time, end_time)
select u.id, a.weekday, a.st, a.en from _d_av a join auth.users u on u.email = a.email
where not exists (select 1 from public.tutor_availability x
  where x.tutor_id = u.id and x.weekday = a.weekday and x.start_time = a.st and x.end_time = a.en);

-- Sesiones PASADAS completadas (ids fijos => idempotente) para demostrar reputación y reseñas.
-- No se crean reservas futuras: se crean en vivo durante la sustentación.
create temp table _d_bk (id uuid, student text, tutor text, subject text, days_ago int, hour int, rating int, comment text) on commit drop;
insert into _d_bk values
 ('11111111-1111-4111-8111-000000000001','demo.estudiante@tuteya.test','demo.tutora@tuteya.test','Matemáticas',20,16,5,'[Demo] Explicó álgebra con mucha claridad.'),
 ('11111111-1111-4111-8111-000000000002','demo.estudiante2@tuteya.test','demo.tutora@tuteya.test','Inglés',12,10,4,'[Demo] Clases dinámicas y puntuales.'),
 ('11111111-1111-4111-8111-000000000003','demo.estudiante@tuteya.test','demo.tutor@tuteya.test','Programación',9,17,5,'[Demo] Aprendí a crear mi primera API.'),
 ('11111111-1111-4111-8111-000000000004','demo.estudiante2@tuteya.test','demo.tutora2@tuteya.test','Química',6,15,5,'[Demo] Muy buena preparación para el parcial.');
insert into public.bookings (id, student_id, tutor_id, subject_id, modality, starts_at, duration_minutes, status, notes)
select b.id, s.id, t.id, sj.id,
       case when b.tutor = 'demo.tutora2@tuteya.test' then 'presencial'::public.modality else 'virtual'::public.modality end,
       date_trunc('day', now()) - make_interval(days => b.days_ago) + make_interval(hours => b.hour),
       60, 'completada', 'Sesión de demostración'
from _d_bk b join auth.users s on s.email = b.student join auth.users t on t.email = b.tutor
join public.subjects sj on sj.name = b.subject
on conflict (id) do nothing;

insert into public.reviews (booking_id, tutor_id, student_id, rating, comment)
select b.id, bk.tutor_id, bk.student_id, b.rating, b.comment
from _d_bk b join public.bookings bk on bk.id = b.id
on conflict (booking_id) do nothing;

-- Verificación rápida (solo lectura)
select (select count(*) from public.profiles p join auth.users u on u.id = p.id where u.email like 'demo.%@tuteya.test') as perfiles_demo,
       (select count(*) from public.tutor_profiles where is_approved) as tutores_aprobados,
       (select count(*) from public.reviews where comment like '[Demo]%') as resenas_demo;
