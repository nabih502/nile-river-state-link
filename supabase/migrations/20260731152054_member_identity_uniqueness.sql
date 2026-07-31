-- F25: nothing stopped a second registration re-using a victim's email address or
-- national id, which makes the login lookup ambiguous and lets an attacker squat on
-- someone else's identity. Blank values stay exempt because historic rows use ''.
CREATE UNIQUE INDEX IF NOT EXISTS members_email_lower_uniq
  ON public.members (lower(btrim(email)))
  WHERE btrim(email) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS members_national_id_uniq
  ON public.members (btrim(national_id))
  WHERE btrim(national_id) <> '';
