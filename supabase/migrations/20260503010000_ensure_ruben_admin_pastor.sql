-- Ensure Ruben Bitumba always has the ADMIN and PASTOR roles.
DO $$
DECLARE
  v_email CONSTANT TEXT := 'rubenbitumba@embchurch.com';
  v_full_name CONSTANT TEXT := 'Ruben Bitumba';
  v_roles CONSTANT TEXT[] := ARRAY['ADMIN', 'PASTOR'];
  v_user_id UUID;
BEGIN
  SELECT id
  INTO v_user_id
  FROM auth.users
  WHERE lower(email) = v_email
  LIMIT 1;

  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{full_name}',
          to_jsonb(v_full_name),
          true
        ),
        '{roles}',
        to_jsonb(v_roles),
        true
      ),
      raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{roles}',
        to_jsonb(v_roles),
        true
      )
  WHERE lower(email) = v_email;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, email, roles)
    VALUES (v_user_id, v_full_name, v_email, v_roles)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        roles = EXCLUDED.roles;
  ELSE
    UPDATE public.profiles
    SET full_name = v_full_name,
        email = v_email,
        roles = v_roles
    WHERE lower(email) = v_email;
  END IF;
END $$;
