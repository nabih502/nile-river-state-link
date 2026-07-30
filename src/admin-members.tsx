import React, { useEffect, useState } from "react";
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
interface Filters {
  search: string; status: string; type: string;
  country: string; gender: string; from: string; to: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "معلق",   color: "#92400e", bg: "#fef3c7" },
  active:   { label: "نشط",    color: "#065f46", bg: "#d1fae5" },
  rejected: { label: "مرفوض", color: "#991b1b", bg: "#fee2e2" },
};
const TYPE_LABELS: Record<string, string> = {
  basic: "أساسية", premium: "مميزة", supporter: "داعمة",
};
const SUB_TYPE_LABELS: Record<string, string> = {
  annual: "سنوي", monthly: "شهري", lifetime: "مدى الحياة",
};
const PAY_METHOD_LABELS: Record<string, string> = {
  cash: "نقداً", bank_transfer: "تحويل بنكي", online: "دفع إلكتروني",
};
const PAY_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:     { label: "مدفوع",  color: "#16a34a" },
  pending:  { label: "معلق",   color: "#d97706" },
  failed:   { label: "فشل",    color: "#dc2626" },
  refunded: { label: "مسترجع", color: "#6366f1" },
};
const SUB_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: "نشط",     color: "#16a34a" },
  expired:   { label: "منتهي",   color: "#d97706" },
  cancelled: { label: "ملغي",    color: "#dc2626" },
};

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV(members: Member[]) {
  const headers = ["رقم العضوية","الاسم","البريد","الجوال","رقم الهوية","الجنس","الدولة","الولاية","المدينة","نوع العضوية","الحالة","تاريخ التسجيل"];
  const rows = members.map(m => [
    m.member_number || "", m.full_name, m.email || "", m.phone || "",
    m.national_id || "", m.gender === "female" ? "أنثى" : "ذكر",
    m.country || "", m.state || "", m.city || "",
    TYPE_LABELS[m.membership_type] || m.membership_type,
    STATUS_LABELS[m.status]?.label || m.status, fmt(m.created_at),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `members-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange, countries, onExport, total }: {
  filters: Filters; onChange: (f: Filters) => void;
  countries: string[]; onExport: () => void; total: number;
}) {
  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v });
  const sel: React.CSSProperties = { padding: "0.45rem 0.7rem", borderRadius: "0.45rem", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.83rem", fontFamily: "inherit", color: "#1e293b", cursor: "pointer" };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center", padding: "1rem 1.25rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
      <input value={filters.search} onChange={e => set("search", e.target.value)} placeholder="بحث بالاسم / البريد / الجوال / رقم العضوية..." style={{ ...sel, flex: "1 1 220px", minWidth: 180 }} />
      <select value={filters.status} onChange={e => set("status", e.target.value)} style={sel}>
        <option value="">كل الحالات</option>
        <option value="active">نشط</option>
        <option value="pending">معلق</option>
        <option value="rejected">مرفوض</option>
      </select>
      <select value={filters.type} onChange={e => set("type", e.target.value)} style={sel}>
        <option value="">كل الأنواع</option>
        <option value="basic">أساسية</option>
        <option value="premium">مميزة</option>
        <option value="supporter">داعمة</option>
      </select>
      <select value={filters.gender} onChange={e => set("gender", e.target.value)} style={sel}>
        <option value="">الجنسان</option>
        <option value="male">ذكر</option>
        <option value="female">أنثى</option>
      </select>
      <select value={filters.country} onChange={e => set("country", e.target.value)} style={{ ...sel, maxWidth: 140 }}>
        <option value="">كل الدول</option>
        {countries.map(c => <option key={c}>{c}</option>)}
      </select>
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>من</span>
        <input type="date" value={filters.from} onChange={e => set("from", e.target.value)} style={{ ...sel, width: 130 }} dir="ltr" />
        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>إلى</span>
        <input type="date" value={filters.to} onChange={e => set("to", e.target.value)} style={{ ...sel, width: 130 }} dir="ltr" />
      </div>
      <button onClick={() => onChange({ search: "", status: "", type: "", country: "", gender: "", from: "", to: "" })}
        style={{ ...sel, background: "transparent", color: "#64748b", border: "1px dashed #cbd5e1" }}>مسح الفلاتر</button>
      <button onClick={onExport} style={{ padding: "0.45rem 1rem", borderRadius: "0.45rem", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.83rem", fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        تصدير CSV ({total})
      </button>
    </div>
  );
}

// ── Stats Row ─────────────────────────────────────────────────────────────────
function StatsRow({ members }: { members: Member[] }) {
  const total = members.length;
  const active = members.filter(m => m.status === "active").length;
  const pending = members.filter(m => m.status === "pending").length;
  const rejected = members.filter(m => m.status === "rejected").length;
  const premium = members.filter(m => m.membership_type === "premium").length;
  const cards = [
    { label: "إجمالي الأعضاء", value: total, color: "#2563eb", bg: "#eff6ff" },
    { label: "نشط", value: active, color: "#16a34a", bg: "#f0fdf4" },
    { label: "معلق", value: pending, color: "#d97706", bg: "#fffbeb" },
    { label: "مرفوض", value: rejected, color: "#dc2626", bg: "#fef2f2" },
    { label: "عضوية مميزة", value: premium, color: "#7c3aed", bg: "#f5f3ff" },
  ];
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0" }}>
      {cards.map(c => (
        <div key={c.label} style={{ flex: "1 1 100px", minWidth: 90, background: c.bg, borderRadius: "0.6rem", padding: "0.7rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</span>
          <span style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center" }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Subscription Form ─────────────────────────────────────────────────────────
function SubscriptionForm({ memberId, item, onSave, onCancel }: {
  memberId: string; item: Partial<Subscription> | null; onSave: () => void; onCancel: () => void;
}) {
  const blank = { subscription_type: "annual", start_date: new Date().toISOString().slice(0,10), end_date: "", amount: 0, currency: "SDG", status: "active", notes: "" };
  const [form, setForm] = useState({ ...blank, ...(item ?? {}) });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("");
    const payload = { member_id: memberId, subscription_type: form.subscription_type, start_date: form.start_date, end_date: form.end_date || null, amount: Number(form.amount), currency: form.currency, status: form.status, notes: form.notes };
    const { error } = (item as any)?.id
      ? await supabase.from("member_subscriptions").update(payload).eq("id", (item as any).id)
      : await supabase.from("member_subscriptions").insert(payload);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
  };

  const inp: React.CSSProperties = { padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #e2e8f0", fontSize: "0.83rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };
  return (
    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.6rem", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>نوع الاشتراك
          <select value={form.subscription_type} onChange={e => set("subscription_type", e.target.value)} style={inp}>
            <option value="annual">سنوي</option><option value="monthly">شهري</option><option value="lifetime">مدى الحياة</option>
          </select>
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الحالة
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inp}>
            <option value="active">نشط</option><option value="expired">منتهي</option><option value="cancelled">ملغي</option>
          </select>
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>تاريخ البداية
          <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} style={inp} dir="ltr" />
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>تاريخ الانتهاء
          <input type="date" value={form.end_date || ""} onChange={e => set("end_date", e.target.value)} style={inp} dir="ltr" />
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>المبلغ
          <input type="number" min={0} value={form.amount} onChange={e => set("amount", e.target.value)} style={inp} dir="ltr" />
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>العملة
          <input value={form.currency} onChange={e => set("currency", e.target.value)} style={inp} dir="ltr" />
        </label>
      </div>
      <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>ملاحظات
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
      </label>
      {err && <p style={{ color: "#dc2626", fontSize: "0.78rem", margin: 0 }}>{err}</p>}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.4rem", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>إلغاء</button>
        <button type="submit" disabled={saving} style={{ padding: "0.4rem 1rem", borderRadius: "0.4rem", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>{saving ? "..." : "حفظ"}</button>
      </div>
    </form>
  );
}

// ── Payment Form ──────────────────────────────────────────────────────────────
function PaymentForm({ memberId, subscriptions, item, onSave, onCancel }: {
  memberId: string; subscriptions: Subscription[]; item: Partial<Payment> | null; onSave: () => void; onCancel: () => void;
}) {
  const blank = { amount: 0, currency: "SDG", payment_date: new Date().toISOString().slice(0,10), payment_method: "cash", reference_number: "", status: "paid", subscription_id: "", notes: "" };
  const [form, setForm] = useState({ ...blank, ...(item ?? {}) });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("");
    const payload = { member_id: memberId, subscription_id: form.subscription_id || null, amount: Number(form.amount), currency: form.currency, payment_date: form.payment_date, payment_method: form.payment_method, reference_number: form.reference_number, status: form.status, notes: form.notes };
    const { error } = (item as any)?.id
      ? await supabase.from("member_payments").update(payload).eq("id", (item as any).id)
      : await supabase.from("member_payments").insert(payload);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSave();
  };

  const inp: React.CSSProperties = { padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #e2e8f0", fontSize: "0.83rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };
  return (
    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.6rem", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>المبلغ *
          <input required type="number" min={0} step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} style={inp} dir="ltr" />
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>العملة
          <input value={form.currency} onChange={e => set("currency", e.target.value)} style={inp} dir="ltr" />
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>تاريخ الدفع
          <input type="date" value={form.payment_date} onChange={e => set("payment_date", e.target.value)} style={inp} dir="ltr" />
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>طريقة الدفع
          <select value={form.payment_method} onChange={e => set("payment_method", e.target.value)} style={inp}>
            <option value="cash">نقداً</option><option value="bank_transfer">تحويل بنكي</option><option value="online">دفع إلكتروني</option>
          </select>
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الحالة
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inp}>
            <option value="paid">مدفوع</option><option value="pending">معلق</option><option value="failed">فشل</option><option value="refunded">مسترجع</option>
          </select>
        </label>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>رقم الإيصال / المرجع
          <input value={form.reference_number} onChange={e => set("reference_number", e.target.value)} style={inp} dir="ltr" placeholder="اختياري" />
        </label>
      </div>
      {subscriptions.length > 0 && (
        <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>مرتبط باشتراك
          <select value={form.subscription_id || ""} onChange={e => set("subscription_id", e.target.value)} style={inp}>
            <option value="">غير مرتبط</option>
            {subscriptions.map(s => <option key={s.id} value={s.id}>{SUB_TYPE_LABELS[s.subscription_type] || s.subscription_type} — {fmt(s.start_date)}</option>)}
          </select>
        </label>
      )}
      <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>ملاحظات
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
      </label>
      {err && <p style={{ color: "#dc2626", fontSize: "0.78rem", margin: 0 }}>{err}</p>}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.4rem", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>إلغاء</button>
        <button type="submit" disabled={saving} style={{ padding: "0.4rem 1rem", borderRadius: "0.4rem", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>{saving ? "..." : "حفظ"}</button>
      </div>
    </form>
  );
}

// ── Member Profile Drawer ─────────────────────────────────────────────────────
function MemberDrawer({ member, onClose, onUpdated }: {
  member: Member; onClose: () => void; onUpdated: (m: Member) => void;
}) {
  const [tab, setTab] = useState<"personal" | "subs" | "payments">("personal");
  const [form, setForm] = useState({ ...member });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [addSub, setAddSub] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [addPay, setAddPay] = useState(false);
  const [editPay, setEditPay] = useState<Payment | null>(null);
  const [delConfirm, setDelConfirm] = useState<{ table: string; id: string } | null>(null);

  const loadSubs = async () => {
    const { data } = await supabase.from("member_subscriptions").select("*").eq("member_id", member.id).order("created_at", { ascending: false });
    setSubs((data ?? []) as Subscription[]);
  };
  const loadPayments = async () => {
    const { data } = await supabase.from("member_payments").select("*").eq("member_id", member.id).order("payment_date", { ascending: false });
    setPayments((data ?? []) as Payment[]);
  };

  useEffect(() => { loadSubs(); loadPayments(); }, [member.id]);

  const setF = (k: keyof Member, v: string) => setForm(f => ({ ...f, [k]: v }));

  const savePersonal = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg("");
    const payload: Partial<Member> = {
      full_name: form.full_name, email: form.email, phone: form.phone,
      national_id: form.national_id, gender: form.gender, birth_date: form.birth_date,
      state: form.state, city: form.city, locality: form.locality, country: form.country,
      marital_status: form.marital_status, specialization: form.specialization,
      job_title: form.job_title, membership_type: form.membership_type, status: form.status,
      member_number: form.member_number, photo_url: form.photo_url,
    };
    const { data, error } = await supabase.from("members").update(payload).eq("id", member.id).select().maybeSingle();
    setSaving(false);
    if (error) { setSaveMsg("خطأ: " + error.message); return; }
    if (data) { onUpdated(data as Member); }
    setSaveMsg("تم الحفظ بنجاح"); setTimeout(() => setSaveMsg(""), 3000);
  };

  const deleteRow = async () => {
    if (!delConfirm) return;
    await supabase.from(delConfirm.table as "member_subscriptions" | "member_payments").delete().eq("id", delConfirm.id);
    setDelConfirm(null);
    loadSubs(); loadPayments();
  };

  const st = STATUS_LABELS[member.status] ?? STATUS_LABELS.pending;
  const inp: React.CSSProperties = { padding: "0.45rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #e2e8f0", fontSize: "0.83rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
  const tabBtn = (k: typeof tab, label: string) => (
    <button type="button" onClick={() => setTab(k)} style={{ padding: "0.5rem 1.1rem", borderRadius: "0.4rem", border: "none", fontFamily: "inherit", fontWeight: tab === k ? 800 : 500, color: tab === k ? "#2563eb" : "#64748b", background: tab === k ? "#eff6ff" : "transparent", cursor: "pointer", fontSize: "0.83rem" }}>{label}</button>
  );
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <div className="inv-drawer-backdrop open" onClick={onClose} />
      <div className="inv-drawer open" role="dialog" aria-modal="true" style={{ width: "min(680px, 100vw)" }}>
        {/* Head */}
        <div className="inv-drawer-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem", paddingBottom: "0.75rem" }}>
          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, color: "#2563eb", overflow: "hidden", flexShrink: 0 }}>
                {member.photo_url ? <img src={member.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (member.full_name.trim()[0] || "؟")}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{member.full_name}</h2>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.15rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }} dir="ltr">{member.member_number || "—"}</span>
                  <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.5rem", borderRadius: "20px", background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                  <span style={{ fontSize: "0.72rem", color: "#7c3aed" }}>{TYPE_LABELS[member.membership_type] || member.membership_type}</span>
                </div>
              </div>
            </div>
            <button type="button" className="inv-drawer-close" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {/* Summary pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "20px", color: "#475569" }}>اشتراكات نشطة: {subs.filter(s => s.status === "active").length}</span>
            <span style={{ fontSize: "0.72rem", background: "#f0fdf4", padding: "0.2rem 0.6rem", borderRadius: "20px", color: "#16a34a" }}>إجمالي المدفوعات: {totalPaid.toLocaleString()} ج.س</span>
            <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "20px", color: "#475569" }}>تسجيل: {fmt(member.created_at)}</span>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.25rem", borderBottom: "2px solid #e2e8f0", width: "100%", paddingBottom: "0.25rem" }}>
            {tabBtn("personal", "البيانات الشخصية")}
            {tabBtn("subs", `الاشتراكات (${subs.length})`)}
            {tabBtn("payments", `المدفوعات (${payments.length})`)}
          </div>
        </div>

        {/* Body */}
        <div className="inv-drawer-body">
          {/* ── Personal Tab ── */}
          {tab === "personal" && (
            <form id="member-personal-form" onSubmit={savePersonal} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* Status / Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>رقم العضوية
                  <input value={form.member_number || ""} onChange={e => setF("member_number", e.target.value)} style={inp} dir="ltr" />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>نوع العضوية
                  <select value={form.membership_type} onChange={e => setF("membership_type", e.target.value)} style={inp}>
                    <option value="basic">أساسية</option><option value="premium">مميزة</option><option value="supporter">داعمة</option>
                  </select>
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الحالة
                  <select value={form.status} onChange={e => setF("status", e.target.value)} style={inp}>
                    <option value="pending">معلق</option><option value="active">نشط</option><option value="rejected">مرفوض</option>
                  </select>
                </label>
              </div>
              {/* Name / ID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الاسم الكامل *
                  <input required value={form.full_name} onChange={e => setF("full_name", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>رقم الهوية الوطنية
                  <input value={form.national_id || ""} onChange={e => setF("national_id", e.target.value)} style={inp} dir="ltr" />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>البريد الإلكتروني
                  <input type="email" value={form.email || ""} onChange={e => setF("email", e.target.value)} style={inp} dir="ltr" />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>رقم الجوال
                  <input value={form.phone || ""} onChange={e => setF("phone", e.target.value)} style={inp} dir="ltr" />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الجنس
                  <select value={form.gender || ""} onChange={e => setF("gender", e.target.value)} style={inp}>
                    <option value="male">ذكر</option><option value="female">أنثى</option>
                  </select>
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>تاريخ الميلاد
                  <input type="date" value={(form.birth_date || "").slice(0,10)} onChange={e => setF("birth_date", e.target.value)} style={inp} dir="ltr" />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الحالة الاجتماعية
                  <select value={form.marital_status || ""} onChange={e => setF("marital_status", e.target.value)} style={inp}>
                    {["أعزب","متزوج","مطلق","أرمل"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الدولة
                  <input value={form.country || ""} onChange={e => setF("country", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>الولاية
                  <input value={form.state || ""} onChange={e => setF("state", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>المدينة
                  <input value={form.city || ""} onChange={e => setF("city", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>المحلية
                  <input value={form.locality || ""} onChange={e => setF("locality", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem" }}>التخصص
                  <input value={form.specialization || ""} onChange={e => setF("specialization", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem", gridColumn: "1/-1" }}>المسمى الوظيفي
                  <input value={form.job_title || ""} onChange={e => setF("job_title", e.target.value)} style={inp} />
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "flex", flexDirection: "column", gap: "0.25rem", gridColumn: "1/-1" }}>رابط الصورة الشخصية
                  <input value={form.photo_url || ""} onChange={e => setF("photo_url", e.target.value)} style={inp} dir="ltr" placeholder="https://..." />
                </label>
              </div>
              {saveMsg && <p style={{ margin: 0, fontSize: "0.8rem", color: saveMsg.startsWith("خطأ") ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{saveMsg}</p>}
            </form>
          )}

          {/* ── Subscriptions Tab ── */}
          {tab === "subs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>سجل اشتراكات العضو</span>
                {!addSub && !editSub && <button onClick={() => setAddSub(true)} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.4rem", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>+ إضافة اشتراك</button>}
              </div>
              {(addSub || editSub) && <SubscriptionForm memberId={member.id} item={editSub} onSave={() => { setAddSub(false); setEditSub(null); loadSubs(); }} onCancel={() => { setAddSub(false); setEditSub(null); }} />}
              {subs.length === 0 && !addSub ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem", margin: 0 }}>لا توجد اشتراكات مسجلة</p>
              ) : subs.map(s => {
                const ss = SUB_STATUS_LABELS[s.status] ?? { label: s.status, color: "#64748b" };
                return (
                  <div key={s.id} style={{ border: "1px solid #e2e8f0", borderRadius: "0.6rem", padding: "0.85rem 1rem", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{SUB_TYPE_LABELS[s.subscription_type] || s.subscription_type}</span>
                        <span style={{ marginRight: "0.5rem", fontSize: "0.72rem", padding: "0.1rem 0.5rem", borderRadius: "20px", border: `1px solid ${ss.color}`, color: ss.color }}>{ss.label}</span>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.3rem" }}>
                          {fmt(s.start_date)} {s.end_date ? `← ${fmt(s.end_date)}` : "(مفتوح)"}
                          {Number(s.amount) > 0 && <span style={{ marginRight: "0.75rem", fontWeight: 700, color: "#1e293b" }}>{Number(s.amount).toLocaleString()} {s.currency}</span>}
                        </div>
                        {s.notes && <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>{s.notes}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                        <button onClick={() => { setEditSub(s); setAddSub(false); }} style={{ padding: "0.3rem 0.65rem", borderRadius: "0.35rem", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.75rem", fontFamily: "inherit", cursor: "pointer" }}>تعديل</button>
                        <button onClick={() => setDelConfirm({ table: "member_subscriptions", id: s.id })} style={{ padding: "0.3rem 0.65rem", borderRadius: "0.35rem", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "0.75rem", fontFamily: "inherit", cursor: "pointer" }}>حذف</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Payments Tab ── */}
          {tab === "payments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  إجمالي المدفوعات: <strong style={{ color: "#16a34a" }}>{totalPaid.toLocaleString()} ج.س</strong>
                </span>
                {!addPay && !editPay && <button onClick={() => setAddPay(true)} style={{ padding: "0.4rem 0.9rem", borderRadius: "0.4rem", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer" }}>+ تسجيل دفعة</button>}
              </div>
              {(addPay || editPay) && <PaymentForm memberId={member.id} subscriptions={subs} item={editPay} onSave={() => { setAddPay(false); setEditPay(null); loadPayments(); }} onCancel={() => { setAddPay(false); setEditPay(null); }} />}
              {payments.length === 0 && !addPay ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem", margin: 0 }}>لا توجد مدفوعات مسجلة</p>
              ) : payments.map(p => {
                const ps = PAY_STATUS_LABELS[p.status] ?? { label: p.status, color: "#64748b" };
                return (
                  <div key={p.id} style={{ border: "1px solid #e2e8f0", borderRadius: "0.6rem", padding: "0.85rem 1rem", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1e293b" }}>{Number(p.amount).toLocaleString()} {p.currency}</span>
                        <span style={{ marginRight: "0.5rem", fontSize: "0.72rem", fontWeight: 600, color: ps.color }}>{ps.label}</span>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.3rem" }}>
                          {fmt(p.payment_date)} · {PAY_METHOD_LABELS[p.payment_method] || p.payment_method}
                          {p.reference_number && <span style={{ marginRight: "0.5rem" }} dir="ltr">#{p.reference_number}</span>}
                        </div>
                        {p.notes && <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>{p.notes}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                        <button onClick={() => { setEditPay(p); setAddPay(false); }} style={{ padding: "0.3rem 0.65rem", borderRadius: "0.35rem", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.75rem", fontFamily: "inherit", cursor: "pointer" }}>تعديل</button>
                        <button onClick={() => setDelConfirm({ table: "member_payments", id: p.id })} style={{ padding: "0.3rem 0.65rem", borderRadius: "0.35rem", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "0.75rem", fontFamily: "inherit", cursor: "pointer" }}>حذف</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="inv-drawer-foot">
          {tab === "personal" && (
            <div className="inv-dfoot-wrap">
              <div className="inv-dfoot-row">
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>تسجيل: {fmt(member.created_at)}</span>
                <div className="inv-dfoot-btns">
                  <button type="button" onClick={onClose} className="inv-btn-cancel">إغلاق</button>
                  <button type="submit" form="member-personal-form" disabled={saving} className="inv-btn-save">
                    {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {tab !== "personal" && (
            <div className="inv-dfoot-wrap">
              <div className="inv-dfoot-row" style={{ justifyContent: "flex-end" }}>
                <button type="button" onClick={onClose} className="inv-btn-cancel">إغلاق</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {delConfirm && (
        <div className="adm-overlay" style={{ zIndex: 400 }}>
          <div className="adm-confirm">
            <p>هل أنت متأكد من الحذف؟</p>
            <div>
              <button className="adm-btn-danger" onClick={deleteRow}>تأكيد الحذف</button>
              <button onClick={() => setDelConfirm(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Members Panel ────────────────────────────────────────────────────────
export default function AdminMembersPanel() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ search: "", status: "", type: "", country: "", gender: "", from: "", to: "" });
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setMembers((data ?? []) as Member[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteMember = async () => {
    if (!confirmId) return;
    await supabase.from("members").delete().eq("id", confirmId);
    setConfirmId(null);
    load();
  };

  const countries = [...new Set(members.map(m => m.country).filter(Boolean))].sort();

  const filtered = members.filter(m => {
    const s = filters.search.toLowerCase();
    if (s && !m.full_name.toLowerCase().includes(s) && !m.email?.toLowerCase().includes(s) && !(m.phone ?? "").includes(s) && !(m.member_number ?? "").toLowerCase().includes(s)) return false;
    if (filters.status && m.status !== filters.status) return false;
    if (filters.type && m.membership_type !== filters.type) return false;
    if (filters.country && m.country !== filters.country) return false;
    if (filters.gender && m.gender !== filters.gender) return false;
    if (filters.from && m.created_at < filters.from) return false;
    if (filters.to && m.created_at > filters.to + "T23:59:59") return false;
    return true;
  });

  return (
    <div className="adm-section" style={{ padding: 0 }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>إدارة الأعضاء</h2>
      </div>

      <StatsRow members={filtered} />
      <FilterBar filters={filters} onChange={setFilters} countries={countries} onExport={() => exportCSV(filtered)} total={filtered.length} />

      <div className="adm-table-wrap">
        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>جاري التحميل...</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>العضو</th>
                <th>رقم العضوية</th>
                <th>الجوال</th>
                <th>الدولة / الولاية</th>
                <th>نوع العضوية</th>
                <th>الحالة</th>
                <th>تاريخ التسجيل</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const st = STATUS_LABELS[m.status] ?? STATUS_LABELS.pending;
                return (
                  <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => setActiveMember(m)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#2563eb", fontSize: "0.9rem", flexShrink: 0, overflow: "hidden" }}>
                          {m.photo_url ? <img src={m.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (m.full_name.trim()[0] || "؟")}
                        </div>
                        <div>
                          <b style={{ fontSize: "0.88rem" }}>{m.full_name}</b>
                          <div style={{ fontSize: "0.73rem", color: "#64748b" }} dir="ltr">{m.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td dir="ltr" style={{ fontSize: "0.82rem", color: "#475569" }}>{m.member_number || "—"}</td>
                    <td dir="ltr" style={{ fontSize: "0.82rem" }}>{m.phone || "—"}</td>
                    <td style={{ fontSize: "0.82rem" }}>{[m.country, m.state].filter(Boolean).join(" / ") || "—"}</td>
                    <td><span className="adm-tag">{TYPE_LABELS[m.membership_type] || m.membership_type}</span></td>
                    <td>
                      <span style={{ fontSize: "0.76rem", padding: "0.2rem 0.6rem", borderRadius: "20px", fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{fmt(m.created_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button className="adm-btn-edit" onClick={() => setActiveMember(m)}>فتح</button>
                        <button className="adm-btn-danger" onClick={() => setConfirmId(m.id)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="adm-empty">لا يوجد أعضاء بهذه الفلاتر</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {activeMember && (
        <MemberDrawer
          member={activeMember}
          onClose={() => setActiveMember(null)}
          onUpdated={updated => {
            setActiveMember(updated);
            setMembers(ms => ms.map(m => m.id === updated.id ? updated : m));
          }}
        />
      )}

      {confirmId && (
        <div className="adm-overlay" style={{ zIndex: 400 }}>
          <div className="adm-confirm">
            <p>هل أنت متأكد من حذف هذا العضو؟ سيتم حذف جميع اشتراكاته ومدفوعاته.</p>
            <div>
              <button className="adm-btn-danger" onClick={deleteMember}>تأكيد الحذف</button>
              <button onClick={() => setConfirmId(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
