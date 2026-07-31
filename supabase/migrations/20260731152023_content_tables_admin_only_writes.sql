-- F15/F16/F17/F18/F19/F31: every content table either granted the anon role
-- INSERT/UPDATE/DELETE with WITH CHECK (true) — so any visitor could deface the site,
-- rewrite the chatbot's answers or wipe the galleries — or granted the same to the
-- `authenticated` role, which this application never uses and which any outsider can
-- obtain from the auth API. All writes now require a verified administrator session.
-- Public read access is left exactly as it was so the website keeps working.

DO $$
DECLARE
  t text;
  p record;
  tables text[] := ARRAY[
    -- social programme content (F16)
    'social_initiatives','social_services','social_stats','social_values',
    -- galleries (F17)
    'gallery','gallery_items','content_gallery',
    -- chatbot answers (F18)
    'chatbot_faqs',
    -- pages and search listings (F19)
    'pages','page_seo',
    -- culture, news, investment and contact content (F31)
    'culture_artists','culture_associations','culture_art_categories','culture_contests',
    'culture_events','culture_initiatives','culture_media','culture_news',
    'news','events',
    'investment_sectors','investment_opportunities','investment_incentives',
    'investment_partners','investment_stats','investment_success_stories',
    'contact_settings','contact_info_items','contact_faq_items',
    'site_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- drop every existing write policy
    FOR p IN
      SELECT policyname FROM pg_policies
       WHERE schemaname = 'public' AND tablename = t AND cmd <> 'SELECT'
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (public.is_admin())',
      t || '_insert_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      t || '_update_admin', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO anon, authenticated USING (public.is_admin())',
      t || '_delete_admin', t);

    -- keep public read as-is, but let administrators also see unpublished drafts
    FOR p IN
      SELECT policyname, qual FROM pg_policies
       WHERE schemaname = 'public' AND tablename = t AND cmd = 'SELECT'
         AND qual = '(published = true)'
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin())',
        t || '_select_public', t);
    END LOOP;
  END LOOP;
END $$;

-- F15: investor leads were readable, editable and deletable by anyone. Keep the public
-- enquiry form open, restrict everything else to administrators.
DROP POLICY IF EXISTS "auth_select_inquiries" ON public.investment_inquiries;
DROP POLICY IF EXISTS "auth_update_inquiries" ON public.investment_inquiries;
DROP POLICY IF EXISTS "auth_delete_inquiries" ON public.investment_inquiries;
DROP POLICY IF EXISTS "anon_insert_inquiries" ON public.investment_inquiries;

CREATE POLICY "inquiries_insert_public" ON public.investment_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "inquiries_select_admin" ON public.investment_inquiries
  FOR SELECT TO anon, authenticated USING (public.is_admin());
CREATE POLICY "inquiries_update_admin" ON public.investment_inquiries
  FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "inquiries_delete_admin" ON public.investment_inquiries
  FOR DELETE TO anon, authenticated USING (public.is_admin());

-- F31: the contact inbox was readable by any `authenticated` account and unreachable by
-- the admin panel (which runs as anon). Keep the public form open; reads are admin-only.
DROP POLICY IF EXISTS "contact_select_admin" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_update_admin" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_delete_admin" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_insert_anon"  ON public.contact_messages;

CREATE POLICY "contact_insert_public" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_select_admin_only" ON public.contact_messages
  FOR SELECT TO anon, authenticated USING (public.is_admin());
CREATE POLICY "contact_update_admin_only" ON public.contact_messages
  FOR UPDATE TO anon, authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "contact_delete_admin_only" ON public.contact_messages
  FOR DELETE TO anon, authenticated USING (public.is_admin());
