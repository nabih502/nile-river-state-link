import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import InvestmentPanel from "./admin-investment";
import CulturePanel from "./admin-culture";
import { SocialPanel } from "./admin-social";
import AdminContact from "./admin-contact";
import AdminMembersPanel from "./admin-members";

type Section = "dashboard" | "news" | "events" | "members" | "messages" | "investment" | "culture" | "social" | "contact" | "settings";

interface NewsRow { id: string; title: string; slug: string; excerpt: string; body: string; image_url: string; category: string; published: boolean; published_at: string | null; created_at: string; author_name: string; author_image_url: string; read_time: number; seo_title: string; seo_description: string; seo_image: string; }
interface EventRow { id: string; title: string; slug: string; excerpt: string; body: string; image_url: string; location: string; event_date: string; event_end_date: string | null; published: boolean; created_at: string; author_name: string; author_image_url: string; organizer: string; seo_title: string; seo_description: string; seo_image: string; }
interface MemberRow { id: string; full_name: string; email: string; phone: string; national_id: string; gender: string; country: string; state: string; membership_type: string; status: string; created_at: string; }
interface MessageRow { id: string; name: string; email: string; phone: string; subject: string; message: string; read: boolean; created_at: string; }
interface Stats { news: number; events: number; members: number; messages: number; unread: number; inquiries: number; newInquiries: number; }

const ADMIN_PASSWORD = "admin2024";

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

function slugify(text: string) {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .toLowerCase() || Date.now().toString();
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("admin2024");
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { sessionStorage.setItem("admin_auth", "1"); onLogin(); }
    else { setErr(true); setPw(""); }
  };
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="شعار" className="adm-login-logo" />
        <h1>لوحة تحكم الإدارة</h1>
        <p>رابطة ولاية نهر النيل الرقمية</p>
        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false); }}
            className={err ? "adm-input-err" : ""}
            autoFocus
          />
          {err && <span className="adm-err">كلمة المرور غير صحيحة</span>}
          <button type="submit">دخول</button>
        </form>
      </div>
    </div>
  );
}

// ─── Stats cards ──────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="adm-stat" style={{ borderColor: color }}><span className="adm-stat-val" style={{ color }}>{value}</span><span className="adm-stat-lbl">{label}</span></div>;
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function Confirm({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-overlay">
      <div className="adm-confirm">
        <p>{message}</p>
        <div><button className="adm-btn-danger" onClick={onConfirm}>تأكيد الحذف</button><button onClick={onCancel}>إلغاء</button></div>
      </div>
    </div>
  );
}

// ─── News Editor ─────────────────────────────────────────────────────────────
function NewsEditor({ item, onSave, onCancel }: { item: Partial<NewsRow> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<NewsRow> = { title: "", slug: "", excerpt: "", body: "", image_url: "", category: "عام", published: false, author_name: "", author_image_url: "", read_time: 0, seo_title: "", seo_description: "", seo_image: "" };
  const [form, setForm] = useState<Partial<NewsRow>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [eTab, setETab] = useState<"content"|"seo">("content");

  const set = (k: keyof NewsRow, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title || ""),
      excerpt: form.excerpt,
      body: form.body,
      image_url: form.image_url,
      category: form.category,
      published: form.published,
      published_at: form.published ? (form.published_at || new Date().toISOString()) : null,
      author_name: form.author_name || "",
      author_image_url: form.author_image_url || "",
      read_time: form.read_time || 0,
      seo_title: form.seo_title || "",
      seo_description: form.seo_description || "",
      seo_image: form.seo_image || "",
    };
    const { error: err } = form.id
      ? await supabase.from("news").update(payload).eq("id", form.id)
      : await supabase.from("news").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل خبر" : "إضافة خبر جديد"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        <div style={{display:"flex",gap:"0.4rem",padding:"0.75rem 1.25rem",borderBottom:"1px solid #e2e8f0",background:"#f8fafc"}}>
          {(["content","seo"] as const).map(t=><button key={t} type="button" onClick={()=>setETab(t)} style={{padding:"0.45rem 1.1rem",borderRadius:"0.45rem",border:"none",fontFamily:"inherit",fontWeight:eTab===t?800:500,color:eTab===t?"#2563eb":"#64748b",background:eTab===t?"#eff6ff":"transparent",cursor:"pointer",fontSize:"0.83rem"}}>{t==="content"?"المحتوى":"SEO"}</button>)}
        </div>
        {error && <p className="adm-err">{error}</p>}
        {eTab==="content" && <>
        <div className="adm-form-row">
          <label>العنوان *<input required value={form.title || ""} onChange={e => { set("title", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} /></label>
          <label>الرابط (slug)<input value={form.slug || ""} onChange={e => set("slug", e.target.value)} dir="ltr" /></label>
        </div>
        <label>الوصف المختصر<textarea value={form.excerpt || ""} onChange={e => set("excerpt", e.target.value)} rows={2} /></label>
        <label>المحتوى الكامل<textarea value={form.body || ""} onChange={e => set("body", e.target.value)} rows={8} /></label>
        <div className="adm-form-row">
          <label>رابط الصورة<input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} dir="ltr" /></label>
          <label>التصنيف
            <select value={form.category || "عام"} onChange={e => set("category", e.target.value)}>
              {["عام", "تعليم", "صحة", "اجتماعي", "استثمار", "ثقافة", "فعالية", "إعلان"].map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="adm-form-row">
          <label>اسم الكاتب<input value={form.author_name || ""} onChange={e => set("author_name", e.target.value)} placeholder="اسم محرر الخبر" /></label>
          <label>صورة الكاتب (رابط)<input value={form.author_image_url || ""} onChange={e => set("author_image_url", e.target.value)} dir="ltr" placeholder="https://..." /></label>
        </div>
        <label>وقت القراءة (بالدقائق)<input type="number" min={0} max={120} value={form.read_time || 0} onChange={e => set("read_time", e.target.value)} style={{width:"120px"}} /></label>
        <label className="adm-toggle-label">
          <input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />
          نشر الخبر
        </label>
        </>}
        {eTab==="seo" && <div style={{display:"flex",flexDirection:"column",gap:"1rem",padding:"0.25rem 0"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"0.78rem",fontWeight:700}}>عنوان SEO</span><span style={{fontSize:"0.7rem",color:"#94a3b8"}}>50–65 حرف</span></div>
            <input value={form.seo_title||""} onChange={e=>set("seo_title",e.target.value)} placeholder="عنوان الخبر في محركات البحث (فارغ = استخدام عنوان الخبر تلقائياً)" />
            <span style={{fontSize:"0.72rem",color:(form.seo_title||form.title||"").length>=50&&(form.seo_title||form.title||"").length<=65?"#16a34a":"#d97706"}}>{(form.seo_title||form.title||"").length} / 65</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"0.78rem",fontWeight:700}}>وصف SEO</span><span style={{fontSize:"0.7rem",color:"#94a3b8"}}>120–160 حرف</span></div>
            <textarea rows={3} value={form.seo_description||""} onChange={e=>set("seo_description",e.target.value)} placeholder="وصف مختصر يظهر في نتائج البحث (فارغ = استخدام الوصف المختصر تلقائياً)" style={{resize:"vertical"}} />
            <span style={{fontSize:"0.72rem",color:(form.seo_description||form.excerpt||"").length>=120&&(form.seo_description||form.excerpt||"").length<=160?"#16a34a":"#d97706"}}>{(form.seo_description||form.excerpt||"").length} / 160</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
            <span style={{fontSize:"0.78rem",fontWeight:700}}>صورة المشاركة (OG Image)</span>
            <SeoImageUpload value={form.seo_image||""} onChange={url=>set("seo_image",url)} />
          </div>
        </div>}
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Event Editor ─────────────────────────────────────────────────────────────
function EventEditor({ item, onSave, onCancel }: { item: Partial<EventRow> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<EventRow> = { title: "", slug: "", excerpt: "", body: "", image_url: "", location: "", event_date: new Date().toISOString().slice(0, 16), event_end_date: null, published: false, author_name: "", author_image_url: "", organizer: "", seo_title: "", seo_description: "", seo_image: "" };
  const [form, setForm] = useState<Partial<EventRow>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [eTab, setETab] = useState<"content"|"seo">("content");

  const set = (k: keyof EventRow, v: string | boolean | null) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title || ""),
      excerpt: form.excerpt,
      body: form.body,
      image_url: form.image_url,
      location: form.location,
      event_date: form.event_date,
      event_end_date: form.event_end_date || null,
      published: form.published,
      author_name: form.author_name || "",
      author_image_url: form.author_image_url || "",
      organizer: form.organizer || "",
      seo_title: form.seo_title || "",
      seo_description: form.seo_description || "",
      seo_image: form.seo_image || "",
    };
    const { error: err } = form.id
      ? await supabase.from("events").update(payload).eq("id", form.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل فعالية" : "إضافة فعالية جديدة"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        <div style={{display:"flex",gap:"0.4rem",padding:"0.75rem 1.25rem",borderBottom:"1px solid #e2e8f0",background:"#f8fafc"}}>
          {(["content","seo"] as const).map(t=><button key={t} type="button" onClick={()=>setETab(t)} style={{padding:"0.45rem 1.1rem",borderRadius:"0.45rem",border:"none",fontFamily:"inherit",fontWeight:eTab===t?800:500,color:eTab===t?"#2563eb":"#64748b",background:eTab===t?"#eff6ff":"transparent",cursor:"pointer",fontSize:"0.83rem"}}>{t==="content"?"المحتوى":"SEO"}</button>)}
        </div>
        {error && <p className="adm-err">{error}</p>}
        {eTab==="content" && <>
        <div className="adm-form-row">
          <label>العنوان *<input required value={form.title || ""} onChange={e => { set("title", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} /></label>
          <label>الرابط (slug)<input value={form.slug || ""} onChange={e => set("slug", e.target.value)} dir="ltr" /></label>
        </div>
        <label>الوصف المختصر<textarea value={form.excerpt || ""} onChange={e => set("excerpt", e.target.value)} rows={2} /></label>
        <label>المحتوى الكامل<textarea value={form.body || ""} onChange={e => set("body", e.target.value)} rows={8} /></label>
        <div className="adm-form-row">
          <label>رابط الصورة<input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} dir="ltr" /></label>
          <label>الموقع<input value={form.location || ""} onChange={e => set("location", e.target.value)} /></label>
        </div>
        <div className="adm-form-row">
          <label>اسم المنظِّم<input value={form.author_name || ""} onChange={e => set("author_name", e.target.value)} placeholder="اسم المنظم أو مقدم الفعالية" /></label>
          <label>الجهة المنظِّمة<input value={form.organizer || ""} onChange={e => set("organizer", e.target.value)} placeholder="الجهة أو المؤسسة المنظِّمة" /></label>
        </div>
        <label>صورة المنظِّم (رابط)<input value={form.author_image_url || ""} onChange={e => set("author_image_url", e.target.value)} dir="ltr" placeholder="https://..." /></label>
        <div className="adm-form-row">
          <label>تاريخ البداية *<input required type="datetime-local" value={(form.event_date || "").slice(0, 16)} onChange={e => set("event_date", e.target.value)} dir="ltr" /></label>
          <label>تاريخ النهاية<input type="datetime-local" value={(form.event_end_date || "").slice(0, 16)} onChange={e => set("event_end_date", e.target.value || null)} dir="ltr" /></label>
        </div>
        <label className="adm-toggle-label">
          <input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />
          نشر الفعالية
        </label>
        </>}
        {eTab==="seo" && <div style={{display:"flex",flexDirection:"column",gap:"1rem",padding:"0.25rem 0"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"0.78rem",fontWeight:700}}>عنوان SEO</span><span style={{fontSize:"0.7rem",color:"#94a3b8"}}>50–65 حرف</span></div>
            <input value={form.seo_title||""} onChange={e=>set("seo_title",e.target.value)} placeholder="عنوان الفعالية في محركات البحث (فارغ = استخدام العنوان تلقائياً)" />
            <span style={{fontSize:"0.72rem",color:(form.seo_title||form.title||"").length>=50&&(form.seo_title||form.title||"").length<=65?"#16a34a":"#d97706"}}>{(form.seo_title||form.title||"").length} / 65</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"0.78rem",fontWeight:700}}>وصف SEO</span><span style={{fontSize:"0.7rem",color:"#94a3b8"}}>120–160 حرف</span></div>
            <textarea rows={3} value={form.seo_description||""} onChange={e=>set("seo_description",e.target.value)} placeholder="وصف مختصر يظهر في نتائج البحث (فارغ = استخدام الوصف المختصر تلقائياً)" style={{resize:"vertical"}} />
            <span style={{fontSize:"0.72rem",color:(form.seo_description||form.excerpt||"").length>=120&&(form.seo_description||form.excerpt||"").length<=160?"#16a34a":"#d97706"}}>{(form.seo_description||form.excerpt||"").length} / 160</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
            <span style={{fontSize:"0.78rem",fontWeight:700}}>صورة المشاركة (OG Image)</span>
            <SeoImageUpload value={form.seo_image||""} onChange={url=>set("seo_image",url)} />
          </div>
        </div>}
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Settings Editor ──────────────────────────────────────────────────────────
function SettingsPanel() {
  const [rows, setRows] = useState<{ key: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) setRows(data);
    });
  }, []);

  const saveAll = async () => {
    setSaving(true);
    for (const row of rows) {
      await supabase.from("site_settings").upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head"><h2>إعدادات الموقع</h2></div>
      <div className="adm-settings-grid">
        {rows.map((row, i) => (
          <label key={row.key}>
            <span>{row.key}</span>
            <input value={row.value} onChange={e => setRows(r => r.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} dir="ltr" />
          </label>
        ))}
      </div>
      <button className="adm-btn-primary" onClick={saveAll} disabled={saving}>{saved ? "تم الحفظ" : saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>
    </div>
  );
}

// ─── Main Admin App ───────────────────────────────────────────────────────────
export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");
  const [section, setSection] = useState<Section>("dashboard");
  const [stats, setStats] = useState<Stats>({ news: 0, events: 0, members: 0, messages: 0, unread: 0, inquiries: 0, newInquiries: 0 });
  const [news, setNews] = useState<NewsRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [editNews, setEditNews] = useState<Partial<NewsRow> | null | undefined>(undefined);
  const [editEvent, setEditEvent] = useState<Partial<EventRow> | null | undefined>(undefined);
  const [confirmId, setConfirmId] = useState<{ table: string; id: string } | null>(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [search, setSearch] = useState("");

  const loadStats = async () => {
    const [n, ev, m, msg, inq] = await Promise.all([
      supabase.from("news").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id,read"),
      supabase.from("investment_inquiries").select("id,status"),
    ]);
    const unread = (msg.data ?? []).filter(x => !x.read).length;
    const newInquiries = (inq.data ?? []).filter(x => x.status === "new").length;
    setStats({ news: n.count ?? 0, events: ev.count ?? 0, members: m.count ?? 0, messages: msg.data?.length ?? 0, unread, inquiries: inq.data?.length ?? 0, newInquiries });
  };

  const loadNews = async () => {
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setNews(data ?? []);
  };

  const loadEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    setEvents(data ?? []);
  };

  const loadMembers = async () => {
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setMembers(data ?? []);
  };

  const loadMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data ?? []);
  };

  useEffect(() => {
    if (!authed) return;
    loadStats();
    if (section === "news") loadNews();
    if (section === "events") loadEvents();
    if (section === "members") loadMembers();
    if (section === "messages") loadMessages();
  }, [authed, section]);

  const deleteRow = async () => {
    if (!confirmId) return;
    await supabase.from(confirmId.table as "news" | "events").delete().eq("id", confirmId.id);
    setConfirmId(null);
    if (confirmId.table === "news") loadNews();
    if (confirmId.table === "events") loadEvents();
    loadStats();
  };

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    loadMessages();
    loadStats();
  };

  const updateMemberStatus = async (id: string, status: string) => {
    await supabase.from("members").update({ status }).eq("id", id);
    loadMembers();
  };

  const logout = () => { sessionStorage.removeItem("admin_auth"); setAuthed(false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const navItems: { key: Section; label: string; badge?: number }[] = [
    { key: "dashboard", label: "الرئيسية" },
    { key: "news", label: "الأخبار", badge: stats.news },
    { key: "events", label: "الفعاليات", badge: stats.events },
    { key: "members", label: "الأعضاء", badge: stats.members },
    { key: "messages", label: "الرسائل", badge: stats.unread || undefined },
    { key: "investment", label: "الاستثمار", badge: stats.newInquiries || undefined },
    { key: "culture", label: "الثقافة" },
    { key: "social", label: "الخدمات الاجتماعية" },
    { key: "contact", label: "تواصل معنا" },
    { key: "settings", label: "الإعدادات" },
  ];

  const filteredNews = news.filter(n => n.title.includes(search) || n.category.includes(search));
  const filteredEvents = events.filter(e => e.title.includes(search) || e.location.includes(search));
  const filteredMembers = members.filter(m => m.full_name.includes(search) || m.email.includes(search));
  const filteredMessages = messages.filter(m => m.name.includes(search) || m.subject.includes(search));


  return (
    <div className="adm-app" dir="rtl">
      {/* Sidebar */}
      <aside className={`adm-sidebar ${sideOpen ? "open" : ""}`}>
        <div className="adm-sidebar-brand">
          <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="شعار" />
          <span>لوحة التحكم</span>
        </div>
        <nav>
          {navItems.map(item => (
            <button
              key={item.key}
              className={section === item.key ? "active" : ""}
              onClick={() => { setSection(item.key); setSideOpen(false); setSearch(""); }}
            >
              {item.label}
              {item.badge ? <em>{item.badge}</em> : null}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" className="adm-view-site">عرض الموقع ↗</a>
          <button onClick={logout} className="adm-logout">تسجيل الخروج</button>
        </div>
      </aside>

      {/* Main */}
      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-hamburger" onClick={() => setSideOpen(!sideOpen)}>☰</button>
          <h1>{navItems.find(x => x.key === section)?.label}</h1>
          {["news", "events", "members", "messages", "investment"].includes(section) && (
            <input className="adm-search" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
          )}
        </header>

        <div className="adm-content">
          {/* ── Dashboard ── */}
          {section === "dashboard" && (
            <div className="adm-section">
              <div className="adm-stats-row">
                <StatCard label="الأخبار" value={stats.news} color="#2563eb" />
                <StatCard label="الفعاليات" value={stats.events} color="#16a34a" />
                <StatCard label="الأعضاء" value={stats.members} color="#9333ea" />
                <StatCard label="رسائل التواصل" value={stats.messages} color="#d97706" />
                <StatCard label="رسائل غير مقروءة" value={stats.unread} color="#dc2626" />
                <StatCard label="طلبات الاستثمار" value={stats.inquiries} color="#0891b2" />
                <StatCard label="طلبات جديدة" value={stats.newInquiries} color="#ea580c" />
              </div>
              <div className="adm-quick-links">
                {[
                  { label: "إضافة خبر جديد", action: () => { setSection("news"); setEditNews(null); } },
                  { label: "إضافة فعالية جديدة", action: () => { setSection("events"); setEditEvent(null); } },
                  { label: "عرض الرسائل", action: () => setSection("messages") },
                  { label: "إدارة الأعضاء", action: () => setSection("members") },
                ].map(link => (
                  <button key={link.label} className="adm-quick-btn" onClick={link.action}>{link.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── News ── */}
          {section === "news" && (
            <div className="adm-section">
              <div className="adm-section-head">
                <h2>الأخبار ({filteredNews.length})</h2>
                <button className="adm-btn-primary" onClick={() => setEditNews(null)}>+ إضافة خبر</button>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>الصورة</th><th>العنوان</th><th>التصنيف</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {filteredNews.map(row => (
                      <tr key={row.id}>
                        <td>{row.image_url ? <img src={row.image_url} alt="" className="adm-thumb" /> : <span className="adm-no-img">لا توجد صورة</span>}</td>
                        <td><b>{row.title}</b><small dir="ltr">/{row.slug}</small></td>
                        <td><span className="adm-tag">{row.category}</span></td>
                        <td><span className={`adm-status ${row.published ? "published" : "draft"}`}>{row.published ? "منشور" : "مسودة"}</span></td>
                        <td>{formatDate(row.created_at)}</td>
                        <td>
                          <button className="adm-btn-edit" onClick={() => setEditNews(row)}>تعديل</button>
                          <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "news", id: row.id })}>حذف</button>
                          {row.published && <a className="adm-btn-view" href={`/news/${row.slug}`} target="_blank">عرض</a>}
                        </td>
                      </tr>
                    ))}
                    {filteredNews.length === 0 && <tr><td colSpan={6} className="adm-empty">لا توجد أخبار</td></tr>}
                  </tbody>
                </table>
              </div>
              {editNews !== undefined && <NewsEditor item={editNews} onSave={() => { setEditNews(undefined); loadNews(); loadStats(); }} onCancel={() => setEditNews(undefined)} />}
            </div>
          )}

          {/* ── Events ── */}
          {section === "events" && (
            <div className="adm-section">
              <div className="adm-section-head">
                <h2>الفعاليات ({filteredEvents.length})</h2>
                <button className="adm-btn-primary" onClick={() => setEditEvent(null)}>+ إضافة فعالية</button>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>الصورة</th><th>العنوان</th><th>الموقع</th><th>التاريخ</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {filteredEvents.map(row => (
                      <tr key={row.id}>
                        <td>{row.image_url ? <img src={row.image_url} alt="" className="adm-thumb" /> : <span className="adm-no-img">لا توجد صورة</span>}</td>
                        <td><b>{row.title}</b><small dir="ltr">/{row.slug}</small></td>
                        <td>{row.location || "-"}</td>
                        <td>{formatDate(row.event_date)}</td>
                        <td><span className={`adm-status ${row.published ? "published" : "draft"}`}>{row.published ? "منشورة" : "مسودة"}</span></td>
                        <td>
                          <button className="adm-btn-edit" onClick={() => setEditEvent(row)}>تعديل</button>
                          <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "events", id: row.id })}>حذف</button>
                          {row.published && <a className="adm-btn-view" href={`/events/${row.slug}`} target="_blank">عرض</a>}
                        </td>
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && <tr><td colSpan={6} className="adm-empty">لا توجد فعاليات</td></tr>}
                  </tbody>
                </table>
              </div>
              {editEvent !== undefined && <EventEditor item={editEvent} onSave={() => { setEditEvent(undefined); loadEvents(); loadStats(); }} onCancel={() => setEditEvent(undefined)} />}
            </div>
          )}

          {/* ── Members ── */}
          {section === "members" && <AdminMembersPanel />}

          {/* ── Messages ── */}
          {section === "messages" && (
            <div className="adm-section">
              <div className="adm-section-head"><h2>رسائل التواصل ({filteredMessages.length})</h2></div>
              <div className="adm-messages-list">
                {filteredMessages.map(row => (
                  <div key={row.id} className={`adm-msg ${row.read ? "read" : "unread"}`}>
                    <div className="adm-msg-head">
                      <b>{row.name}</b>
                      <span dir="ltr">{row.email}</span>
                      <small>{formatDate(row.created_at)}</small>
                      {!row.read && <button className="adm-btn-edit" onClick={() => markRead(row.id)}>تمييز كمقروء</button>}
                    </div>
                    {row.subject && <p className="adm-msg-subject">{row.subject}</p>}
                    <p className="adm-msg-body">{row.message}</p>
                    {row.phone && <small dir="ltr">الجوال: {row.phone}</small>}
                  </div>
                ))}
                {filteredMessages.length === 0 && <p className="adm-empty">لا توجد رسائل</p>}
              </div>
            </div>
          )}

          {/* ── Investment ── */}
          {section === "investment" && <InvestmentPanel />}
          {section === "culture" && <CulturePanel />}
          {section === "social" && <SocialPanel />}
          {section === "contact" && <AdminContact />}


          {/* ── Settings ── */}
          {section === "settings" && <SettingsPanel />}
        </div>
      </div>

      {/* Confirm Delete */}
      {confirmId && (
        <Confirm
          message="هل أنت متأكد من الحذف؟ لا يمكن التراجع."
          onConfirm={deleteRow}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {sideOpen && <div className="adm-overlay-bg" onClick={() => setSideOpen(false)} />}
    </div>
  );
}
