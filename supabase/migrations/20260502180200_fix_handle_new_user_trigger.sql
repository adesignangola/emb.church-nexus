-- Fix handle_new_user trigger to handle roles array properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_roles TEXT[];
BEGIN
  -- Extract roles from user metadata
  IF NEW.raw_user_meta_data ? 'roles' THEN
    v_roles := (SELECT array_agg(val)::TEXT[] FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') val);
  ELSE
    v_roles := '{"MEMBER"}';
  END IF;
  
  INSERT INTO public.profiles (id, full_name, email, roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    v_roles
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Still return NEW to not block user creation even if profile insert fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
