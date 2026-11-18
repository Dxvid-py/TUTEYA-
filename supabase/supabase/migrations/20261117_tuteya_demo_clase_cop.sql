-- ============================================================================
-- TUTEYA COLOMBIA: Perfiles Demo + Precios en COP + Clase Virtual Confirmada
-- Ejecutar en Supabase -> SQL Editor
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET search_path = public, extensions;

DO $$
DECLARE
  v_student_id uuid := '11111111-1111-1111-1111-111111111111';
  v_tutor_id   uuid := '22222222-2222-2222-2222-222222222222';
  v_pass_hash  text := crypt('TuteyaDemo2026!', gen_salt('bf'));
BEGIN
  -- 1. Usuario ESTUDIANTE DEMO
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
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
    now(), now(), '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
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
    now(), now(), now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- 2. Usuario PROFESOR DEMO
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
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
    now(), now(), '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
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
    now(), now(), now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- 3. Perfiles públicos y fotos verificadas
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
    WHERE avatar_url IS NULL
       OR avatar_url = ''
       OR avatar_url LIKE '%unsplash.com/photos/%';
  END IF;

  -- 4. Roles de usuario
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    DELETE FROM public.user_roles WHERE user_id IN (v_student_id, v_tutor_id);
    INSERT INTO public.user_roles (user_id, role)
    VALUES
      (v_student_id, 'student'),
      (v_tutor_id, 'tutor');
  END IF;

  -- 5. Perfil docente en COP ($ 45.000 COP)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tutor_profiles'
  ) THEN
    IF EXISTS (SELECT 1 FROM public.tutor_profiles WHERE user_id = v_tutor_id) THEN
      UPDATE public.tutor_profiles
      SET
        headline = 'Ingeniero Electrónico · Cálculo, Álgebra Lineal y Física',
        bio = 'Profesor verificado en Tuteya Colombia con 6 años de experiencia preparando estudiantes universitarios.',
        hourly_rate = 45000,
        is_approved = true
      WHERE user_id = v_tutor_id;
    ELSE
      INSERT INTO public.tutor_profiles (
        user_id, headline, bio, experience_years, hourly_rate, modality, levels, city, is_approved
      )
      VALUES (
        v_tutor_id,
        'Ingeniero Electrónico · Cálculo, Álgebra Lineal y Física',
        'Profesor verificado en Tuteya Colombia con 6 años de experiencia preparando estudiantes universitarios.',
        6,
        45000,
        'virtual',
        ARRAY['Bachillerato', 'Universitario'],
        'Barranquilla',
        true
      );
    END IF;

    UPDATE public.tutor_profiles
    SET hourly_rate = ROUND(hourly_rate * 3500)
    WHERE hourly_rate IS NOT NULL AND hourly_rate < 1000;
  END IF;

  -- 6. Asegurar columna meeting_url en bookings y crear clase demo confirmada en COP
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bookings'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'meeting_url'
    ) THEN
      ALTER TABLE public.bookings ADD COLUMN meeting_url text;
    END IF;

    DELETE FROM public.bookings
    WHERE id = '99999999-9999-9999-9999-999999999999';

    INSERT INTO public.bookings (
      id,
      student_id,
      tutor_id,
      subject,
      scheduled_at,
      duration_minutes,
      total_price,
      status,
      meeting_url
    )
    VALUES (
      '99999999-9999-9999-9999-999999999999',
      v_student_id,
      v_tutor_id,
      'Cálculo Diferencial · Clase Demo en Vivo',
      now() + interval '15 minutes',
      60,
      45000,
      'confirmed',
      'https://meet.jit.si/Tuteya-Clase-Demo-Calculo-2026'
    );
  END IF;
END $$;
