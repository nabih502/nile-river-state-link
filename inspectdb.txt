ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS application_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS signature_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS consent_version text NOT NULL DEFAULT '2026-10-25',
  ADD COLUMN IF NOT EXISTS consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS fee_amount numeric(10,2) NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS fee_currency text NOT NULL DEFAULT 'SAR',
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'bank_transfer',
  ADD COLUMN IF NOT EXISTS payment_receipt_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_receipt_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS receipt_status text NOT NULL DEFAULT 'missing',
  ADD COLUMN IF NOT EXISTS receipt_review_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS application_submitted_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.members ADD CONSTRAINT members_receipt_status_check CHECK (receipt_status IN ('missing','pending','approved','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('membership-documents','membership-documents',false,5242880,ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "membership_documents_select" ON storage.objects;
DROP POLICY IF EXISTS "membership_documents_insert" ON storage.objects;
DROP POLICY IF EXISTS "membership_documents_delete" ON storage.objects;
CREATE POLICY "membership_documents_select" ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id='membership-documents' AND (public.is_admin() OR (storage.foldername(name))[1]=public.current_member_id()::text)
);
CREATE POLICY "membership_documents_insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (
  bucket_id='membership-documents' AND name ~* '\.(jpe?g|png|pdf)$' AND (public.is_admin() OR (storage.foldername(name))[1]=public.current_member_id()::text)
);
CREATE POLICY "membership_documents_delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id='membership-documents' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.members_guard_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF public.is_admin() THEN RETURN NEW; END IF;
  IF TG_OP='INSERT' THEN
    NEW.status:='pending'; NEW.member_number:=NULL; NEW.fee_amount:=50; NEW.fee_currency:='SAR'; NEW.payment_method:='bank_transfer';
    RETURN NEW;
  END IF;
  NEW.status:=OLD.status; NEW.membership_type:=OLD.membership_type; NEW.member_number:=OLD.member_number; NEW.national_id:=OLD.national_id; NEW.created_at:=OLD.created_at;
  NEW.application_data:=OLD.application_data; NEW.signature_name:=OLD.signature_name; NEW.consent_version:=OLD.consent_version; NEW.consented_at:=OLD.consented_at;
  NEW.fee_amount:=OLD.fee_amount; NEW.fee_currency:=OLD.fee_currency; NEW.payment_method:=OLD.payment_method; NEW.receipt_review_notes:=OLD.receipt_review_notes;
  IF NEW.receipt_status NOT IN ('pending') OR coalesce(NEW.payment_receipt_path,'')='' THEN NEW.receipt_status:=OLD.receipt_status; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_register(p jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  v_pw text; v_id uuid; v_token text; v_number text;
  v_email text:=lower(btrim(coalesce(p->>'email','')));
  v_national_id text:=btrim(coalesce(p->>'national_id',''));
  v_signature text:=btrim(coalesce(p->>'signature_name',''));
BEGIN
  IF coalesce(btrim(p->>'full_name'),'')='' THEN RAISE EXCEPTION 'MISSING_NAME'; END IF;
  IF v_email='' AND coalesce(btrim(p->>'phone'),'')='' THEN RAISE EXCEPTION 'MISSING_CONTACT'; END IF;
  IF v_national_id='' THEN RAISE EXCEPTION 'MISSING_NATIONAL_ID'; END IF;
  IF v_signature='' OR coalesce((p->>'consent_accepted')::boolean,false)=false THEN RAISE EXCEPTION 'MISSING_CONSENT'; END IF;
  v_pw:=upper(substr(encode(extensions.gen_random_bytes(8),'hex'),1,10));
  INSERT INTO public.members (
    full_name,national_id,email,phone,gender,birth_date,country,city,state,locality,marital_status,specialization,job_title,membership_type,status,password_hash,
    application_data,signature_name,consent_version,consented_at,fee_amount,fee_currency,payment_method,receipt_status
  ) VALUES (
    btrim(p->>'full_name'),v_national_id,v_email,coalesce(btrim(p->>'phone'),''),CASE WHEN p->>'gender'='female' THEN 'female' ELSE 'male' END,
    nullif(btrim(coalesce(p->>'birth_date','')),'')::date,coalesce(nullif(btrim(p->>'country'),''),'السودان'),coalesce(btrim(p->>'city'),''),coalesce(btrim(p->>'state'),''),coalesce(btrim(p->>'locality'),''),coalesce(btrim(p->>'marital_status'),''),coalesce(btrim(p->>'specialization'),''),coalesce(btrim(p->>'job_title'),''),
    'basic','pending',v_pw,coalesce(p->'application_data','{}'::jsonb),v_signature,'2026-10-25',now(),50,'SAR','bank_transfer','missing'
  ) RETURNING id,member_number INTO v_id,v_number;
  v_token:=encode(extensions.gen_random_bytes(32),'hex');
  INSERT INTO public.member_sessions(member_id,token,expires_at) VALUES(v_id,v_token,now()+interval '12 hours');
  RETURN jsonb_build_object('member_id',v_id,'token',v_token,'member_number',v_number,'initial_password',v_pw);
END;
$$;
GRANT EXECUTE ON FUNCTION public.member_register(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.member_submit_payment_receipt(p_path text,p_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_member uuid:=public.current_member_id();
BEGIN
  IF v_member IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED_MEMBER'; END IF;
  IF coalesce(btrim(p_path),'')='' OR split_part(p_path,'/',1)<>v_member::text THEN RAISE EXCEPTION 'INVALID_RECEIPT_PATH'; END IF;
  UPDATE public.members SET payment_receipt_path=p_path,payment_receipt_name=coalesce(p_name,''),receipt_status='pending',application_submitted_at=now() WHERE id=v_member;
  IF NOT FOUND THEN RAISE EXCEPTION 'MEMBER_NOT_FOUND'; END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.member_submit_payment_receipt(text,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_review_membership_application(p_member_id uuid,p_decision text,p_notes text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_sub uuid; v_receipt text; v_receipt_name text;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'INVALID_DECISION'; END IF;
  SELECT payment_receipt_path,payment_receipt_name INTO v_receipt,v_receipt_name FROM public.members WHERE id=p_member_id FOR UPDATE;
  IF coalesce(v_receipt,'')='' THEN RAISE EXCEPTION 'RECEIPT_REQUIRED'; END IF;
  IF p_decision='approved' THEN
    UPDATE public.members SET receipt_status='approved',receipt_review_notes=coalesce(p_notes,''),status='active' WHERE id=p_member_id;
    SELECT id INTO v_sub FROM public.member_subscriptions WHERE member_id=p_member_id AND subscription_type='annual' AND status='active' ORDER BY created_at DESC LIMIT 1;
    IF v_sub IS NULL THEN
      INSERT INTO public.member_subscriptions(member_id,subscription_type,start_date,end_date,amount,currency,status,notes)
      VALUES(p_member_id,'annual',current_date,current_date+interval '1 year',50,'SAR','active','تم إنشاؤه بعد اعتماد إيصال طلب العضوية') RETURNING id INTO v_sub;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.member_payments WHERE member_id=p_member_id AND reference_number=coalesce(v_receipt_name,v_receipt)) THEN
      INSERT INTO public.member_payments(member_id,subscription_id,amount,currency,payment_date,payment_method,reference_number,status,notes)
      VALUES(p_member_id,v_sub,50,'SAR',current_date,'bank_transfer',coalesce(v_receipt_name,v_receipt),'paid','تم اعتماد إيصال التحويل البنكي من طلب العضوية');
    END IF;
  ELSE
    UPDATE public.members SET receipt_status='rejected',receipt_review_notes=coalesce(p_notes,''),status='rejected' WHERE id=p_member_id;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_review_membership_application(uuid,text,text) TO anon, authenticated;
