-- Set explicit search_path on generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- is_admin only reads admin_users, which is already readable by authenticated users,
-- so it can safely run as the invoker and avoid SECURITY DEFINER exposure warnings.
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = uid
  );
$$;

-- Revoke direct execution of internal helper/trigger functions from public API
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.create_user_referral() FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_user_referral() FROM authenticated;
