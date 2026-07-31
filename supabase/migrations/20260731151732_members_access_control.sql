-- F1: `members_select_by_email` gave the anon role USING (true) over the whole member
--     register (names, national ids, emails, phones, password column).
-- F2: `members_update_own` gave the anon role UPDATE (true) over every column, and the
--     authenticated-role policies granted blanket read/update/delete to anyone who
--     obtained a token from the auth API.
-- Registration now goes through public.member_register(), so no anon INSERT is needed.

DROP POLICY IF EXISTS "members_select_by_email" ON public.members;
DROP POLICY IF EXISTS "members_select_admin"   ON public.members;
DROP POLICY IF EXISTS "members_update_own"     ON public.members;
DROP POLICY IF EXISTS "members_update_admin"   ON public.members;
DROP POLICY IF EXISTS "members_delete_admin"   ON public.members;
DROP POLICY IF EXISTS "members_insert_anon"    ON public.members;

CREATE POLICY "members_select_self_or_admin" ON public.members
  FOR SELECT TO anon, authenticated
  USING (id = public.current_member_id() OR public.is_admin());

CREATE POLICY "members_update_self_or_admin" ON public.members
  FOR UPDATE TO anon, authenticated
  USING (id = public.current_member_id() OR public.is_admin())
  WITH CHECK (id = public.current_member_id() OR public.is_admin());

CREATE POLICY "members_delete_admin_only" ON public.members
  FOR DELETE TO anon, authenticated
  USING (public.is_admin());

-- Row level rules are row level: a member allowed to edit their own row would
-- otherwise be allowed to edit the columns that carry privilege and identity.
CREATE OR REPLACE FUNCTION public.members_guard_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status          := 'pending';
    NEW.member_number   := NULL;   -- assigned by the numbering trigger
    RETURN NEW;
  END IF;

  NEW.status        := OLD.status;
  NEW.membership_type := OLD.membership_type;
  NEW.member_number := OLD.member_number;
  NEW.national_id   := OLD.national_id;
  NEW.created_at    := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a_members_guard_privileged_trg ON public.members;
CREATE TRIGGER a_members_guard_privileged_trg
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.members_guard_privileged_columns();
