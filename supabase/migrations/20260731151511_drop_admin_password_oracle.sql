-- F6: remove the SECURITY DEFINER admin credential oracle callable by anon/authenticated.
-- The real admin login path is the `admin-auth` edge function (service role + bcrypt),
-- and no application code calls this function.
DROP FUNCTION IF EXISTS public.verify_admin_password(text, text);
