-- Only require password changes for newly created users with a temporary password.
ALTER TABLE public.profiles
ALTER COLUMN password_changed SET DEFAULT true;

UPDATE public.profiles AS p
SET password_changed = true
FROM auth.users AS u
WHERE p.id = u.id
  AND COALESCE(p.password_changed, false) = false
  AND u.last_sign_in_at IS NOT NULL;
