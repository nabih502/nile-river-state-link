-- The auth helpers pin search_path to public/pg_temp for safety, but pgcrypto lives in
-- the extensions schema, so crypt/gen_salt/gen_random_bytes must be schema-qualified.

CREATE OR REPLACE FUNCTION public.members_hash_password()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.password_hash IS NULL OR NEW.password_hash = '' THEN
    RETURN NEW;
  END IF;
  IF NEW.password_hash LIKE '$2%' AND length(NEW.password_hash) >= 55 THEN
    RETURN NEW;
  END IF;
  IF length(NEW.password_hash) < 8 THEN
    RAISE EXCEPTION 'WEAK_PASSWORD';
  END IF;
  NEW.password_hash := extensions.crypt(NEW.password_hash, extensions.gen_salt('bf'));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_login(p_identifier text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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

  IF v_id IS NULL
     OR coalesce(v_hash, '') = ''
     OR coalesce(p_password, '') = ''
     OR v_hash <> extensions.crypt(p_password, v_hash) THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS';
  END IF;

  DELETE FROM public.member_sessions WHERE expires_at < now();

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  INSERT INTO public.member_sessions (member_id, token, expires_at)
  VALUES (v_id, v_token, now() + interval '12 hours');

  RETURN jsonb_build_object('member_id', v_id, 'token', v_token);
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_register(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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

  v_pw := upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 10));

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
    'pending',
    v_pw
  )
  RETURNING id, member_number INTO v_id, v_number;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  INSERT INTO public.member_sessions (member_id, token, expires_at)
  VALUES (v_id, v_token, now() + interval '12 hours');

  RETURN jsonb_build_object(
    'member_id', v_id, 'token', v_token,
    'member_number', v_number, 'initial_password', v_pw
  );
END;
$function$;
