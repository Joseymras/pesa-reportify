-- Revoke direct execution from public (covers anon and authenticated defaults)
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM public;
REVOKE EXECUTE ON FUNCTION public.create_user_referral() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM public;

-- Ensure only service_role and postgres can execute internal helpers
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_user_referral() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO service_role;
