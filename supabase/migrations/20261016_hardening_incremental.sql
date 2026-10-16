-- =====================================================================
-- TUTEYA · Migración INCREMENTAL de seguridad y reservas
-- NO borra tablas ni datos. Idempotente: se puede ejecutar más de una vez.
-- Requisito: haber ejecutado supabase/diagnostico_solo_lectura.sql y confirmado
-- que las tablas/columnas coinciden con las de supabase.sql.
-- Se ejecuta como UNA transacción: si algo falla, no se aplica nada.
-- Nota: auth.uid() es NULL en el SQL Editor y con service_role, por eso los
-- guards solo restringen a usuarios finales (no rompen seeds ni tareas admin).
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.bookings') is null or to_regclass('public.tutor_profiles') is null
     or to_regclass('public.profiles') is null or to_regprocedure('public.has_role(uuid,app_role)') is null then
    raise exception 'El esquema no coincide con lo esperado; aborta y revisa el diagnóstico.';
  end if;
end $$;

-- 1) CRÍTICO: un tutor NO puede aprobarse a sí mismo (la política de UPDATE no restringe columnas).
create or replace function public.guard_tutor_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.has_role(auth.uid(), 'admin') then
    if new.is_approved is distinct from old.is_approved then
      raise exception 'Solo un administrador puede aprobar o retirar la aprobación de un tutor';
    end if;
    if new.user_id <> old.user_id then
      raise exception 'No se puede cambiar el propietario del perfil';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists tutor_profiles_guard on public.tutor_profiles;
create trigger tutor_profiles_guard before update on public.tutor_profiles
  for each row execute function public.guard_tutor_profile_update();

-- 2) Reservas: prohibir SOLAPAMIENTOS reales (el índice único solo cubría la misma hora exacta).
--    El advisory lock serializa las reservas simultáneas del mismo tutor (evita condiciones de carrera).
--    Solo afecta a escrituras nuevas; no toca filas existentes.
create or replace function public.prevent_booking_overlap() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('pendiente', 'confirmada') then
    perform pg_advisory_xact_lock(hashtextextended(new.tutor_id::text, 0));
    if exists (
      select 1 from public.bookings b
      where b.tutor_id = new.tutor_id and b.id <> new.id
        and b.status in ('pendiente', 'confirmada')
        and tstzrange(b.starts_at, b.starts_at + make_interval(mins => b.duration_minutes))
         && tstzrange(new.starts_at, new.starts_at + make_interval(mins => new.duration_minutes))
    ) then
      raise exception 'El tutor ya tiene una reserva en ese horario' using errcode = '23P01';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists bookings_no_overlap on public.bookings;
create trigger bookings_no_overlap before insert or update of starts_at, duration_minutes, status, tutor_id
  on public.bookings for each row execute function public.prevent_booking_overlap();

-- 3) Reservas: los participantes no pueden alterar duración, modalidad ni materia (solo el estado permitido).
--    Misma lógica que supabase.sql + campos inmutables.
create or replace function public.guard_booking_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare is_admin boolean := public.has_role(auth.uid(), 'admin');
begin
  if is_admin then return new; end if;
  if new.student_id <> old.student_id or new.tutor_id <> old.tutor_id or new.starts_at <> old.starts_at
     or new.duration_minutes <> old.duration_minutes or new.modality <> old.modality
     or new.subject_id is distinct from old.subject_id then
    raise exception 'No se pueden modificar los datos de la reserva';
  end if;
  if new.status = old.status then return new; end if;
  if auth.uid() = old.tutor_id then
    if not ((old.status = 'pendiente' and new.status in ('confirmada', 'rechazada'))
         or (old.status = 'confirmada' and new.status in ('completada', 'cancelada'))) then
      raise exception 'Transición de estado no permitida';
    end if;
  elsif auth.uid() = old.student_id then
    if not (old.status in ('pendiente', 'confirmada') and new.status = 'cancelada') then
      raise exception 'Transición de estado no permitida';
    end if;
  end if;
  return new;
end $$;

-- 4) Reservas: solo con tutores aprobados, en el futuro y con modalidad compatible.
drop policy if exists "bookings student insert" on public.bookings;
create policy "bookings student insert" on public.bookings for insert to authenticated
with check (
  auth.uid() = student_id and status = 'pendiente' and student_id <> tutor_id
  and starts_at > now()
  and exists (select 1 from public.tutor_profiles t
              where t.user_id = bookings.tutor_id and t.is_approved
                and (t.modality = 'ambas' or t.modality = bookings.modality))
);

-- 5) Horarios ocupados visibles para el estudiante SIN exponer datos personales
--    (la RLS impide leer reservas ajenas; esta función devuelve solo rangos de tiempo).
create or replace function public.get_tutor_busy_slots(_tutor_id uuid, _from timestamptz, _to timestamptz)
returns table (starts_at timestamptz, duration_minutes int)
language sql stable security definer set search_path = public as $$
  select b.starts_at, b.duration_minutes from public.bookings b
  where b.tutor_id = _tutor_id and b.status in ('pendiente', 'confirmada')
    and b.starts_at >= _from and b.starts_at < _to
$$;
revoke all on function public.get_tutor_busy_slots(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_tutor_busy_slots(uuid, timestamptz, timestamptz) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- OPCIONAL (revisar antes): el correo/teléfono de profiles es legible por cualquiera (policy "using (true)").
-- Para que anon solo lea columnas públicas, ejecuta por separado y prueba /tutores sin sesión:
--   revoke select on public.profiles from anon;
--   grant select (id, full_name, avatar_url, city) on public.profiles to anon;
-- (Para usuarios autenticados conviene mover phone a una tabla privada; requiere cambios en la app.)
--
-- ROLLBACK de esta migración:
--   drop trigger if exists tutor_profiles_guard on public.tutor_profiles;
--   drop trigger if exists bookings_no_overlap on public.bookings;
--   drop function if exists public.get_tutor_busy_slots(uuid, timestamptz, timestamptz);
--   (restaurar guard_booking_update y la política desde supabase.sql)
-- ---------------------------------------------------------------------
