-- Expose a minimal pastor list for scheduling without granting broad profile reads.
CREATE OR REPLACE FUNCTION public.get_schedulable_pastors()
RETURNS TABLE (
  id UUID,
  full_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name
  FROM public.profiles AS p
  WHERE
    (public.has_role('ADMIN') OR public.has_role('SECRETARY') OR public.has_role('PASTOR'))
    AND 'PASTOR' = ANY(COALESCE(p.roles, ARRAY[]::TEXT[]))
  ORDER BY p.full_name ASC;
$$;

REVOKE ALL ON FUNCTION public.get_schedulable_pastors() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_schedulable_pastors() TO authenticated;
