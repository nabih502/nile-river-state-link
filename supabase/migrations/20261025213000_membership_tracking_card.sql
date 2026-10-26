ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS application_number text,
  ADD COLUMN IF NOT EXISTS payment_account_currency text NOT NULL DEFAULT 'SAR',
  ADD COLUMN IF NOT EXISTS payment_account_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS membership_started_at date,
  ADD COLUMN IF NOT EXISTS membership_expires_at date;

CREATE SEQUENCE IF NOT EXISTS public.membership_application_number_seq;

DO $$
BEGIN
  UPDATE public.members
  SET application_number='APP-' || to_char(coalesce(application_submitted_at,created_at,now()),'YYYYMM') || '-' || lpad(nextval('public.membership_application_number_seq')::text,6,'0')
  WHERE application_number IS NULL OR btrim(application_number)='';
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_application_number ON public.members(application_number);

CREATE OR REPLACE FUNCTION public.assign_membership_application_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path=public,pg_temp
AS $$
BEGIN
  IF NEW.application_number IS NULL OR btrim(NEW.application_number)='' THEN
    NEW.application_number:='APP-' || to_char(now(),'YYYYMM') || '-' || lpad(nextval('public.membership_application_number_seq')::text,6,'0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS z_assign_membership_application_number ON public.members;
CREATE TRIGGER z_assign_membership_application_number
  BEFORE INSERT ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.assign_membership_application_number();

CREATE OR REPLACE FUNCTION public.members_tracking_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path=public,pg_temp
AS $$
BEGIN
  IF public.is_admin() OR current_user IN ('postgres','supabase_admin','service_role') THEN
    RETURN NEW;
  END IF;
  NEW.application_number:=OLD.application_number;
  NEW.payment_account_currency:=OLD.payment_account_currency;
  NEW.payment_account_number:=OLD.payment_account_number;
  NEW.membership_started_at:=OLD.membership_started_at;
  NEW.membership_expires_at:=OLD.membership_expires_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS a0_members_tracking_guard ON public.members;
CREATE TRIGGER a0_members_tracking_guard
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.members_tracking_guard();

CREATE OR REPLACE FUNCTION public.member_submit_payment_receipt(
  p_path text,
  p_name text,
  p_currency text,
  p_account_number text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE
  v_member uuid:=public.current_member_id();
  v_application_number text;
  v_expected_account text;
BEGIN
  IF v_member IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED_MEMBER'; END IF;
  IF coalesce(btrim(p_path),'')='' OR split_part(p_path,'/',1)<>v_member::text THEN RAISE EXCEPTION 'INVALID_RECEIPT_PATH'; END IF;
  IF p_currency NOT IN ('SAR','USD','SDG') THEN RAISE EXCEPTION 'INVALID_PAYMENT_CURRENCY'; END IF;
  v_expected_account:=CASE p_currency
    WHEN 'SAR' THEN '021117376310033040000'
    WHEN 'USD' THEN '021117376310023040000'
    WHEN 'SDG' THEN '1401139'
  END;
  IF coalesce(btrim(p_account_number),'')<>v_expected_account THEN RAISE EXCEPTION 'INVALID_BANK_ACCOUNT'; END IF;

  UPDATE public.members
  SET payment_receipt_path=p_path,
      payment_receipt_name=coalesce(p_name,''),
      receipt_status='pending',
      payment_method='bank_transfer',
      payment_account_currency=p_currency,
      payment_account_number=v_expected_account,
      application_submitted_at=now()
  WHERE id=v_member
  RETURNING application_number INTO v_application_number;

  IF NOT FOUND THEN RAISE EXCEPTION 'MEMBER_NOT_FOUND'; END IF;
  RETURN jsonb_build_object('application_number',v_application_number,'status','pending','receipt_status','pending');
END;
$$;

REVOKE ALL ON FUNCTION public.member_submit_payment_receipt(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.member_submit_payment_receipt(text,text,text,text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.sync_member_subscription_validity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
BEGIN
  IF NEW.status='active' THEN
    UPDATE public.members
    SET membership_started_at=NEW.start_date,
        membership_expires_at=NEW.end_date
    WHERE id=NEW.member_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_member_subscription_validity_trg ON public.member_subscriptions;
CREATE TRIGGER sync_member_subscription_validity_trg
  AFTER INSERT OR UPDATE OF start_date,end_date,status ON public.member_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_member_subscription_validity();

WITH latest AS (
  SELECT DISTINCT ON (member_id) member_id,start_date,end_date
  FROM public.member_subscriptions
  WHERE status='active'
  ORDER BY member_id,created_at DESC
)
UPDATE public.members m
SET membership_started_at=latest.start_date,
    membership_expires_at=latest.end_date
FROM latest
WHERE latest.member_id=m.id AND m.status='active';

CREATE OR REPLACE FUNCTION public.membership_application_status(p_application_number text,p_contact text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE
  v_member public.members%ROWTYPE;
  v_start date;
  v_end date;
  v_contact text:=btrim(coalesce(p_contact,''));
  v_digits text:=regexp_replace(btrim(coalesce(p_contact,'')),'[^0-9]','','g');
  v_expired boolean:=false;
BEGIN
  IF btrim(coalesce(p_application_number,''))='' OR v_contact='' THEN
    RETURN jsonb_build_object('found',false);
  END IF;

  SELECT * INTO v_member
  FROM public.members
  WHERE (upper(application_number)=upper(btrim(p_application_number)) OR upper(coalesce(member_number,''))=upper(btrim(p_application_number)))
    AND (
      lower(email)=lower(v_contact)
      OR (v_digits<>'' AND regexp_replace(phone,'[^0-9]','','g')=v_digits)
    )
  LIMIT 1;

  IF NOT FOUND THEN RETURN jsonb_build_object('found',false); END IF;

  SELECT start_date,end_date INTO v_start,v_end
  FROM public.member_subscriptions
  WHERE member_id=v_member.id AND status IN ('active','expired')
  ORDER BY created_at DESC
  LIMIT 1;

  v_start:=coalesce(v_start,v_member.membership_started_at);
  v_end:=coalesce(v_end,v_member.membership_expires_at);
  v_expired:=v_end IS NOT NULL AND v_end<current_date;

  RETURN jsonb_build_object(
    'found',true,
    'application_number',v_member.application_number,
    'status',v_member.status,
    'receipt_status',v_member.receipt_status,
    'full_name',CASE WHEN v_member.status='active' THEN v_member.full_name ELSE '' END,
    'member_number',CASE WHEN v_member.status='active' THEN v_member.member_number ELSE '' END,
    'photo_url',CASE WHEN v_member.status='active' THEN v_member.photo_url ELSE '' END,
    'membership_type',CASE WHEN v_member.status='active' THEN v_member.membership_type ELSE '' END,
    'start_date',CASE WHEN v_member.status='active' THEN v_start ELSE NULL END,
    'end_date',CASE WHEN v_member.status='active' THEN v_end ELSE NULL END,
    'is_expired',v_expired,
    'renewal_required',v_expired,
    'review_notes',CASE WHEN v_member.status='rejected' OR v_member.receipt_status='rejected' THEN v_member.receipt_review_notes ELSE '' END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.membership_application_status(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.membership_application_status(text,text) TO anon,authenticated;
