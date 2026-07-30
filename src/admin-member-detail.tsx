import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Member {
  id: string; full_name: string; email: string; phone: string;
  national_id: string; gender: string; birth_date: string | null;
  state: string; city: string; locality: string; country: string;
  marital_status: string; specialization: string; job_title: string;
  photo_url: string; membership_type: string; member_number: string;
  status: string; created_at: string;
}
interface Subscription {
  id: string; member_id: string; subscription_type: string;
  start_date: string; end_date: string | null; amount: number;
  currency: string; status: string; notes: string; created_at: string;
}
interface Payment {
  id: string; member_id: string; subscription_id: string | null;
  amount: number; currency: string; payment_date: string;
  payment_method: string; reference_number: string; status: string;
  notes: string; created_at: string;
}

// ── Label maps ────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "معلق",   color: "#92400e", bg: "#fef3c7" },
  active:   { label: "نشط",    color: "#065f46", bg: "#d1fae5" },
  rejected: { label: "مرفوض", color: "#991b1b", bg: "#fee2e2" },
};
const TYPE_MAP: Record<string, { label: string; color: string }> = {
  basic:     { label: "أساسية",  color: "#1e40af" },
  premium:   { label: "مميزة",   color: "#6d28d9" },
  supporter: { label: "داعمة",   color: "#b45309" },
};
const SUB_TYPE: Record<string, string> = {
  annual: "سنوي", monthly: "شهري", lifetime: "مدى الحياة",
};
const PAY_METHOD: Record<string, string> = {
  cash: "نقداً", bank_transfer: "تحويل بنكي", online: "دفع إلكتروني",
};
const PAY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  paid:     { label: "مدفوع",   color: "#065f46", bg: "#d1fae5" },
  pending:  { label: "معلق",    color: "#92400e", bg: "#fef3c7" },
  failed:   { label: "فشل",     color: "#991b1b", bg: "#fee2e2" },
  refunded: { label: "مسترجع",  color: "#3730a3", bg: "#e0e7ff" },
};
const SUB_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "نشط",    color: "#065f46", bg: "#d1fae5" },
  expired:   { label: "منتهي",  color: "#92400e", bg: "#fef3c7" },
  cancelled: { label: "ملغي",   color: "#991b1b", bg: "#fee2e2" },
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function Confirm({ msg, onOk, onCancel }: { msg: string; onOk: () => void; onCancel: () => void }) {
  return (
    <div className="adm-overlay" style={{ zIndex: 600 }}>
      <div className="adm-confirm">
        <p>{msg}</p>
        <div>
          <button className="adm-btn-danger" onClick={onOk}>تأكيد الحذف</button>
          <button onClick={onCancel}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ── Subscription Form ─────────────────────────────────────────────────────────
function SubForm({ memberId, item, onSave, onCancel }: {
  memberId: string; item: Subscription | null; onSave: () => void; onCancel: () => void;
}) {
  const def = { subscription_type: "annual", start_date: new Date().toISOString().slice(0, 10), end_date: "", amount: "0", currency: "SDG", status: "active", notes: "" };
  const [f, setF] = useState(item ? { ...item, end_date: item.end_date ?? "", amount: String(item.amount) } : def);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("");
    const payload = { member_id: memberId, subscription_type: f.subscription_type, start_date: f.start_date, end_date: f.end_date || null, amount: Number(f.amount), currency: f.currency, status: f.status, notes: f.notes };
    const { error } = item?.id
      ? await supabase.from("member_subscriptions").update(payload).eq("id", item.id)
      : await supabase.from("member_subscriptions").insert(payload);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
  };

  return (
    <div className="detail-form-box">
      <h4 className="detail-form-title">{item ? "تعديل اشتراك" : "إضافة اشتراك جديد"}</h4>
      <form onSubmit={save}>
        <div className="detail-form-grid">
          <label className="detail-label">نوع الاشتراك
            <select value={f.subscription_type} onChange={e => set("subscription_type", e.target.value)} className="detail-input">
              <option value="annual">سنوي</option>
              <option value="monthly">شهري</option>
              <option value="lifetime">مدى الحياة</option>
            </select>
          </label>
          <label className="detail-label">الحالة
            <select value={f.status} onChange={e => set("status", e.target.value)} className="detail-input">
              <option value="active">نشط</option>
              <option value="expired">منتهي</option>
              <option value="cancelled">ملغي</option>
            </select>
          </label>
          <label className="detail-label">تاريخ البداية
            <input type="date" value={f.start_date} onChange={e => set("start_date", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label">تاريخ الانتهاء
            <input type="date" value={f.end_date} onChange={e => set("end_date", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label">المبلغ
            <input type="number" min={0} value={f.amount} onChange={e => set("amount", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label">العملة
            <input value={f.currency} onChange={e => set("currency", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label" style={{ gridColumn: "1 / -1" }}>ملاحظات
            <textarea value={f.notes} onChange={e => set("notes", e.target.value)} rows={2} className="detail-input" style={{ resize: "vertical" }} />
          </label>
        </div>
        {err && <p className="detail-err">{err}</p>}
        <div className="detail-form-actions">
          <button type="button" onClick={onCancel} className="detail-btn-cancel">إلغاء</button>
          <button type="submit" disabled={saving} className="detail-btn-save">{saving ? "جاري الحفظ..." : "حفظ"}</button>
        </div>
      </form>
    </div>
  );
}

// ── Payment Form ──────────────────────────────────────────────────────────────
function PayForm({ memberId, subs, item, onSave, onCancel }: {
  memberId: string; subs: Subscription[]; item: Payment | null; onSave: () => void; onCancel: () => void;
}) {
  const def = { amount: "0", currency: "SDG", payment_date: new Date().toISOString().slice(0, 10), payment_method: "cash", reference_number: "", status: "paid", subscription_id: "", notes: "" };
  const [f, setF] = useState(item ? { ...item, amount: String(item.amount), subscription_id: item.subscription_id ?? "" } : def);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("");
    const payload = { member_id: memberId, subscription_id: f.subscription_id || null, amount: Number(f.amount), currency: f.currency, payment_date: f.payment_date, payment_method: f.payment_method, reference_number: f.reference_number, status: f.status, notes: f.notes };
    const { error } = item?.id
      ? await supabase.from("member_payments").update(payload).eq("id", item.id)
      : await supabase.from("member_payments").insert(payload);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
  };

  return (
    <div className="detail-form-box">
      <h4 className="detail-form-title">{item ? "تعديل دفعة" : "تسجيل دفعة جديدة"}</h4>
      <form onSubmit={save}>
        <div className="detail-form-grid">
          <label className="detail-label">المبلغ *
            <input required type="number" min={0} step="0.01" value={f.amount} onChange={e => set("amount", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label">العملة
            <input value={f.currency} onChange={e => set("currency", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label">تاريخ الدفع
            <input type="date" value={f.payment_date} onChange={e => set("payment_date", e.target.value)} className="detail-input" dir="ltr" />
          </label>
          <label className="detail-label">طريقة الدفع
            <select value={f.payment_method} onChange={e => set("payment_method", e.target.value)} className="detail-input">
              <option value="cash">نقداً</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="online">دفع إلكتروني</option>
            </select>
          </label>
          <label className="detail-label">الحالة
            <select value={f.status} onChange={e => set("status", e.target.value)} className="detail-input">
              <option value="paid">مدفوع</option>
              <option value="pending">معلق</option>
              <option value="failed">فشل</option>
              <option value="refunded">مسترجع</option>
            </select>
          </label>
          <label className="detail-label">رقم الإيصال
            <input value={f.reference_number} onChange={e => set("reference_number", e.target.value)} className="detail-input" dir="ltr" placeholder="اختياري" />
          </label>
          {subs.length > 0 && (
            <label className="detail-label">مرتبط باشتراك
              <select value={f.subscription_id} onChange={e => set("subscription_id", e.target.value)} className="detail-input">
                <option value="">— غير مرتبط —</option>
                {subs.map(s => <option key={s.id} value={s.id}>{SUB_TYPE[s.subscription_type] || s.subscription_type} — {fmt(s.start_date)}</option>)}
              </select>
            </label>
          )}
          <label className="detail-label" style={{ gridColumn: "1 / -1" }}>ملاحظات
            <textarea value={f.notes} onChange={e => set("notes", e.target.value)} rows={2} className="detail-input" style={{ resize: "vertical" }} />
          </label>
        </div>
        {err && <p className="detail-err">{err}</p>}
        <div className="detail-form-actions">
          <button type="button" onClick={onCancel} className="detail-btn-cancel">إلغاء</button>
          <button type="submit" disabled={saving} className="detail-btn-save">{saving ? "جاري الحفظ..." : "حفظ"}</button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminMemberDetail({ memberId, onBack }: { memberId: string; onBack?: () => void }) {
  const [member, setMember] = useState<Member | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"personal" | "subs" | "payments">("personal");

  // personal form state
  const [form, setForm] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // sub / pay form
  const [addSub, setAddSub] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [addPay, setAddPay] = useState(false);
  const [editPay, setEditPay] = useState<Payment | null>(null);
  const [delConfirm, setDelConfirm] = useState<{ table: string; id: string } | null>(null);

  const loadMember = async () => {
    const { data } = await supabase.from("members").select("*").eq("id", memberId).maybeSingle();
    if (data) { setMember(data as Member); setForm(data as Member); }
    setLoading(false);
  };
  const loadSubs = async () => {
    const { data } = await supabase.from("member_subscriptions").select("*").eq("member_id", memberId).order("start_date", { ascending: false });
    setSubs((data ?? []) as Subscription[]);
  };
  const loadPayments = async () => {
    const { data } = await supabase.from("member_payments").select("*").eq("member_id", memberId).order("payment_date", { ascending: false });
    setPayments((data ?? []) as Payment[]);
  };

  useEffect(() => { loadMember(); loadSubs(); loadPayments(); }, [memberId]);

  const setF = (k: keyof Member, v: string) => setForm(p => p ? { ...p, [k]: v } : p);

  const savePersonal = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg("");
    const { data, error } = await supabase.from("members").update({
      full_name: form!.full_name, email: form!.email, phone: form!.phone,
      national_id: form!.national_id, gender: form!.gender, birth_date: form!.birth_date || null,
      state: form!.state, city: form!.city, locality: form!.locality, country: form!.country,
      marital_status: form!.marital_status, specialization: form!.specialization,
      job_title: form!.job_title, membership_type: form!.membership_type,
      status: form!.status, member_number: form!.member_number, photo_url: form!.photo_url,
    }).eq("id", memberId).select().maybeSingle();
    setSaving(false);
    if (error) { setSaveMsg("خطأ: " + error.message); return; }
    if (data) { setMember(data as Member); setForm(data as Member); }
    setSaveMsg("تم حفظ البيانات بنجاح");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const deleteRow = async () => {
    if (!delConfirm) return;
    await supabase.from(delConfirm.table as "member_subscriptions" | "member_payments").delete().eq("id", delConfirm.id);
    setDelConfirm(null);
    loadSubs(); loadPayments();
  };

  const goBack = () => {
    if (onBack) { onBack(); return; }
    window.history.back();
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
      <div className="portal-spinner" />
    </div>
  );

  if (!member || !form) return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <p style={{ color: "#94a3b8" }}>لم يتم العثور على هذا العضو</p>
      <button onClick={goBack} className="adm-btn-primary" style={{ marginTop: "1rem" }}>العودة للقائمة</button>
    </div>
  );

  const st = STATUS_MAP[member.status] ?? STATUS_MAP.pending;
  const tp = TYPE_MAP[member.membership_type] ?? TYPE_MAP.basic;
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const activeSubs = subs.filter(s => s.status === "active").length;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <button onClick={goBack} className="detail-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            العودة لقائمة الأعضاء
          </button>
        </div>
        {/* ── Hero Card ── */}
        <div className="detail-hero-card">
          <div className="detail-hero-avatar">
            {member.photo_url
              ? <img src={member.photo_url} alt={member.full_name} />
              : <span>{member.full_name.trim()[0] || "؟"}</span>}
          </div>
          <div className="detail-hero-info">
            <h1 className="detail-hero-name">{member.full_name}</h1>
            <div className="detail-hero-meta">
              <span dir="ltr" className="detail-hero-num">{member.member_number || "—"}</span>
              <span className="detail-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
              <span className="detail-badge" style={{ color: tp.color, background: "#f5f3ff" }}>{tp.label}</span>
            </div>
            <div className="detail-hero-sub">
              {member.email && <span dir="ltr">{member.email}</span>}
              {member.phone && <span dir="ltr">{member.phone}</span>}
              {member.country && <span>{member.country}{member.state ? " · " + member.state : ""}</span>}
            </div>
          </div>
          {/* summary stats */}
          <div className="detail-hero-stats">
            <div className="detail-hstat">
              <span className="detail-hstat-val">{activeSubs}</span>
              <span className="detail-hstat-lbl">اشتراكات نشطة</span>
            </div>
            <div className="detail-hstat">
              <span className="detail-hstat-val" style={{ color: "#16a34a" }}>{totalPaid.toLocaleString()}</span>
              <span className="detail-hstat-lbl">إجمالي المدفوعات (ج.س)</span>
            </div>
            <div className="detail-hstat">
              <span className="detail-hstat-val">{fmt(member.created_at)}</span>
              <span className="detail-hstat-lbl">تاريخ التسجيل</span>
            </div>
          </div>
        </div>

        {/* ── Tab Nav ── */}
        <div className="detail-tabs">
          {([
            ["personal", "البيانات الشخصية"],
            ["subs", `الاشتراكات (${subs.length})`],
            ["payments", `المدفوعات (${payments.length})`],
          ] as const).map(([k, lbl]) => (
            <button key={k} className={`detail-tab-btn ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{lbl}</button>
          ))}
        </div>

        {/* ── Personal Tab ── */}
        {tab === "personal" && (
          <div className="detail-section">
            <form onSubmit={savePersonal}>
              {/* Admin controls */}
              <div className="detail-card">
                <h3 className="detail-card-title">إعدادات العضوية</h3>
                <div className="detail-grid-3">
                  <label className="detail-label">رقم العضوية
                    <input value={form.member_number || ""} onChange={e => setF("member_number", e.target.value)} className="detail-input" dir="ltr" />
                  </label>
                  <label className="detail-label">نوع العضوية
                    <select value={form.membership_type} onChange={e => setF("membership_type", e.target.value)} className="detail-input">
                      <option value="basic">أساسية</option>
                      <option value="premium">مميزة</option>
                      <option value="supporter">داعمة</option>
                    </select>
                  </label>
                  <label className="detail-label">الحالة
                    <select value={form.status} onChange={e => setF("status", e.target.value)} className="detail-input">
                      <option value="pending">معلق</option>
                      <option value="active">نشط</option>
                      <option value="rejected">مرفوض</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Personal info */}
              <div className="detail-card">
                <h3 className="detail-card-title">البيانات الشخصية</h3>
                <div className="detail-grid-2">
                  <label className="detail-label">الاسم الكامل *
                    <input required value={form.full_name} onChange={e => setF("full_name", e.target.value)} className="detail-input" />
                  </label>
                  <label className="detail-label">رقم الهوية الوطنية
                    <input value={form.national_id || ""} onChange={e => setF("national_id", e.target.value)} className="detail-input" dir="ltr" />
                  </label>
                  <label className="detail-label">البريد الإلكتروني
                    <input type="email" value={form.email || ""} onChange={e => setF("email", e.target.value)} className="detail-input" dir="ltr" />
                  </label>
                  <label className="detail-label">رقم الجوال
                    <input value={form.phone || ""} onChange={e => setF("phone", e.target.value)} className="detail-input" dir="ltr" />
                  </label>
                  <label className="detail-label">الجنس
                    <select value={form.gender || "male"} onChange={e => setF("gender", e.target.value)} className="detail-input">
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </label>
                  <label className="detail-label">تاريخ الميلاد
                    <input type="date" value={(form.birth_date || "").slice(0, 10)} onChange={e => setF("birth_date", e.target.value)} className="detail-input" dir="ltr" />
                  </label>
                  <label className="detail-label">الحالة الاجتماعية
                    <select value={form.marital_status || ""} onChange={e => setF("marital_status", e.target.value)} className="detail-input">
                      {["أعزب", "متزوج", "مطلق", "أرمل"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </label>
                  <label className="detail-label">التخصص
                    <input value={form.specialization || ""} onChange={e => setF("specialization", e.target.value)} className="detail-input" />
                  </label>
                  <label className="detail-label" style={{ gridColumn: "1 / -1" }}>المسمى الوظيفي
                    <input value={form.job_title || ""} onChange={e => setF("job_title", e.target.value)} className="detail-input" />
                  </label>
                </div>
              </div>

              {/* Location */}
              <div className="detail-card">
                <h3 className="detail-card-title">العنوان</h3>
                <div className="detail-grid-2">
                  <label className="detail-label">الدولة
                    <input value={form.country || ""} onChange={e => setF("country", e.target.value)} className="detail-input" />
                  </label>
                  <label className="detail-label">الولاية
                    <input value={form.state || ""} onChange={e => setF("state", e.target.value)} className="detail-input" />
                  </label>
                  <label className="detail-label">المدينة
                    <input value={form.city || ""} onChange={e => setF("city", e.target.value)} className="detail-input" />
                  </label>
                  <label className="detail-label">المحلية
                    <input value={form.locality || ""} onChange={e => setF("locality", e.target.value)} className="detail-input" />
                  </label>
                </div>
              </div>

              {/* Photo */}
              <div className="detail-card">
                <h3 className="detail-card-title">الصورة الشخصية</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  {form.photo_url && (
                    <img src={form.photo_url} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} />
                  )}
                  <label className="detail-label" style={{ flex: 1, minWidth: 240 }}>رابط الصورة
                    <input value={form.photo_url || ""} onChange={e => setF("photo_url", e.target.value)} className="detail-input" dir="ltr" placeholder="https://..." />
                  </label>
                </div>
              </div>

              {/* Save bar */}
              <div className="detail-save-bar">
                {saveMsg && (
                  <span className={saveMsg.startsWith("خطأ") ? "detail-err" : "detail-ok"}>{saveMsg}</span>
                )}
                <button type="submit" disabled={saving} className="detail-btn-save" style={{ padding: "0.65rem 2rem", fontSize: "0.95rem" }}>
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Subscriptions Tab ── */}
        {tab === "subs" && (
          <div className="detail-section">
            <div className="detail-section-head">
              <h2 className="detail-section-title">الاشتراكات</h2>
              {!addSub && !editSub && (
                <button onClick={() => setAddSub(true)} className="detail-btn-save">+ إضافة اشتراك</button>
              )}
            </div>
            {(addSub || editSub) && (
              <SubForm
                memberId={memberId}
                item={editSub}
                onSave={() => { setAddSub(false); setEditSub(null); loadSubs(); }}
                onCancel={() => { setAddSub(false); setEditSub(null); }}
              />
            )}
            {subs.length === 0 && !addSub ? (
              <div className="detail-empty">لا توجد اشتراكات مسجلة لهذا العضو</div>
            ) : (
              <div className="detail-list">
                {subs.map(s => {
                  const ss = SUB_STATUS[s.status] ?? { label: s.status, color: "#64748b", bg: "#f1f5f9" };
                  return (
                    <div key={s.id} className="detail-list-item">
                      <div className="detail-list-item-main">
                        <div className="detail-list-item-row">
                          <span className="detail-list-item-title">{SUB_TYPE[s.subscription_type] || s.subscription_type}</span>
                          <span className="detail-badge" style={{ color: ss.color, background: ss.bg }}>{ss.label}</span>
                          {Number(s.amount) > 0 && (
                            <span className="detail-list-item-amount">{Number(s.amount).toLocaleString()} {s.currency}</span>
                          )}
                        </div>
                        <div className="detail-list-item-meta">
                          <span>من {fmt(s.start_date)}</span>
                          {s.end_date ? <span>إلى {fmt(s.end_date)}</span> : <span style={{ color: "#16a34a" }}>مفتوح</span>}
                        </div>
                        {s.notes && <p className="detail-list-item-notes">{s.notes}</p>}
                      </div>
                      <div className="detail-list-item-actions">
                        <button className="adm-btn-edit" onClick={() => { setEditSub(s); setAddSub(false); }}>تعديل</button>
                        <button className="adm-btn-danger" onClick={() => setDelConfirm({ table: "member_subscriptions", id: s.id })}>حذف</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Payments Tab ── */}
        {tab === "payments" && (
          <div className="detail-section">
            <div className="detail-section-head">
              <div>
                <h2 className="detail-section-title">المدفوعات</h2>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  إجمالي المدفوعات: <strong style={{ color: "#16a34a" }}>{totalPaid.toLocaleString()} ج.س</strong>
                </p>
              </div>
              {!addPay && !editPay && (
                <button onClick={() => setAddPay(true)} className="detail-btn-save">+ تسجيل دفعة</button>
              )}
            </div>
            {(addPay || editPay) && (
              <PayForm
                memberId={memberId}
                subs={subs}
                item={editPay}
                onSave={() => { setAddPay(false); setEditPay(null); loadPayments(); }}
                onCancel={() => { setAddPay(false); setEditPay(null); }}
              />
            )}
            {payments.length === 0 && !addPay ? (
              <div className="detail-empty">لا توجد مدفوعات مسجلة لهذا العضو</div>
            ) : (
              <div className="detail-list">
                {payments.map(p => {
                  const ps = PAY_STATUS[p.status] ?? { label: p.status, color: "#64748b", bg: "#f1f5f9" };
                  return (
                    <div key={p.id} className="detail-list-item">
                      <div className="detail-list-item-main">
                        <div className="detail-list-item-row">
                          <span className="detail-list-item-amount" style={{ fontSize: "1.1rem" }}>
                            {Number(p.amount).toLocaleString()} {p.currency}
                          </span>
                          <span className="detail-badge" style={{ color: ps.color, background: ps.bg }}>{ps.label}</span>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{PAY_METHOD[p.payment_method] || p.payment_method}</span>
                        </div>
                        <div className="detail-list-item-meta">
                          <span>{fmt(p.payment_date)}</span>
                          {p.reference_number && <span dir="ltr">#{p.reference_number}</span>}
                        </div>
                        {p.notes && <p className="detail-list-item-notes">{p.notes}</p>}
                      </div>
                      <div className="detail-list-item-actions">
                        <button className="adm-btn-edit" onClick={() => { setEditPay(p); setAddPay(false); }}>تعديل</button>
                        <button className="adm-btn-danger" onClick={() => setDelConfirm({ table: "member_payments", id: p.id })}>حذف</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {delConfirm && (
        <Confirm
          msg="هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذه العملية."
          onOk={deleteRow}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </>
  );
}
