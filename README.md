# TUTEYA — Plataforma de tutorías
TanStack Start + React + Tailwind + Supabase. Despliegue en Vercel.

## Local
    npm install
    npm run dev

## Base de datos
Supabase > SQL Editor: pega `supabase.sql` y ejecuta. Desactiva *Confirm email* en Auth > Providers > Email.
El primer usuario registrado es **admin** (aprueba tutores, materias y reservas).

## Vercel
Import Project > repo TUTEYA- > Deploy. Variables opcionales (ya hay valores por defecto):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
En Supabase > Auth > URL Configuration pon la URL de Vercel en *Site URL*.
