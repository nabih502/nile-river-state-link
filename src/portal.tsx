import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import PortalChat from "./portal-chat";
import PortalServices from "./portal-services";
import PortalActivities from "./portal-activities";

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  gender: string;
  birth_date: string | null;
  state: string;
  city: string;
  locality: string;
  country: string;
  marital_status: string;
  specialization: string;
  job_title: string;
  photo_url: string;
  membership_type: string;
  member_number: string;
  status: string;
  created_at: string;
}

interface Subscription {
  id: string;
  subscription_type: string;
  start_date: string;
  end_date: string | null;
  amount: number;
  currency: string;
  status: string;
  notes: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  status: string;
  notes: string;
}

type Tab = "dashboard" | "membership" | "subscriptions" | "services" | "activities" | "chat" | "profile" | "edit";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "قيد المراجعة", color: "#92400e", bg: "#fef3c7" },
  active:   { label: "عضو نشط",      color: "#065f46", bg: "#d1fae5" },
  rejected: { label: "مرفوض",        color: "#991b1b", bg: "#fee2e2" },
};

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  basic:     { label: "عضوية أساسية",  color: "#1e40af" },
  premium:   { label: "عضوية مميزة",   color: "#6d28d9" },
  supporter: { label: "عضوية داعمة",   color: "#b45309" },
};

const SUB_TYPE_LABEL: Record<string, string> = {
  annual:   "سنوي",
  monthly:  "شهري",
  lifetime: "مدى الحياة",
};

const PAY_METHOD_LABEL: Record<string, string> = {
  cash:          "نقداً",
  bank_transfer: "تحويل بنكي",
  online:        "إلكتروني",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Login ────────────────────────────────────────────────────────────────────
function PortalLogin({ onLogin }: { onLogin: (m: Member) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const val = identifier.trim();
    const { data, error: dbErr } = await supabase
      .from("members")
      .select("*")
      .or(`email.eq.${val},phone.eq.${val},member_number.eq.${val}`)
      .maybeSingle();

    setLoading(false);
    if (dbErr || !data) { setError("لم يتم العثور على حساب بهذه البيانات"); return; }
    if (data.password_hash !== password) { setError("كلمة المرور غير صحيحة"); return; }
    sessionStorage.setItem("portal_member_id", data.id);
    onLogin(data as Member);
  };

  return (
    <div className="portal-login-wrap">
      <div className="portal-login-card">
        <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="شعار الرابطة" className="portal-login-logo" />
        <h1>بوابة الأعضاء</h1>
        <p>رابطة ولاية نهر النيل الرقمية</p>
        <form onSubmit={submit} className="portal-login-form">
          <div className="portal-field">
            <label>البريد الإلكتروني / الجوال / رقم العضوية</label>
            <input
              type="text"
              placeholder="أدخل بريدك أو رقم جوالك"
              value={identifier}
              onChange={e => { setIdentifier(e.target.value); setError(""); }}
              autoFocus dir="ltr" required
            />
          </div>
          <div className="portal-field">
            <label>كلمة المرور</label>
            <div className="portal-pw-wrap">
              <input
                type={showPw ? "text" : "password"}
                placeholder="كلمة المرور"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                required
              />
              <button type="button" className="portal-pw-toggle" onClick={() => setShowPw(s => !s)}>
                {showPw ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>
          {error && <p className="portal-error">{error}</p>}
          <button type="submit" className="portal-login-btn" disabled={loading}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
        <p className="portal-hint">كلمة المرور الافتراضية هي آخر 6 أرقام من رقم جوالك</p>
        <div className="portal-login-links">
          <a href="/register">تسجيل عضوية جديدة</a>
          <span>|</span>
          <a href="/">الصفحة الرئيسية</a>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ member, onNavigate }: { member: Member; onNavigate: (t: Tab) => void }) {
  const [sub, setSub]         = useState<Subscription | null>(null);
  const [unreadChat, setUnreadChat] = useState(0);
  const [newsCt, setNewsCt]   = useState(0);
  const st = STATUS_MAP[member.status] ?? STATUS_MAP.pending;
  const tp = TYPE_MAP[member.membership_type] ?? TYPE_MAP.basic;

  useEffect(() => {
    supabase.from("member_subscriptions").select("*").eq("member_id", member.id)
      .eq("status", "active").order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => setSub(data?.[0] as Subscription ?? null));

    supabase.from("chat_conversations").select("member_unread").eq("member_id", member.id)
      .then(({ data }) => setUnreadChat((data ?? []).reduce((s, c: { member_unread: number }) => s + c.member_unread, 0)));

    supabase.from("news").select("id", { count: "exact", head: true }).eq("published", true)
      .then(({ count }) => setNewsCt(count ?? 0));
  }, [member.id]);

  const daysLeft = sub?.end_date
    ? Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / 86400000))
    : null;

  const quickLinks = [
    { icon: "💬", label: "الدردشة مع الدعم", badge: unreadChat, tab: "chat" as Tab },
    { icon: "🤝", label: "طلب خدمة",          badge: 0,          tab: "services" as Tab },
    { icon: "📅", label: "الفعاليات",          badge: 0,          tab: "activities" as Tab },
    { icon: "💰", label: "الاشتراك والمدفوعات", badge: 0,         tab: "subscriptions" as Tab },
  ];

  return (
    <div className="portal-tab-content">
      {/* Welcome banner */}
      <div className="pdash-welcome">
        <div className="pdash-welcome-avatar">
          {member.photo_url
            ? <img src={member.photo_url} alt={member.full_name} />
            : <span>{member.full_name.trim()[0] || "؟"}</span>}
        </div>
        <div className="pdash-welcome-text">
          <h2>مرحباً، {member.full_name.split(" ")[0]}</h2>
          <p>
            <span className="pdash-status-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
            <span className="pdash-type-badge" style={{ color: tp.color }}>— {tp.label}</span>
          </p>
          <p dir="ltr" className="pdash-member-num">{member.member_number || "—"}</p>
        </div>
      </div>

      {/* Subscription alert */}
      {sub && daysLeft !== null && daysLeft <= 30 && (
        <div className={`pdash-alert ${daysLeft <= 7 ? "urgent" : "warning"}`}>
          {daysLeft === 0
            ? "⚠️ انتهى اشتراكك — يرجى التجديد للاستمرار في الاستفادة من خدمات الرابطة"
            : `⏳ اشتراكك ينتهي خلال ${daysLeft} يوم — تاريخ الانتهاء: ${formatDate(sub.end_date)}`}
        </div>
      )}

      {/* Quick links */}
      <h3 className="portal-section-title">الخدمات السريعة</h3>
      <div className="pdash-quick">
        {quickLinks.map(ql => (
          <button key={ql.tab} className="pdash-quick-card" onClick={() => onNavigate(ql.tab)}>
            <span className="pdash-quick-icon">{ql.icon}</span>
            <span className="pdash-quick-label">{ql.label}</span>
            {ql.badge > 0 && <span className="pdash-quick-badge">{ql.badge}</span>}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <h3 className="portal-section-title">ملخص سريع</h3>
      <div className="pdash-stats">
        <div className="pdash-stat">
          <span className="pdash-stat-label">حالة العضوية</span>
          <span className="pdash-stat-value" style={{ color: st.color }}>{st.label}</span>
        </div>
        <div className="pdash-stat">
          <span className="pdash-stat-label">نوع العضوية</span>
          <span className="pdash-stat-value" style={{ color: tp.color }}>{tp.label}</span>
        </div>
        <div className="pdash-stat">
          <span className="pdash-stat-label">تاريخ الانضمام</span>
          <span className="pdash-stat-value">{formatDate(member.created_at)}</span>
        </div>
        <div className="pdash-stat">
          <span className="pdash-stat-label">الاشتراك الحالي</span>
          <span className="pdash-stat-value">
            {sub ? `${SUB_TYPE_LABEL[sub.subscription_type] ?? sub.subscription_type} — ${sub.amount} ${sub.currency}` : "لا يوجد اشتراك"}
          </span>
        </div>
        <div className="pdash-stat">
          <span className="pdash-stat-label">الأخبار المنشورة</span>
          <span className="pdash-stat-value">{newsCt}</span>
        </div>
        {unreadChat > 0 && (
          <div className="pdash-stat">
            <span className="pdash-stat-label">ردود غير مقروءة</span>
            <span className="pdash-stat-value" style={{ color: "#dc2626" }}>{unreadChat}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Digital Membership Card ──────────────────────────────────────────────────
function MembershipTab({ member }: { member: Member }) {
  const st = STATUS_MAP[member.status] ?? STATUS_MAP.pending;
  const tp = TYPE_MAP[member.membership_type] ?? TYPE_MAP.basic;

  const handlePrint = () => window.print();

  return (
    <div className="portal-tab-content">
      {/* Digital card */}
      <div className="pmem-card-wrap">
        <div className="pmem-card" id="printable-card">
          <div className="pmem-card-header">
            <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="" className="pmem-card-logo" />
            <div>
              <div className="pmem-card-org">رابطة ولاية نهر النيل الرقمية</div>
              <div className="pmem-card-type" style={{ color: tp.color }}>{tp.label}</div>
            </div>
          </div>
          <div className="pmem-card-body">
            <div className="pmem-card-avatar">
              {member.photo_url
                ? <img src={member.photo_url} alt={member.full_name} />
                : <span>{member.full_name.trim()[0] || "؟"}</span>}
            </div>
            <div className="pmem-card-info">
              <h2>{member.full_name}</h2>
              <p dir="ltr" className="pmem-card-num">{member.member_number || "—"}</p>
              <p className="pmem-card-state">{member.state}{member.country ? ` — ${member.country}` : ""}</p>
            </div>
          </div>
          <div className="pmem-card-footer">
            <span className="pmem-card-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
            <span className="pmem-card-joined">عضو منذ {new Date(member.created_at).getFullYear()}</span>
          </div>
        </div>
        <button className="portal-btn-secondary pmem-print-btn" onClick={handlePrint}>
          🖨️ طباعة / حفظ البطاقة
        </button>
      </div>

      {/* Status details */}
      {member.status === "pending" && (
        <div className="portal-alert portal-alert-warning">
          <strong>طلبك قيد المراجعة</strong>
          <p>سيتم مراجعة بياناتك من قبل إدارة الرابطة والتواصل معك عند الموافقة.</p>
        </div>
      )}
      {member.status === "active" && (
        <div className="portal-alert portal-alert-success">
          <strong>عضويتك نشطة</strong>
          <p>أنت عضو نشط في رابطة ولاية نهر النيل الرقمية. شكراً لانتمائك.</p>
        </div>
      )}
      {member.status === "rejected" && (
        <div className="portal-alert portal-alert-error">
          <strong>تم رفض الطلب</strong>
          <p>للاستفسار يرجى التواصل مع إدارة الرابطة عبر <a href="/contact">تواصل معنا</a>.</p>
        </div>
      )}

      {/* Details table */}
      <div className="portal-mem-details">
        {[
          ["نوع العضوية", <strong style={{ color: tp.color }}>{tp.label}</strong>],
          ["الحالة", <strong style={{ color: st.color }}>{st.label}</strong>],
          ["رقم العضوية", <strong dir="ltr">{member.member_number || "—"}</strong>],
          ["تاريخ التسجيل", <strong>{formatDate(member.created_at)}</strong>],
        ].map(([label, val]) => (
          <div key={label as string} className="portal-mem-row">
            <span>{label}</span>
            {val}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────
function SubscriptionsTab({ member }: { member: Member }) {
  const [subs, setSubs]     = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("member_subscriptions").select("*").eq("member_id", member.id).order("created_at", { ascending: false }),
      supabase.from("member_payments").select("*").eq("member_id", member.id).order("payment_date", { ascending: false }),
    ]).then(([s, p]) => {
      setSubs((s.data ?? []) as Subscription[]);
      setPayments((p.data ?? []) as Payment[]);
      setLoading(false);
    });
  }, [member.id]);

  const subStatusColor = (s: string) => s === "active" ? "#065f46" : s === "expired" ? "#991b1b" : "#374151";
  const subStatusBg    = (s: string) => s === "active" ? "#d1fae5" : s === "expired" ? "#fee2e2" : "#f3f4f6";
  const subStatusLabel = (s: string) => s === "active" ? "نشط" : s === "expired" ? "منتهي" : s === "cancelled" ? "ملغى" : s;

  const payStatusColor = (s: string) => s === "paid" ? "#065f46" : s === "pending" ? "#92400e" : "#991b1b";
  const payStatusBg    = (s: string) => s === "paid" ? "#d1fae5" : s === "pending" ? "#fef3c7" : "#fee2e2";
  const payStatusLabel = (s: string) => s === "paid" ? "مدفوع" : s === "pending" ? "معلق" : s === "failed" ? "فشل" : s === "refunded" ? "مسترجع" : s;

  if (loading) return <div className="portal-tab-content"><div className="portal-loading-inline">جاري التحميل...</div></div>;

  return (
    <div className="portal-tab-content">
      <h3 className="portal-section-title">الاشتراكات</h3>
      {subs.length === 0 ? (
        <p className="portal-empty">لا توجد اشتراكات مسجلة</p>
      ) : (
        <div className="psub-list">
          {subs.map(sub => {
            const daysLeft = sub.end_date
              ? Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / 86400000))
              : null;
            return (
              <div key={sub.id} className={`psub-item ${sub.status}`}>
                <div className="psub-item-head">
                  <span className="psub-type">{SUB_TYPE_LABEL[sub.subscription_type] ?? sub.subscription_type}</span>
                  <span className="psub-status" style={{ color: subStatusColor(sub.status), background: subStatusBg(sub.status) }}>
                    {subStatusLabel(sub.status)}
                  </span>
                </div>
                <div className="psub-item-body">
                  <div className="psub-row"><span>تاريخ البداية</span><strong>{formatDate(sub.start_date)}</strong></div>
                  <div className="psub-row"><span>تاريخ الانتهاء</span><strong>{sub.end_date ? formatDate(sub.end_date) : "مدى الحياة"}</strong></div>
                  <div className="psub-row"><span>المبلغ</span><strong>{sub.amount} {sub.currency}</strong></div>
                  {sub.status === "active" && daysLeft !== null && (
                    <div className="psub-row">
                      <span>متبقي</span>
                      <strong style={{ color: daysLeft <= 30 ? "#dc2626" : "#065f46" }}>{daysLeft} يوم</strong>
                    </div>
                  )}
                </div>
                {sub.notes && <p className="psub-notes">{sub.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      <h3 className="portal-section-title" style={{ marginTop: "2rem" }}>سجل المدفوعات ({payments.length})</h3>
      {payments.length === 0 ? (
        <p className="portal-empty">لا توجد مدفوعات مسجلة</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>طريقة الدفع</th>
                <th>المرجع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{formatDate(p.payment_date)}</td>
                  <td><strong>{p.amount} {p.currency}</strong></td>
                  <td>{PAY_METHOD_LABEL[p.payment_method] ?? p.payment_method}</td>
                  <td dir="ltr" style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.reference_number || "—"}</td>
                  <td>
                    <span style={{ color: payStatusColor(p.status), background: payStatusBg(p.status), padding: "0.15rem 0.55rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700 }}>
                      {payStatusLabel(p.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ member }: { member: Member }) {
  const rows: [string, string][] = [
    ["الاسم الرباعي",      member.full_name],
    ["رقم الهوية الوطنية", member.national_id || "—"],
    ["البريد الإلكتروني",  member.email || "—"],
    ["رقم الجوال",         member.phone || "—"],
    ["الجنس",              member.gender === "female" ? "أنثى" : "ذكر"],
    ["تاريخ الميلاد",      formatDate(member.birth_date)],
    ["الحالة الاجتماعية",  member.marital_status || "—"],
    ["الدولة",             member.country || "—"],
    ["الولاية",            member.state || "—"],
    ["المدينة",            member.city || "—"],
    ["المحلية",            member.locality || "—"],
    ["التخصص",             member.specialization || "—"],
    ["المسمى الوظيفي",     member.job_title || "—"],
  ];
  return (
    <div className="portal-tab-content">
      <div className="portal-profile-hero">
        <div className="portal-avatar">
          {member.photo_url
            ? <img src={member.photo_url} alt={member.full_name} />
            : <span>{member.full_name.trim()[0] || "؟"}</span>}
        </div>
        <div>
          <h2>{member.full_name}</h2>
          <p dir="ltr" className="portal-member-number">{member.member_number || "—"}</p>
        </div>
      </div>
      <div className="portal-info-grid">
        {rows.map(([label, val]) => (
          <div key={label} className="portal-info-cell">
            <span className="portal-info-label">{label}</span>
            <span className="portal-info-val">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Tab ─────────────────────────────────────────────────────────────────
function EditTab({ member, onUpdated }: { member: Member; onUpdated: (m: Member) => void }) {
  const [form, setForm] = useState({
    email: member.email, phone: member.phone, city: member.city,
    state: member.state, locality: member.locality, country: member.country,
    specialization: member.specialization, job_title: member.job_title,
    marital_status: member.marital_status,
    password_hash: "", password_confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password_hash && form.password_hash !== form.password_confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    if (form.password_hash && form.password_hash.length < 4) { setError("كلمة المرور يجب أن تكون 4 أحرف على الأقل"); return; }
    setSaving(true);
    const payload: Record<string, string> = {
      email: form.email, phone: form.phone, city: form.city,
      state: form.state, locality: form.locality, country: form.country,
      specialization: form.specialization, job_title: form.job_title,
      marital_status: form.marital_status,
    };
    if (form.password_hash) payload.password_hash = form.password_hash;
    const { data, error: err } = await supabase.from("members").update(payload).eq("id", member.id).select().maybeSingle();
    setSaving(false);
    if (err) { setError("فشل الحفظ: " + err.message); return; }
    if (data) onUpdated(data as Member);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm(f => ({ ...f, password_hash: "", password_confirm: "" }));
  };

  const fields: [string, keyof typeof form, string?][] = [
    ["البريد الإلكتروني", "email", "email"], ["رقم الجوال", "phone", "tel"],
    ["الدولة", "country"], ["الولاية", "state"], ["المدينة", "city"],
    ["المحلية", "locality"], ["التخصص", "specialization"], ["المسمى الوظيفي", "job_title"],
  ];

  return (
    <div className="portal-tab-content">
      <form onSubmit={save} className="portal-edit-form">
        <h3>تعديل البيانات</h3>
        <div className="portal-edit-grid">
          {fields.map(([label, key, type]) => (
            <div key={key} className="portal-field">
              <label>{label}</label>
              <input type={type || "text"} value={form[key]} onChange={e => set(key, e.target.value)}
                dir={type === "email" || type === "tel" ? "ltr" : "rtl"} />
            </div>
          ))}
          <div className="portal-field">
            <label>الحالة الاجتماعية</label>
            <select value={form.marital_status} onChange={e => set("marital_status", e.target.value)}>
              {["أعزب", "متزوج", "مطلق", "أرمل"].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <h3 className="portal-section-sep">تغيير كلمة المرور <small>(اتركه فارغاً إذا لا تريد التغيير)</small></h3>
        <div className="portal-edit-grid">
          <div className="portal-field">
            <label>كلمة المرور الجديدة</label>
            <input type="password" value={form.password_hash} onChange={e => set("password_hash", e.target.value)} placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية" />
          </div>
          <div className="portal-field">
            <label>تأكيد كلمة المرور</label>
            <input type="password" value={form.password_confirm} onChange={e => set("password_confirm", e.target.value)} placeholder="أعد إدخال كلمة المرور الجديدة" />
          </div>
        </div>
        {error && <p className="portal-error">{error}</p>}
        {saved && <p className="portal-success">تم حفظ التعديلات بنجاح ✓</p>}
        <button type="submit" className="portal-save-btn" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
      </form>
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────────────
export default function MemberPortal() {
  const [member, setMember]   = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>("dashboard");
  const [chatUnread, setChatUnread] = useState(0);
  const [sideOpen, setSideOpen]     = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem("portal_member_id");
    if (!id) { setLoading(false); return; }
    supabase.from("members").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setMember(data as Member);
      setLoading(false);
    });
  }, []);

  // Keep chat unread badge fresh
  useEffect(() => {
    if (!member) return;
    const refresh = () => {
      supabase.from("chat_conversations").select("member_unread").eq("member_id", member.id)
        .then(({ data }) => setChatUnread((data ?? []).reduce((s, c: { member_unread: number }) => s + c.member_unread, 0)));
    };
    refresh();
    const ch = supabase.channel(`portal-unread-${member.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations", filter: `member_id=eq.${member.id}` }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [member?.id]);

  const logout = () => { sessionStorage.removeItem("portal_member_id"); setMember(null); };

  if (loading) return <div className="portal-loading"><div className="portal-spinner" /></div>;
  if (!member) return <PortalLogin onLogin={m => { setMember(m); setTab("dashboard"); }} />;

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "dashboard",     label: "الرئيسية",        icon: "🏠" },
    { key: "membership",    label: "عضويتي",           icon: "🪪" },
    { key: "subscriptions", label: "الاشتراكات",       icon: "💰" },
    { key: "services",      label: "الخدمات",          icon: "🤝" },
    { key: "activities",    label: "الفعاليات",        icon: "📅" },
    { key: "chat",          label: "الدعم الفوري",     icon: "💬", badge: chatUnread },
    { key: "profile",       label: "ملفي الشخصي",      icon: "👤" },
    { key: "edit",          label: "تعديل البيانات",   icon: "✏️" },
  ];

  const st = STATUS_MAP[member.status] ?? STATUS_MAP.pending;
  const currentTab = tabs.find(t => t.key === tab);

  return (
    <div className="portal-app" dir="rtl">
      {/* Top Bar */}
      <header className="portal-topbar">
        <div className="portal-topbar-inner">
          <div className="portal-topbar-right">
            <button className="portal-hamburger" onClick={() => setSideOpen(s => !s)}>☰</button>
            <a href="/" className="portal-topbar-brand">
              <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="" />
              <span>رابطة ولاية نهر النيل</span>
            </a>
          </div>
          <div className="portal-topbar-user">
            {chatUnread > 0 && (
              <button className="portal-chat-bell" onClick={() => setTab("chat")} title="رسائل غير مقروءة">
                💬 <span>{chatUnread}</span>
              </button>
            )}
            <span className="portal-topbar-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
            <span className="portal-topbar-name">{member.full_name.split(" ")[0]}</span>
            <button className="portal-logout-btn" onClick={logout}>خروج</button>
          </div>
        </div>
      </header>

      <div className="portal-body">
        {/* Sidebar */}
        <aside className={`portal-sidebar ${sideOpen ? "open" : ""}`}>
          <div className="portal-sidebar-avatar">
            {member.photo_url
              ? <img src={member.photo_url} alt={member.full_name} />
              : <span>{member.full_name.trim()[0] || "؟"}</span>}
          </div>
          <p className="portal-sidebar-name">{member.full_name}</p>
          <p dir="ltr" className="portal-sidebar-num">{member.member_number || "—"}</p>

          <nav className="portal-sidebar-nav">
            {tabs.map(t => (
              <button
                key={t.key}
                className={tab === t.key ? "active" : ""}
                onClick={() => { setTab(t.key); setSideOpen(false); }}
              >
                <span className="pnav-icon">{t.icon}</span>
                <span>{t.label}</span>
                {t.badge ? <em>{t.badge}</em> : null}
              </button>
            ))}
          </nav>
          <a href="/" className="portal-sidebar-home">← الموقع الرئيسي</a>
        </aside>

        {sideOpen && <div className="portal-sidebar-overlay" onClick={() => setSideOpen(false)} />}

        {/* Content */}
        <main className="portal-main">
          <div className="portal-main-header">
            <h1>{currentTab?.icon} {currentTab?.label}</h1>
          </div>

          {tab === "dashboard"     && <DashboardTab member={member} onNavigate={setTab} />}
          {tab === "membership"    && <MembershipTab member={member} />}
          {tab === "subscriptions" && <SubscriptionsTab member={member} />}
          {tab === "services"      && <PortalServices member={member} />}
          {tab === "activities"    && <PortalActivities member={member} />}
          {tab === "chat"          && <div className="portal-tab-content portal-tab-chat"><PortalChat member={member} /></div>}
          {tab === "profile"       && <ProfileTab member={member} />}
          {tab === "edit"          && <EditTab member={member} onUpdated={m => setMember(m)} />}
        </main>
      </div>
    </div>
  );
}
