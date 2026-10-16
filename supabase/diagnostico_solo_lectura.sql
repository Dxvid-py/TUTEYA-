-- TUTEYA · DIAGNÓSTICO DE SOLO LECTURA (solo SELECT; no modifica nada)
-- Ejecútalo en Supabase > SQL Editor y compárteme los resultados antes de aplicar la migración.

-- 1) Columnas reales de las tablas del proyecto
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 2) Restricciones (PK, FK, UNIQUE, CHECK) e índices
select conrelid::regclass as tabla, conname, contype, pg_get_constraintdef(oid) as definicion
from pg_constraint where connamespace = 'public'::regnamespace order by 1, 2;
select tablename, indexname, indexdef from pg_indexes where schemaname = 'public' order by 1, 2;

-- 3) RLS activado y políticas
select relname as tabla, relrowsecurity as rls from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1;
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by 1, 2;

-- 4) Triggers y funciones
select event_object_table as tabla, trigger_name, action_timing, event_manipulation
from information_schema.triggers where trigger_schema in ('public','auth') order by 1, 2;
select p.proname, pg_get_function_identity_arguments(p.oid) as args, p.prosecdef as security_definer
from pg_proc p where p.pronamespace = 'public'::regnamespace order by 1;

-- 5) Permisos de anon sobre profiles (¿se expone phone?)
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles' and grantee in ('anon','authenticated')
order by grantee, column_name;

-- 6) Datos: cuántos admins existen y si hay reservas ya solapadas
select role, count(*) from public.user_roles group by role;
select a.id as reserva_a, b.id as reserva_b, a.tutor_id, a.starts_at, b.starts_at as starts_at_b
from public.bookings a join public.bookings b
  on a.tutor_id = b.tutor_id and a.id < b.id
 and a.status in ('pendiente','confirmada') and b.status in ('pendiente','confirmada')
 and tstzrange(a.starts_at, a.starts_at + make_interval(mins => a.duration_minutes))
  && tstzrange(b.starts_at, b.starts_at + make_interval(mins => b.duration_minutes));

-- 7) ¿Algún tutor ya se auto-aprobó? (revisión manual)
select user_id, is_approved, created_at, updated_at from public.tutor_profiles order by created_at;
