-- F4/F5/F22/F23: move member registration and login into the database.
-- Login was previously decided in the browser (password compared in JS) with the
-- member id alone acting as the session, the lookup filter was built by string
-- interpolation from user input, the initial password was derived from the member's
-- own phone number, and the two failure branches told the caller whether an account
-- existed.

CREATE OR REPLACE FUNCTION public.member_register(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pw     text;
  v_id     uuid;
  v_token  text;
  v_number text;
  v_email  text := lower(btrim(coalesce(p ->> 'email', '')));
  v_type   text := coalesce(nullif(btrim(p ->> 'membership_type'), ''), 'basic');
BEGIN
  IF coalesce(btrim(p ->> 'full_name'), '') = '' THEN
    RAISE EXCEPTION 'MISSING_NAME';
  END IF;
  IF v_email = '' AND coalesce(btrim(p ->> 'phone'), '') = '' THEN
    RAISE EXCEPTION 'MISSING_CONTACT';
  END IF;

  -- random initial credential, returned once to the registering browser
  v_pw := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10));

  INSERT INTO public.members (
    full_name, national_id, email, phone, gender, birth_date,
    country, city, state, locality, marital_status, specialization, job_title,
    membership_type, status, password_hash
  ) VALUES (
    btrim(p ->> 'full_name'),
    coalesce(btrim(p ->> 'national_id'), ''),
    v_email,
    coalesce(btrim(p ->> 'phone'), ''),
    CASE WHEN (p ->> 'gender') = 'female' THEN 'female' ELSE 'male' END,
    nullif(btrim(coalesce(p ->> 'birth_date', '')), '')::date,
    coalesce(nullif(btrim(p ->> 'country'), ''), 'السودان'),
    coalesce(btrim(p ->> 'city'), ''),
    coalesce(btrim(p ->> 'state'), ''),
    coalesce(btrim(p ->> 'locality'), ''),
    coalesce(btrim(p ->> 'marital_status'), ''),
    coalesce(btrim(p ->> 'specialization'), ''),
    coalesce(btrim(p ->> 'job_title'), ''),
    v_type,
    'pending',           -- never taken from the request
    v_pw
  )
  RETURNING id, member_number INTO v_id, v_number;

  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO public.member_sessions (member_id, token, expires_at)
  VALUES (v_id, v_token, now() + interval '12 hours');

  RETURN jsonb_build_object(
    'member_id', v_id, 'token', v_token,
    'member_number', v_number, 'initial_password', v_pw
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.member_register(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.member_login(p_identifier text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id     uuid;
  v_hash   text;
  v_token  text;
  v_ident  text := btrim(coalesce(p_identifier, ''));
BEGIN
  SELECT id, password_hash INTO v_id, v_hash
    FROM public.members
   WHERE (v_ident <> '' AND lower(email) = lower(v_ident))
      OR (v_ident <> '' AND phone = v_ident)
      OR (v_ident <> '' AND member_number = v_ident)
   ORDER BY created_at
   LIMIT 1;

  -- one indistinguishable failure for "no such account" and "wrong password"
  IF v_id IS NULL
     OR coalesce(v_hash, '') = ''
     OR coalesce(p_password, '') = ''
     OR v_hash <> crypt(p_password, v_hash) THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS';
  END IF;

  DELETE FROM public.member_sessions WHERE expires_at < now();

  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO public.member_sessions (member_id, token, expires_at)
  VALUES (v_id, v_token, now() + interval '12 hours');

  RETURN jsonb_build_object('member_id', v_id, 'token', v_token);
END;
$$;
GRANT EXECUTE ON FUNCTION public.member_login(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.member_logout()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  DELETE FROM public.member_sessions
   WHERE token = public.request_header('x-member-token')
$$;
GRANT EXECUTE ON FUNCTION public.member_logout() TO anon, authenticated;
