import { useState, useEffect } from "react";
import { supabase } from "./supabase";

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

type Tab = "profile" | "membership" | "edit";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "قيد المراجعة", color: "#92400e", bg: "#fef3c7" },
  active:   { label: "عضو نشط",      color: "#065f46", bg: "#d1fae5" },
  rejected: { label: "مرفوض",        color: "#991b1b", bg: "#fee2e2" },
};

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  basic:     { label: "عضوية أساسية",   color: "#1e40af" },
  premium:   { label: "عضوية مميزة",    color: "#6d28d9" },
  supporter: { label: "عضوية داعمة",   color: "#b45309" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Login ────────────────────────────────────────────────────────────────────
function PortalLogin({ onLogin }: { onLogin: (m: Member) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
              autoFocus
              dir="ltr"
              required
            />
          </div>
          <div className="portal-field">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="كلمة المرور (آخر 6 أرقام من الجوال)"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              required
            />
          </div>
          {error && <p className="portal-error">{error}</p>}
          <button type="submit" className="portal-login-btn" disabled={loading}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
        <p className="portal-hint">
          كلمة المرور الافتراضية هي آخر 6 أرقام من رقم جوالك
        </p>
        <div className="portal-login-links">
          <a href="/register">تسجيل عضوية جديدة</a>
          <span>|</span>
          <a href="/">الصفحة الرئيسية</a>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ member }: { member: Member }) {
  const rows: [string, string][] = [
    ["الاسم الرباعي",     member.full_name],
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

// ─── Membership Tab ───────────────────────────────────────────────────────────
function MembershipTab({ member }: { member: Member }) {
  const st = STATUS_MAP[member.status] ?? STATUS_MAP.pending;
  const tp = TYPE_MAP[member.membership_type] ?? TYPE_MAP.basic;

  return (
    <div className="portal-tab-content">
      <div className="portal-mem-card">
        <div className="portal-mem-logo">
          <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="" />
        </div>
        <div className="portal-mem-info">
          <p className="portal-mem-org">رابطة ولاية نهر النيل الرقمية</p>
          <h2>{member.full_name}</h2>
          <p dir="ltr" className="portal-mem-num">{member.member_number || "—"}</p>
        </div>
        <div className="portal-mem-badges">
          <span className="portal-mem-type" style={{ color: tp.color, border: `1.5px solid ${tp.color}` }}>
            {tp.label}
          </span>
          <span className="portal-mem-status" style={{ color: st.color, background: st.bg }}>
            {st.label}
          </span>
        </div>
      </div>

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
          <p>للاستفسار يرجى التواصل مع إدارة الرابطة عبر صفحة <a href="/contact">تواصل معنا</a>.</p>
        </div>
      )}

      <div className="portal-mem-details">
        <div className="portal-mem-row">
          <span>نوع العضوية</span>
          <strong style={{ color: tp.color }}>{tp.label}</strong>
        </div>
        <div className="portal-mem-row">
          <span>الحالة</span>
          <strong style={{ color: st.color }}>{st.label}</strong>
        </div>
        <div className="portal-mem-row">
          <span>رقم العضوية</span>
          <strong dir="ltr">{member.member_number || "—"}</strong>
        </div>
        <div className="portal-mem-row">
          <span>تاريخ التسجيل</span>
          <strong>{formatDate(member.created_at)}</strong>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Tab ─────────────────────────────────────────────────────────────────
function EditTab({ member, onUpdated }: { member: Member; onUpdated: (m: Member) => void }) {
  const [form, setForm] = useState({
    email: member.email,
    phone: member.phone,
    city: member.city,
    state: member.state,
    locality: member.locality,
    country: member.country,
    specialization: member.specialization,
    job_title: member.job_title,
    marital_status: member.marital_status,
    password_hash: "",
    password_confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password_hash && form.password_hash !== form.password_confirm) {
      setError("كلمتا المرور غير متطابقتين"); return;
    }
    if (form.password_hash && form.password_hash.length < 4) {
      setError("كلمة المرور يجب أن تكون 4 أحرف على الأقل"); return;
    }
    setSaving(true);
    const payload: Record<string, string> = {
      email: form.email,
      phone: form.phone,
      city: form.city,
      state: form.state,
      locality: form.locality,
      country: form.country,
      specialization: form.specialization,
      job_title: form.job_title,
      marital_status: form.marital_status,
    };
    if (form.password_hash) payload.password_hash = form.password_hash;

    const { data, error: err } = await supabase
      .from("members")
      .update(payload)
      .eq("id", member.id)
      .select()
      .maybeSingle();

    setSaving(false);
    if (err) { setError("فشل الحفظ: " + err.message); return; }
    if (data) onUpdated(data as Member);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm(f => ({ ...f, password_hash: "", password_confirm: "" }));
  };

  const fields: [string, keyof typeof form, string?][] = [
    ["البريد الإلكتروني", "email", "email"],
    ["رقم الجوال", "phone", "tel"],
    ["الدولة", "country"],
    ["الولاية", "state"],
    ["المدينة", "city"],
    ["المحلية", "locality"],
    ["التخصص", "specialization"],
    ["المسمى الوظيفي", "job_title"],
  ];

  return (
    <div className="portal-tab-content">
      <form onSubmit={save} className="portal-edit-form">
        <h3>تعديل البيانات</h3>
        <div className="portal-edit-grid">
          {fields.map(([label, key, type]) => (
            <div key={key} className="portal-field">
              <label>{label}</label>
              <input
                type={type || "text"}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                dir={type === "email" || type === "tel" ? "ltr" : "rtl"}
              />
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
            <input
              type="password"
              value={form.password_hash}
              onChange={e => set("password_hash", e.target.value)}
              placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
            />
          </div>
          <div className="portal-field">
            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              value={form.password_confirm}
              onChange={e => set("password_confirm", e.target.value)}
              placeholder="أعد إدخال كلمة المرور الجديدة"
            />
          </div>
        </div>

        {error && <p className="portal-error">{error}</p>}
        {saved && <p className="portal-success">تم حفظ التعديلات بنجاح</p>}

        <button type="submit" className="portal-save-btn" disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </div>
  );
}

// ─── Main Portal ──────────────────────────────────────────────────────────────
export default function MemberPortal() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("membership");

  useEffect(() => {
    const id = sessionStorage.getItem("portal_member_id");
    if (!id) { setLoading(false); return; }
    supabase.from("members").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setMember(data as Member);
      setLoading(false);
    });
  }, []);

  const logout = () => {
    sessionStorage.removeItem("portal_member_id");
    setMember(null);
  };

  if (loading) return (
    <div className="portal-loading">
      <div className="portal-spinner" />
    </div>
  );

  if (!member) return <PortalLogin onLogin={m => { setMember(m); setTab("membership"); }} />;

  const tabs: { key: Tab; label: string }[] = [
    { key: "membership", label: "عضويتي" },
    { key: "profile",    label: "ملفي الشخصي" },
    { key: "edit",       label: "تعديل البيانات" },
  ];

  const st = STATUS_MAP[member.status] ?? STATUS_MAP.pending;

  return (
    <div className="portal-app" dir="rtl">
      {/* Top Bar */}
      <header className="portal-topbar">
        <div className="portal-topbar-inner">
          <a href="/" className="portal-topbar-brand">
            <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="" />
            <span>رابطة ولاية نهر النيل</span>
          </a>
          <div className="portal-topbar-user">
            <span
              className="portal-topbar-status"
              style={{ color: st.color, background: st.bg }}
            >
              {st.label}
            </span>
            <span className="portal-topbar-name">{member.full_name}</span>
            <button className="portal-logout-btn" onClick={logout}>خروج</button>
          </div>
        </div>
      </header>

      <div className="portal-body">
        {/* Sidebar */}
        <aside className="portal-sidebar">
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
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <a href="/" className="portal-sidebar-home">← الموقع الرئيسي</a>
        </aside>

        {/* Content */}
        <main className="portal-main">
          {tab === "membership" && <MembershipTab member={member} />}
          {tab === "profile"    && <ProfileTab member={member} />}
          {tab === "edit"       && <EditTab member={member} onUpdated={m => setMember(m)} />}
        </main>
      </div>
    </div>
  );
}
