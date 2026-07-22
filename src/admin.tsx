import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { AdminSection, Stats } from "./admin-types";
import { formatDate } from "./admin-utils";
import AdminNewsSection from "./admin-news";
import AdminEventsSection from "./admin-events";
import AdminPagesSection from "./admin-pages";
import AdminSeoSection from "./admin-seo";
import AdminMembersSection from "./admin-members";
import AdminMessagesSection from "./admin-messages";
import AdminGallerySection from "./admin-gallery";
import AdminSettingsSection from "./admin-settings";

const ADMIN_PASSWORD = "admin2024";

const NAV: { key: AdminSection; label: string; icon: string }[] = [
  { key: "dashboard", label: "لوحة المعلومات", icon: "⊞" },
  { key: "news",      label: "الأخبار",          icon: "◉" },
  { key: "events",    label: "الفعاليات",         icon: "◈" },
  { key: "pages",     label: "الصفحات",           icon: "▣" },
  { key: "seo",       label: "إعدادات SEO",       icon: "◎" },
  { key: "members",   label: "الأعضاء",           icon: "◉" },
  { key: "messages",  label: "الرسائل",           icon: "◫" },
  { key: "gallery",   label: "المعرض",            icon: "⊡" },
  { key: "settings",  label: "الإعدادات",         icon: "⚙" },
];

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
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
          <input type="password" placeholder="كلمة المرور" value={pw}
            onChange={e => { setPw(e.target.value); setErr(false); }}
            className={err ? "adm-input-err" : ""} autoFocus />
          {err && <span className="adm-err-msg">كلمة المرور غير صحيحة</span>}
          <button type="submit" className="adm-login-btn">دخول</button>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, onClick }:
  { label: string; value: number | string; sub?: string; color: string; onClick?: () => void }) {
  return (
    <div className="adm-stat-card" style={{ borderTop: `4px solid ${color}` }} onClick={onClick}>
      <div className="adm-stat-val" style={{ color }}>{value}</div>
      <div className="adm-stat-label">{label}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ stats, setSection, recentNews, recentMembers }:
  { stats: Stats; setSection: (s: AdminSection) => void; recentNews: any[]; recentMembers: any[] }) {
  return (
    <div className="adm-dashboard">
      <div className="adm-dash-stats">
        <StatCard label="إجمالي الأخبار" value={stats.news} color="#2563eb" onClick={() => setSection("news")} />
        <StatCard label="الفعاليات" value={stats.events} color="#059669" onClick={() => setSection("events")} />
        <StatCard label="الأعضاء" value={stats.members} sub={stats.pendingMembers > 0 ? `${stats.pendingMembers} معلق` : undefined} color="#7c3aed" onClick={() => setSection("members")} />
        <StatCard label="الرسائل" value={stats.messages} sub={stats.unread > 0 ? `${stats.unread} غير مقروء` : undefined} color="#d97706" onClick={() => setSection("messages")} />
        <StatCard label="صور المعرض" value={stats.gallery} color="#0891b2" onClick={() => setSection("gallery")} />
        <StatCard label="الصفحات" value={stats.pages} color="#be123c" onClick={() => setSection("pages")} />
      </div>

      <div className="adm-dash-grid">
        <div className="adm-dash-card">
          <div className="adm-dash-card-head">
            <h3>آخر الأخبار</h3>
            <button onClick={() => setSection("news")}>عرض الكل</button>
          </div>
          {recentNews.length === 0 && <p className="adm-empty-note">لا توجد أخبار بعد</p>}
          {recentNews.map(n => (
            <div key={n.id} className="adm-dash-row">
              {n.image_url && <img src={n.image_url} alt="" className="adm-dash-thumb" />}
              <div className="adm-dash-row-info">
                <b>{n.title}</b>
                <small>{formatDate(n.created_at)} · <span className={`adm-pill ${n.published ? "green" : "gray"}`}>{n.published ? "منشور" : "مسودة"}</span></small>
              </div>
            </div>
          ))}
        </div>

        <div className="adm-dash-card">
          <div className="adm-dash-card-head">
            <h3>آخر الأعضاء</h3>
            <button onClick={() => setSection("members")}>عرض الكل</button>
          </div>
          {recentMembers.length === 0 && <p className="adm-empty-note">لا يوجد أعضاء بعد</p>}
          {recentMembers.map(m => (
            <div key={m.id} className="adm-dash-row">
              <div className="adm-dash-avatar">{m.full_name?.[0] ?? "؟"}</div>
              <div className="adm-dash-row-info">
                <b>{m.full_name}</b>
                <small>{m.membership_type} · <span className={`adm-pill ${m.status === "active" ? "green" : m.status === "pending" ? "yellow" : "red"}`}>{m.status === "active" ? "نشط" : m.status === "pending" ? "معلق" : "مرفوض"}</span></small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-quick-actions">
        <h3>إجراءات سريعة</h3>
        <div className="adm-quick-btns">
          {[
            { label: "+ إضافة خبر", action: () => setSection("news") },
            { label: "+ إضافة فعالية", action: () => setSection("events") },
            { label: "+ صفحة جديدة", action: () => setSection("pages") },
            { label: "إعدادات SEO", action: () => setSection("seo") },
            { label: "إدارة الأعضاء", action: () => setSection("members") },
            { label: "قراءة الرسائل", action: () => setSection("messages") },
          ].map(q => <button key={q.label} className="adm-quick-btn" onClick={q.action}>{q.label}</button>)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin App ───────────────────────────────────────────────────────────
export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({ news: 0, events: 0, members: 0, pendingMembers: 0, messages: 0, unread: 0, gallery: 0, pages: 0 });
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [badges, setBadges] = useState<Partial<Record<AdminSection, number>>>({});

  const loadDashboard = async () => {
    const [n, ev, m, msg, gal, pg] = await Promise.all([
      supabase.from("news").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("members").select("id,status", { count: "exact" }),
      supabase.from("contact_messages").select("id,read"),
      supabase.from("gallery_items").select("id", { count: "exact", head: true }),
      supabase.from("pages").select("id", { count: "exact", head: true }),
    ]);
    const pending = (m.data ?? []).filter(x => x.status === "pending").length;
    const unread = (msg.data ?? []).filter(x => !x.read).length;
    setStats({ news: n.count ?? 0, events: ev.count ?? 0, members: m.count ?? 0, pendingMembers: pending, messages: msg.data?.length ?? 0, unread, gallery: gal.count ?? 0, pages: pg.count ?? 0 });
    setBadges({ members: pending || undefined, messages: unread || undefined } as any);
    const { data: rn } = await supabase.from("news").select("id,title,image_url,published,created_at").order("created_at", { ascending: false }).limit(5);
    setRecentNews(rn ?? []);
    const { data: rm } = await supabase.from("members").select("id,full_name,membership_type,status").order("created_at", { ascending: false }).limit(5);
    setRecentMembers(rm ?? []);
  };

  useEffect(() => { if (authed) loadDashboard(); }, [authed]);

  const logout = () => { sessionStorage.removeItem("admin_auth"); setAuthed(false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const activeLabel = NAV.find(x => x.key === section)?.label ?? "";

  return (
    <div className="adm-app" dir="rtl">
      {/* Sidebar */}
      <aside className={`adm-sidebar${sideOpen ? " open" : ""}`}>
        <div className="adm-sidebar-brand">
          <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="" />
          <div>
            <span className="adm-sidebar-title">لوحة التحكم</span>
            <span className="adm-sidebar-sub">رابطة نهر النيل</span>
          </div>
        </div>
        <nav className="adm-sidebar-nav">
          {NAV.map(item => (
            <button key={item.key}
              className={`adm-nav-btn${section === item.key ? " active" : ""}`}
              onClick={() => { setSection(item.key); setSideOpen(false); }}>
              <span className="adm-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {badges[item.key] ? <em className="adm-nav-badge">{badges[item.key]}</em> : null}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <a href="/" className="adm-site-link">← عرض الموقع</a>
          <button className="adm-logout-btn" onClick={logout}>تسجيل الخروج</button>
        </div>
      </aside>

      {/* Main */}
      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-hamburger" onClick={() => setSideOpen(v => !v)}>☰</button>
          <div className="adm-topbar-title">
            <h1>{activeLabel}</h1>
          </div>
          <div className="adm-topbar-right">
            {badges.messages ? <span className="adm-topbar-badge">{badges.messages} رسالة جديدة</span> : null}
            <span className="adm-topbar-user">المدير</span>
          </div>
        </header>

        <div className="adm-content">
          {section === "dashboard" && (
            <Dashboard stats={stats} setSection={s => { setSection(s); }} recentNews={recentNews} recentMembers={recentMembers} />
          )}
          {section === "news"     && <AdminNewsSection onStatsChange={loadDashboard} />}
          {section === "events"   && <AdminEventsSection onStatsChange={loadDashboard} />}
          {section === "pages"    && <AdminPagesSection onStatsChange={loadDashboard} />}
          {section === "seo"      && <AdminSeoSection />}
          {section === "members"  && <AdminMembersSection onStatsChange={loadDashboard} />}
          {section === "messages" && <AdminMessagesSection onStatsChange={loadDashboard} />}
          {section === "gallery"  && <AdminGallerySection onStatsChange={loadDashboard} />}
          {section === "settings" && <AdminSettingsSection />}
        </div>
      </div>

      {sideOpen && <div className="adm-sidebar-overlay" onClick={() => setSideOpen(false)} />}
    </div>
  );
}
