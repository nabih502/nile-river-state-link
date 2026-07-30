/*
# إضافة جداول الاشتراكات والمدفوعات للأعضاء

## ملخص
يضيف هذا الـ migration جدولين جديدين لإدارة اشتراكات الأعضاء ومدفوعاتهم:

## الجداول الجديدة

### 1. `member_subscriptions` — اشتراكات الأعضاء
- id: معرف فريد
- member_id: مرتبط بجدول members
- subscription_type: نوع الاشتراك (annual/monthly/lifetime)
- start_date: تاريخ البداية
- end_date: تاريخ الانتهاء (قابل للفراغ لـ lifetime)
- amount: المبلغ
- currency: العملة (SDG افتراضي)
- status: الحالة (active/expired/cancelled)
- notes: ملاحظات

### 2. `member_payments` — سجل مدفوعات الأعضاء
- id: معرف فريد
- member_id: مرتبط بجدول members
- subscription_id: مرتبط باشتراك (اختياري)
- amount: المبلغ المدفوع
- currency: العملة
- payment_date: تاريخ الدفع
- payment_method: طريقة الدفع (cash/bank_transfer/online)
- reference_number: رقم المرجع/الإيصال
- status: الحالة (paid/pending/failed/refunded)
- notes: ملاحظات

## الصلاحيات
- RLS مفعّل على كلا الجدولين
- سياسات مفتوحة للـ anon و authenticated (التطبيق بدون تسجيل دخول Supabase)
*/

CREATE TABLE IF NOT EXISTS member_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subscription_type text NOT NULL DEFAULT 'annual',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  amount numeric(10,2) DEFAULT 0,
  currency text NOT NULL DEFAULT 'SDG',
  status text NOT NULL DEFAULT 'active',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_subscriptions_member_id ON member_subscriptions(member_id);

ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_member_subscriptions" ON member_subscriptions;
CREATE POLICY "anon_select_member_subscriptions" ON member_subscriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_member_subscriptions" ON member_subscriptions;
CREATE POLICY "anon_insert_member_subscriptions" ON member_subscriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_member_subscriptions" ON member_subscriptions;
CREATE POLICY "anon_update_member_subscriptions" ON member_subscriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_member_subscriptions" ON member_subscriptions;
CREATE POLICY "anon_delete_member_subscriptions" ON member_subscriptions FOR DELETE
  TO anon, authenticated USING (true);

-- ── Payments ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS member_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES member_subscriptions(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SDG',
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'cash',
  reference_number text DEFAULT '',
  status text NOT NULL DEFAULT 'paid',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_payments_member_id ON member_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_member_payments_subscription_id ON member_payments(subscription_id);

ALTER TABLE member_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_member_payments" ON member_payments;
CREATE POLICY "anon_select_member_payments" ON member_payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_member_payments" ON member_payments;
CREATE POLICY "anon_insert_member_payments" ON member_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_member_payments" ON member_payments;
CREATE POLICY "anon_update_member_payments" ON member_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_member_payments" ON member_payments;
CREATE POLICY "anon_delete_member_payments" ON member_payments FOR DELETE
  TO anon, authenticated USING (true);
