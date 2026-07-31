-- F3/F28: member passwords were stored and compared in clear text, and the only
-- strength rule lived in the browser. Hash everything at rest with bcrypt and enforce
-- a minimum length in the database so the rule cannot be skipped by calling the API
-- directly.

UPDATE public.members
   SET password_hash = crypt(password_hash, gen_salt('bf'))
 WHERE password_hash IS NOT NULL
   AND password_hash <> ''
   AND password_hash NOT LIKE '$2%';

CREATE OR REPLACE FUNCTION public.members_hash_password()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.password_hash IS NULL OR NEW.password_hash = '' THEN
    RETURN NEW;
  END IF;
  -- already a bcrypt digest (set by a trusted path) -> leave alone
  IF NEW.password_hash LIKE '$2%' AND length(NEW.password_hash) >= 55 THEN
    RETURN NEW;
  END IF;
  IF length(NEW.password_hash) < 8 THEN
    RAISE EXCEPTION 'WEAK_PASSWORD';
  END IF;
  NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS members_hash_password_trg ON public.members;
CREATE TRIGGER members_hash_password_trg
  BEFORE INSERT OR UPDATE OF password_hash ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.members_hash_password();
