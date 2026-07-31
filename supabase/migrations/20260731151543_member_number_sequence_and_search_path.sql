-- F26: membership numbers were derived from COUNT(*)+1 against a UNIQUE column,
-- so two concurrent registrations produced the same number and one failed.
-- F29: pin the search_path of the trigger function.
CREATE SEQUENCE IF NOT EXISTS public.member_number_seq;

DO $$
DECLARE max_n bigint;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(member_number, '^.*-', ''), '')::bigint), 0)
    INTO max_n FROM public.members WHERE member_number ~ '[0-9]+$';
  PERFORM setval('public.member_number_seq', GREATEST(max_n, 1));
END $$;

CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.member_number IS NULL OR NEW.member_number = '' THEN
    NEW.member_number := 'NRN-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.member_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;
