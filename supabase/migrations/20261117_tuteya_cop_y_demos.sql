-- ============================================================================
-- TUTEYA COLOMBIA: Cuentas Demo (Estudiante y Profesor) + Precios en COP
-- Ejecutar en Supabase -> SQL Editor
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_student_id uuid := '11111111-1111-1111-1111-111111111111';
  v_tutor_id   uuid := '22222222-2222-2222-2222-222222222222';
  v_pass_hash  text := extensions.crypt('TuteyaDemo2026!', extensions.gen_salt('bf'));
BEGIN
  -- 1. Crear o actualizar usuario ESTUDIANTE DEMO en auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_student_id,
    'authenticated',
    'authenticated',
    'estudiante.demo@tuteya.co',
    v_pass_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Valeria Gómez","role":"student"}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = now(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    v_student_id,
    v_student_id,
    jsonb_build_object('sub', v_student_id::text, 'email', 'estudiante.demo@tuteya.co'),
    'email',
    v_student_id::text,
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- 2. Crear o actualizar usuario PROFESOR DEMO en auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_tutor_id,
    'authenticated',
    'authenticated',
    'profe.demo@tuteya.co',
    v_pass_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Prof. Carlos Mendoza","role":"tutor"}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = now(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    v_tutor_id,
    v_tutor_id,
    jsonb_build_object('sub', v_tutor_id::text, 'email', 'profe.demo@tuteya.co'),
    'email',
    v_tutor_id::text,
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- 3. Sincronizar tabla public.profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES
      (
        v_student_id,
        'Valeria Gómez',
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'
      ),
      (
        v_tutor_id,
        'Prof. Carlos Mendoza',
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
      )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;

    UPDATE public.profiles
    SET avatar_url = 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400'
    WHERE avatar_url IS NULL OR avatar_url LIKE '%unsplash.com/photos/%';
  END IF;

  -- 4. Sincronizar tabla public.user_roles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES
      (v_student_id, 'student'),
      (v_tutor_id, 'tutor')
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;

  -- 5. Sincronizar tabla public.tutor_profiles y convertir tarifas a COP
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tutor_profiles'
  ) THEN
    INSERT INTO public.tutor_profiles (user_id, headline, bio, hourly_rate, rating, subjects)
    VALUES (
      v_tutor_id,
      'Ingeniero Electrónico · Cálculo, Álgebra Lineal y Física',
      'Profesor verificado en Tuteya Colombia con 6 años de experiencia preparando estudiantes universitarios.',
      45000,
      4.98,
      ARRAY['Cálculo', 'Álgebra Lineal', 'Física']
    )
    ON CONFLICT (user_id) DO UPDATE SET
      headline = EXCLUDED.headline,
      bio = EXCLUDED.bio,
      hourly_rate = 45000,
      rating = 4.98,
      subjects = EXCLUDED.subjects;

    UPDATE public.tutor_profiles
    SET hourly_rate = ROUND(hourly_rate * 3500)
    WHERE hourly_rate IS NOT NULL AND hourly_rate < 1000;
  END IF;
END $$;
