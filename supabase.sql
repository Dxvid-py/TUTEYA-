-- #####################################################################
-- # ⚠️  ADVERTENCIA: ESTE ARCHIVO ES DESTRUCTIVO (DROP TABLE ... CASCADE).
-- # Solo sirve para crear una base NUEVA y VACÍA. NO lo ejecutes sobre una
-- # base con datos. Para la base existente usa:
-- #   1) supabase/diagnostico_solo_lectura.sql
-- #   2) supabase/migrations/20261016_hardening_incremental.sql
-- #####################################################################
-- =====================================================
-- TUTEYA · Base de datos completa (Supabase > SQL Editor > Run)
-- Antes: Authentication > Providers > Email > desactiva "Confirm email"
-- El PRIMER usuario que se registre queda como ADMIN automáticamente.
-- =====================================================

-- 0. LIMPIEZA: borra tablas de la versión anterior para empezar de cero
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.reviews, public.bookings, public.availability, public.notifications,
  public.tutor_availability, public.tutor_subjects, public.tutor_profiles, public.tutors,
  public.subjects, public.user_roles, public.profiles cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.notify_booking() cascade;
drop function if exists public.update_rating() cascade;
drop function if exists public.owns_tutor(uuid) cascade;
drop function if exists public.guard_booking_update() cascade;
drop type if exists public.app_role, public.booking_status, public.modality cascade;
-- Opcional: borrar usuarios de pruebas viejos (quita los -- de la línea):
-- delete from auth.users;

-- 1. TABLAS, SEGURIDAD, AUTOMATIZACIONES Y MATERIAS
-- profiles: datos del usuario | user_roles: admin, tutor o student
-- subjects: materias | tutor_profiles: ficha del tutor (el admin la aprueba)
-- tutor_availability: horarios | bookings: reservas | reviews: reseñas
-- notifications: avisos | RLS: cada usuario ve solo lo que le corresponde

create type public.app_role as enum ('admin','tutor','student');
create type public.booking_status as enum ('pendiente','confirmada','rechazada','cancelada','completada');
create type public.modality as enum ('virtual','presencial','ambas');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text,
  city text,
  education_level text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  area text not null default 'General',
  created_at timestamptz not null default now()
);
grant select on public.subjects to anon, authenticated;
grant insert, update, delete on public.subjects to authenticated;
grant all on public.subjects to service_role;
alter table public.subjects enable row level security;

create table public.tutor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text not null default '',
  bio text not null default '',
  experience_years int not null default 0 check (experience_years >= 0),
  hourly_rate numeric(10,2) not null default 0 check (hourly_rate >= 0),
  modality modality not null default 'virtual',
  levels text[] not null default '{}',
  city text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.tutor_profiles to anon;
grant select, insert, update, delete on public.tutor_profiles to authenticated;
grant all on public.tutor_profiles to service_role;
alter table public.tutor_profiles enable row level security;

create table public.tutor_subjects (
  tutor_id uuid not null references public.tutor_profiles(user_id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  primary key (tutor_id, subject_id)
);
grant select on public.tutor_subjects to anon;
grant select, insert, delete on public.tutor_subjects to authenticated;
grant all on public.tutor_subjects to service_role;
alter table public.tutor_subjects enable row level security;

create table public.tutor_availability (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutor_profiles(user_id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);
grant select on public.tutor_availability to anon;
grant select, insert, update, delete on public.tutor_availability to authenticated;
grant all on public.tutor_availability to service_role;
alter table public.tutor_availability enable row level security;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.tutor_profiles(user_id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  modality modality not null default 'virtual',
  starts_at timestamptz not null,
  duration_minutes int not null default 60 check (duration_minutes between 30 and 240),
  status booking_status not null default 'pendiente',
  notes text,
  created_at timestamptz not null default now()
);
create unique index bookings_no_double on public.bookings (tutor_id, starts_at) where status in ('pendiente','confirmada');
create index bookings_student_idx on public.bookings(student_id);
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  tutor_id uuid not null references public.tutor_profiles(user_id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon;
grant select, insert, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

-- Policies
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own update" on public.profiles for update to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "profiles own insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles admin delete" on public.profiles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "roles read own or admin" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "roles admin insert" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "roles admin update" on public.user_roles for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "roles admin delete" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "subjects read" on public.subjects for select using (true);
create policy "subjects admin write" on public.subjects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "tutor profiles read approved" on public.tutor_profiles for select using (is_approved or auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "tutor profiles own insert" on public.tutor_profiles for insert to authenticated with check (auth.uid() = user_id and public.has_role(auth.uid(),'tutor') and is_approved = false);
create policy "tutor profiles own update" on public.tutor_profiles for update to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "tutor profiles admin delete" on public.tutor_profiles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "tutor subjects read" on public.tutor_subjects for select using (true);
create policy "tutor subjects own write" on public.tutor_subjects for insert to authenticated with check (auth.uid() = tutor_id or public.has_role(auth.uid(),'admin'));
create policy "tutor subjects own delete" on public.tutor_subjects for delete to authenticated using (auth.uid() = tutor_id or public.has_role(auth.uid(),'admin'));

create policy "availability read" on public.tutor_availability for select using (true);
create policy "availability own all" on public.tutor_availability for all to authenticated using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);

create policy "bookings read participants" on public.bookings for select to authenticated using (auth.uid() in (student_id, tutor_id) or public.has_role(auth.uid(),'admin'));
create policy "bookings student insert" on public.bookings for insert to authenticated with check (auth.uid() = student_id and status = 'pendiente' and student_id <> tutor_id);
create policy "bookings participants update" on public.bookings for update to authenticated using (auth.uid() in (student_id, tutor_id) or public.has_role(auth.uid(),'admin'));
create policy "bookings admin delete" on public.bookings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "reviews read" on public.reviews for select using (true);
create policy "reviews student insert" on public.reviews for insert to authenticated with check (
  auth.uid() = student_id and exists (select 1 from public.bookings b where b.id = booking_id and b.student_id = auth.uid() and b.tutor_id = reviews.tutor_id and b.status = 'completada'));
create policy "reviews admin delete" on public.reviews for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "notifications own" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notifications own update" on public.notifications for update to authenticated using (auth.uid() = user_id);
create policy "notifications own delete" on public.notifications for delete to authenticated using (auth.uid() = user_id);

-- Booking status transitions guard
create or replace function public.guard_booking_update() returns trigger language plpgsql security definer set search_path = public as $$
declare is_admin boolean := public.has_role(auth.uid(),'admin');
begin
  if is_admin then return new; end if;
  if new.student_id <> old.student_id or new.tutor_id <> old.tutor_id or new.starts_at <> old.starts_at then
    raise exception 'No se pueden modificar los datos de la reserva';
  end if;
  if new.status = old.status then return new; end if;
  if auth.uid() = old.tutor_id then
    if not ((old.status='pendiente' and new.status in ('confirmada','rechazada')) or (old.status='confirmada' and new.status in ('completada','cancelada'))) then
      raise exception 'Transición de estado no permitida';
    end if;
  elsif auth.uid() = old.student_id then
    if not (old.status in ('pendiente','confirmada') and new.status = 'cancelada') then
      raise exception 'Transición de estado no permitida';
    end if;
  end if;
  return new;
end $$;
create trigger bookings_guard before update on public.bookings for each row execute function public.guard_booking_update();

-- Notifications on booking events
create or replace function public.notify_booking() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications(user_id,title,body) values (new.tutor_id,'Nueva solicitud de tutoría','Un estudiante ha solicitado una sesión.');
  elsif new.status <> old.status then
    insert into public.notifications(user_id,title,body) values (new.student_id,'Tu reserva cambió de estado','Estado actual: '||new.status);
    insert into public.notifications(user_id,title,body) values (new.tutor_id,'Reserva actualizada','Estado actual: '||new.status);
  end if;
  return new;
end $$;
create trigger bookings_notify after insert or update on public.bookings for each row execute function public.notify_booking();

-- Signup: profile + role (student/tutor only; first user ever becomes admin)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare wanted text := coalesce(new.raw_user_meta_data->>'role','student');
begin
  insert into public.profiles(id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  end if;
  if wanted = 'tutor' then
    insert into public.user_roles(user_id, role) values (new.id,'tutor');
    insert into public.tutor_profiles(user_id) values (new.id);
  else
    insert into public.user_roles(user_id, role) values (new.id,'student');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.subjects(name, area) values
('Matemáticas','Ciencias exactas'),('Física','Ciencias exactas'),('Química','Ciencias naturales'),('Biología','Ciencias naturales'),
('Programación','Tecnología'),('Inglés','Idiomas'),('Lengua y Literatura','Humanidades'),('Historia','Humanidades'),
('Contabilidad','Negocios'),('Estadística','Ciencias exactas');

create policy "tutor profiles admin insert" on public.tutor_profiles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
