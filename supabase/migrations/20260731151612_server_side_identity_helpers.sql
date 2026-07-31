-- F3/F4: the app uses no Supabase Auth, so every request arrives as `anon` and the
-- database had no way to tell an administrator or a member from an anonymous visitor.
-- Introduce real server-verified identity based on opaque session tokens sent as
-- request headers and validated inside the database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reads a request header forwarded by PostgREST. Not granted to anon/authenticated:
-- it is only used from the SECURITY DEFINER helpers below.
CREATE OR REPLACE FUNCTION public.request_header(p_name text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT nullif(current_setting('request.headers', true)::json ->> p_name, '')
$$;
REVOKE ALL ON FUNCTION public.request_header(text) FROM anon, authenticated;

-- Resolves the caller's admin session token to an admin user id.
CREATE OR REPLACE FUNCTION public.current_admin_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.user_id
    FROM public.admin_sessions s
    JOIN public.admin_users u ON u.id = s.user_id
   WHERE s.token = public.request_header('x-admin-token')
     AND s.expires_at > now()
     AND u.is_active = true
   LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.current_admin_id() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.current_admin_id() IS NOT NULL
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Member sessions: opaque tokens, never readable by the client.
CREATE TABLE IF NOT EXISTS public.member_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
ALTER TABLE public.member_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.member_sessions FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS member_sessions_member_idx ON public.member_sessions(member_id);

CREATE POLICY "member_sessions_service_only" ON public.member_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.current_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.member_id
    FROM public.member_sessions s
   WHERE s.token = public.request_header('x-member-token')
     AND s.expires_at > now()
   LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.current_member_id() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.current_visitor_token()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.request_header('x-visitor-token')
$$;
GRANT EXECUTE ON FUNCTION public.current_visitor_token() TO anon, authenticated;
