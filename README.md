# TUTEYA — Plataforma de tutorías
TanStack Start + React + Tailwind + Supabase. Despliegue en Vercel.

## Local
    npm install
    npm run dev

## Base de datos
- **Base NUEVA y vacía:** `supabase.sql` (⚠ borra tablas: nunca sobre una base con datos).
- **Base existente:** 1) `supabase/diagnostico_solo_lectura.sql` 2) `supabase/migrations/20261016_hardening_incremental.sql`.
- **Datos de demostración:** crea los usuarios en Auth y ejecuta `supabase.demo.sql` (instrucciones en el encabezado).
- Desactiva *Confirm email* en Auth > Providers > Email solo si quieres registro sin verificación.
- El primer usuario registrado en una base vacía es **admin**.
- Acceso con Google: desactivado (`VITE_ENABLE_GOOGLE_AUTH=false`).
- Auditoría y matriz de cumplimiento: `docs/AUDITORIA_Y_MATRIZ.md`.

## Vercel
Import Project > repo TUTEYA- > Deploy. Variables opcionales (ya hay valores por defecto):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
En Supabase > Auth > URL Configuration pon la URL de Vercel en *Site URL*.
