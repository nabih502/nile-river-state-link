/*
# Visitor Chat System + Chatbot FAQ

## New Tables

### visitor_conversations
One thread per site visitor. Tracks visitor identity (name, phone), conversation
status, unread counts, and whether a human agent is engaged.

Status flow: bot → waiting → human → closed
- bot:     only the chatbot is responding
- waiting: visitor requested a human; admin not yet responded
- human:   admin is actively chatting
- closed:  conversation ended

### visitor_messages
Individual messages inside a visitor conversation.
sender_type: "visitor" | "bot" | "admin"

### chatbot_faqs
Bot answer library, fully editable from the admin panel.
- keywords: comma-separated Arabic keywords to match against visitor message
- question: example question shown in admin for reference
- answer:   the response the bot will send
- is_default: marks the fallback message when no keyword matches
- sort_order + published: control what's active

## Security
All tables use TO anon, authenticated policies (no sign-in required for visitors).

## Realtime
visitor_messages and visitor_conversations added to supabase_realtime publication.
*/

-- ── visitor_conversations ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitor_conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name   TEXT NOT NULL DEFAULT '',
  visitor_phone  TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'bot' CHECK (status IN ('bot','waiting','human','closed')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  admin_unread   INT NOT NULL DEFAULT 0,
  visitor_unread INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vis_conv_status   ON visitor_conversations(status);
CREATE INDEX IF NOT EXISTS idx_vis_conv_last_msg ON visitor_conversations(last_message_at DESC);

ALTER TABLE visitor_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vis_conv_select" ON visitor_conversations;
CREATE POLICY "vis_conv_select" ON visitor_conversations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vis_conv_insert" ON visitor_conversations;
CREATE POLICY "vis_conv_insert" ON visitor_conversations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vis_conv_update" ON visitor_conversations;
CREATE POLICY "vis_conv_update" ON visitor_conversations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vis_conv_delete" ON visitor_conversations;
CREATE POLICY "vis_conv_delete" ON visitor_conversations
  FOR DELETE TO anon, authenticated USING (true);


-- ── visitor_messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitor_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES visitor_conversations(id) ON DELETE CASCADE,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('visitor','bot','admin')),
  sender_name     TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL DEFAULT '',
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vis_msg_conv ON visitor_messages(conversation_id, created_at);

ALTER TABLE visitor_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vis_msg_select" ON visitor_messages;
CREATE POLICY "vis_msg_select" ON visitor_messages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vis_msg_insert" ON visitor_messages;
CREATE POLICY "vis_msg_insert" ON visitor_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vis_msg_update" ON visitor_messages;
CREATE POLICY "vis_msg_update" ON visitor_messages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vis_msg_delete" ON visitor_messages;
CREATE POLICY "vis_msg_delete" ON visitor_messages
  FOR DELETE TO anon, authenticated USING (true);


-- ── chatbot_faqs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL DEFAULT '',
  keywords    TEXT NOT NULL DEFAULT '',
  answer      TEXT NOT NULL DEFAULT '',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  published   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chatbot_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faq_select" ON chatbot_faqs;
CREATE POLICY "faq_select" ON chatbot_faqs
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "faq_insert" ON chatbot_faqs;
CREATE POLICY "faq_insert" ON chatbot_faqs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "faq_update" ON chatbot_faqs;
CREATE POLICY "faq_update" ON chatbot_faqs
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "faq_delete" ON chatbot_faqs;
CREATE POLICY "faq_delete" ON chatbot_faqs
  FOR DELETE TO anon, authenticated USING (true);


-- ── Realtime ───────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE visitor_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE visitor_conversations;


-- ── Seed default chatbot FAQs ──────────────────────────────────────────────────
INSERT INTO chatbot_faqs (question, keywords, answer, sort_order, published) VALUES
(
  'كيف أشترك في الرابطة؟',
  'عضوية,اشتراك,تسجيل,انضمام,عضو,اشترك,انضم',
  'يمكنك التسجيل في الرابطة من خلال صفحة العضوية على موقعنا. اضغط على رابط "العضوية" في القائمة الرئيسية واتبع خطوات التسجيل البسيطة. للمزيد من المساعدة تواصل معنا على info@nilenile.org',
  1, true
),
(
  'ما هي خدمات الرابطة؟',
  'خدمات,ماذا تقدم,ما هي,برامج,أنشطة',
  'تقدم رابطة ولاية نهر النيل خدمات متنوعة تشمل: التعليم والتدريب، الرعاية الصحية، الخدمات الاجتماعية، دعم الاستثمار، والنشاط الثقافي. يمكنك الاطلاع على كافة الخدمات من خلال صفحة "الخدمات" في الموقع.',
  2, true
),
(
  'كيف يمكنني الاستثمار من خلال الرابطة؟',
  'استثمار,مشروع,فرصة,أعمال,تجارة,استثمر',
  'تتيح الرابطة فرصاً استثمارية متعددة في ولاية نهر النيل في قطاعات الزراعة والصناعة والسياحة والطاقة. زر صفحة الاستثمار لعرض الفرص المتاحة أو أرسل استفساراً مباشراً من نموذج التواصل.',
  3, true
),
(
  'كيف أتواصل مع الرابطة؟',
  'تواصل,اتصال,هاتف,بريد,عنوان,مكتب',
  'يمكنك التواصل معنا عبر:\n- الهاتف: 249 912 345 678+\n- البريد الإلكتروني: info@nilenile.org\n- أو من خلال نموذج التواصل في صفحة "تواصل معنا"',
  4, true
),
(
  'ما هي الأنشطة الثقافية للرابطة؟',
  'ثقافة,فنون,موسيقى,أدب,شعر,فعالية,نشاط,مهرجان',
  'تهتم الرابطة بالإرث الثقافي لولاية نهر النيل من خلال فعاليات الفنون والأدب والشعر والموسيقى الشعبية، وتنظيم المعارض والملتقيات. زر صفحة الثقافة لعرض كل الفعاليات والمبادرات.',
  5, true
),
(
  'ما هي الخدمات الصحية المتاحة؟',
  'صحة,طبيب,علاج,مستشفى,دواء,تأمين,صحي',
  'توفر الرابطة خدمات صحية تشمل العيادات الطبية، الاستشارات الصحية، الصيدلية، والتأمين الصحي لأعضائها. للتفاصيل زر صفحة الصحة أو اتصل بنا مباشرة.',
  6, true
),
(
  'ما هي خدمات التعليم؟',
  'تعليم,دراسة,كورس,دورة,تدريب,مدرسة,جامعة,منحة',
  'تقدم الرابطة برامج تعليمية وتدريبية متنوعة تشمل الدورات المهنية، دعم الطلاب، والشراكات مع المؤسسات التعليمية. زر صفحة التعليم أو مركز التدريب للاطلاع على البرامج المتاحة.',
  7, true
),
(
  'ما هي الخدمات الاجتماعية؟',
  'اجتماعي,مساعدة,دعم,أسرة,أيتام,محتاج,مبادرة',
  'تقدم الرابطة خدمات اجتماعية شاملة تشمل دعم الأسر المحتاجة، مساعدة الأيتام، برامج الإغاثة، والمبادرات المجتمعية. لطلب مساعدة اجتماعية زر صفحة الخدمات الاجتماعية.',
  8, true
);

-- Default fallback message (is_default = true)
INSERT INTO chatbot_faqs (question, keywords, answer, is_default, sort_order, published) VALUES
(
  'رسالة العجز الافتراضية',
  '',
  'شكراً لتواصلك معنا! لم أتمكن من فهم استفسارك بشكل كافٍ. يمكنك التحدث مع أحد موظفي الدعم للحصول على مساعدة أفضل.',
  true, 99, true
);
