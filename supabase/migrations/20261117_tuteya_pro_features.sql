-- =====================================================================
-- TUTEYA · Migración Incremental Pro (IA, Videoconferencia y Tutor YA)
-- NO borra tablas ni datos existentes. Seguro e idempotente.
-- Ejecutar en Supabase > SQL Editor > Run
-- =====================================================================
begin;

-- 1. Columnas para videoconferencia integrada y modo express en reservas
alter table public.bookings
  add column if not exists meeting_url text,
  add column if not exists is_express boolean not null default false;

-- 2. Estado en línea y ubicación aproximada para modo "Tutor YA" (tipo Uber/Rappi)
alter table public.tutor_profiles
  add column if not exists is_online boolean not null default false,
  add column if not exists zone text;

-- 3. Tabla de solicitudes en tiempo real ("Tutor YA" / Uber de tutorías)
create table if not exists public.express_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid references public.tutor_profiles(user_id) on delete set null,
  subject_name text not null,
  topic text not null,
  modality text not null default 'virtual',
  status text not null default 'searching'
    check (status in ('searching', 'accepted', 'cancelled', 'expired')),
  meeting_url text,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.express_requests to authenticated;
grant all on public.express_requests to service_role;
alter table public.express_requests enable row level security;

drop policy if exists "express read authenticated" on public.express_requests;
create policy "express read authenticated" on public.express_requests
  for select to authenticated using (true);

drop policy if exists "express student insert" on public.express_requests;
create policy "express student insert" on public.express_requests
  for insert to authenticated with check (auth.uid() = student_id);

drop policy if exists "express participants update" on public.express_requests;
create policy "express participants update" on public.express_requests
  for update to authenticated using (true);

-- 4. Habilitar Realtime en express_requests y notifications
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'express_requests'
  ) then
    alter publication supabase_realtime add table public.express_requests;
  end if;
exception when others then
  null;
end $$;

commit;
