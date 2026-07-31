-- F7/F8/F9/F10: subscriptions, payments, service requests and event registrations
-- all had SELECT/INSERT/UPDATE/DELETE policies for the anon role with USING (true),
-- so anyone could read every member's financial standing and forge or delete records.
-- Money and status columns are operator-owned; members may only read their own rows
-- and create their own requests.

-- ── F7 subscriptions ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_member_subscriptions" ON public.member_subscriptions;
DROP POLICY IF EXISTS "anon_insert_member_subscriptions" ON public.member_subscriptions;
DROP POLICY IF EXISTS "anon_update_member_subscriptions" ON public.member_subscriptions;
DROP POLICY IF EXISTS "anon_delete_member_subscriptions" ON public.member_subscriptions;

CREATE POLICY "subscriptions_select_own_or_admin" ON public.member_subscriptions
  FOR SELECT TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());
CREATE POLICY "subscriptions_insert_admin" ON public.member_subscriptions
  FOR INSERT TO anon, authenticated WITH CHECK (public.is_admin());
CREATE POLICY "subscriptions_update_admin" ON public.member_subscriptions
  FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "subscriptions_delete_admin" ON public.member_subscriptions
  FOR DELETE TO anon, authenticated USING (public.is_admin());

-- ── F8 payments ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_member_payments" ON public.member_payments;
DROP POLICY IF EXISTS "anon_insert_member_payments" ON public.member_payments;
DROP POLICY IF EXISTS "anon_update_member_payments" ON public.member_payments;
DROP POLICY IF EXISTS "anon_delete_member_payments" ON public.member_payments;

CREATE POLICY "payments_select_own_or_admin" ON public.member_payments
  FOR SELECT TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());
CREATE POLICY "payments_insert_admin" ON public.member_payments
  FOR INSERT TO anon, authenticated WITH CHECK (public.is_admin());
CREATE POLICY "payments_update_admin" ON public.member_payments
  FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payments_delete_admin" ON public.member_payments
  FOR DELETE TO anon, authenticated USING (public.is_admin());

-- ── F9 service requests ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_member_service_requests" ON public.member_service_requests;
DROP POLICY IF EXISTS "anon_insert_member_service_requests" ON public.member_service_requests;
DROP POLICY IF EXISTS "anon_update_member_service_requests" ON public.member_service_requests;
DROP POLICY IF EXISTS "anon_delete_member_service_requests" ON public.member_service_requests;

CREATE POLICY "service_requests_select_own_or_admin" ON public.member_service_requests
  FOR SELECT TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());
CREATE POLICY "service_requests_insert_own" ON public.member_service_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.is_admin()
    OR (member_id = public.current_member_id() AND coalesce(status, 'pending') = 'pending')
  );
CREATE POLICY "service_requests_update_admin" ON public.member_service_requests
  FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "service_requests_delete_admin" ON public.member_service_requests
  FOR DELETE TO anon, authenticated USING (public.is_admin());

-- ── F10 event registrations ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_member_event_registrations" ON public.member_event_registrations;
DROP POLICY IF EXISTS "anon_insert_member_event_registrations" ON public.member_event_registrations;
DROP POLICY IF EXISTS "anon_update_member_event_registrations" ON public.member_event_registrations;
DROP POLICY IF EXISTS "anon_delete_member_event_registrations" ON public.member_event_registrations;

CREATE POLICY "event_registrations_select_own_or_admin" ON public.member_event_registrations
  FOR SELECT TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());
CREATE POLICY "event_registrations_insert_own" ON public.member_event_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_admin() OR member_id = public.current_member_id());
CREATE POLICY "event_registrations_update_admin" ON public.member_event_registrations
  FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "event_registrations_delete_own_or_admin" ON public.member_event_registrations
  FOR DELETE TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());
