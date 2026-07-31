import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { invalidateSeoCache, type SeoData } from "./useSeo";
import { Search, Globe as Globe2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, TriangleAlert as AlertTriangle, Save, X, ChevronRight, Eye, ChartBar as BarChart3, RefreshCw, ExternalLink, Upload } from "lucide-react";

// ── score ──────────────────────────────────────────────────────────────────────
function calcScore(d: SeoData): number {
  let s = 0;
  if (d.title) { s += 20; if (d.title.length >= 40 && d.title.length <= 65) s += 10; }
  if (d.description) { s += 20; if (d.description.length >= 100 && d.description.length <= 165) s += 10; }
  if (d.keywords) s += 10;
  if (d.og_image) s += 15;
  if (d.og_title) s += 5;
  if (d.og_description) s += 5;
  if (d.robots && d.robots !== "") s += 5;
  return Math.min(s, 100);
}

function scoreColor(n: number) {
  if (n >= 75) return "#16a34a";
  if (n >= 50) return "#d97706";
  return "#dc2626";
}

function scoreBg(n: number) {
  if (n >= 75) return "#f0fdf4";
  if (n >= 50) return "#fffbeb";
  return "#fff0f0";
}

function ScoreBadge({ score }: { score: number }) {
  const c = scoreColor(score);
  const b = scoreBg(score);
  const Icon = score >= 75 ? CheckCircle2 : score >= 50 ? AlertTriangle : AlertCircle;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: b, color: c, borderRadius: 6, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${c}30` }}>
      <Icon size={12} /> {score}
    </span>
  );
}

// ── char counter ───────────────────────────────────────────────────────────────
function CharCounter({ len, min, max }: { len: number; min: number; max: number }) {
  const ok = len >= min && len <= max;
  const over = len > max;
  const color = ok ? "#16a34a" : over ? "#dc2626" : "#d97706";
  return (
    <span style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>
      {len} / {max} {ok ? "✓" : over ? "تجاوز الحد" : `(مثالي ${min}–${max})`}
    </span>
  );
}

// ── Google preview ─────────────────────────────────────────────────────────────
function GooglePreview({ title, description, url }: { title: string; description: string; url: string }) {
  const displayUrl = url || "https://nilelink.org/page";
  const displayTitle = title || "عنوان الصفحة";
  const displayDesc = description || "وصف الصفحة يظهر هنا في نتائج البحث...";
  return (
    <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem", fontFamily: "Arial, sans-serif" }}>
      <p style={{ fontSize: "0.7rem", color: "#202124", margin: "0 0 0.15rem", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 18, height: 18, background: "#4285f4", borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>ن</span>
        <span style={{ color: "#202124", fontSize: "0.78rem" }}>نهر النيل</span>
        <ChevronRight size={11} color="#5f6368" />
        <span style={{ color: "#5f6368", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayUrl}</span>
      </p>
      <p style={{ fontSize: "1.15rem", color: "#1a0dab", margin: "0.2rem 0 0.15rem", fontWeight: 400, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
        {displayTitle.length > 60 ? displayTitle.slice(0, 60) + "…" : displayTitle}
      </p>
      <p style={{ fontSize: "0.82rem", color: "#4d5156", margin: 0, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {displayDesc.length > 160 ? displayDesc.slice(0, 160) + "…" : displayDesc}
      </p>
    </div>
  );
}

// ── OG card preview ────────────────────────────────────────────────────────────
function OGPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden", background: "#fff" }}>
      {image ? (
        <img src={image} alt="OG" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <div style={{ width: "100%", height: 120, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Globe2 size={40} color="rgba(255,255,255,0.4)" />
        </div>
      )}
      <div style={{ padding: "0.85rem 1rem", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{url || "nilelink.org"}</p>
        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title || "عنوان المشاركة"}</p>
        <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{description || "وصف عند المشاركة على وسائل التواصل"}</p>
      </div>
    </div>
  );
}

// ── Field component ─────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>{label}</span>
        {hint && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.6rem 0.85rem",
  fontSize: "0.88rem", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  transition: "border 0.2s",
};

const ROBOTS_OPTIONS = ["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"];
const OG_TYPES = ["website", "article", "profile", "book", "music.song", "video.movie"];
const TWITTER_CARDS = ["summary_large_image", "summary", "player", "app"];
const SCHEMA_TYPES = ["WebPage", "WebSite", "AboutPage", "ContactPage", "Blog", "NewsArticle", "Event", "EventSeries", "Person", "Organization", "EducationalOrganization", "MedicalOrganization"];

// ── Edit panel ─────────────────────────────────────────────────────────────────
function EditPanel({ page, onSave, onClose }: { page: SeoData; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState<SeoData>({ ...page });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"basic" | "og" | "technical" | "preview">("basic");

  const set = (k: keyof SeoData, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const score = calcScore(form);

  const save = async () => {
    setSaving(true);
    await supabase.from("page_seo").update({
      title: form.title, description: form.description, keywords: form.keywords,
      og_title: form.og_title, og_description: form.og_description, og_image: form.og_image,
      og_type: form.og_type, canonical_url: form.canonical_url, robots: form.robots,
      twitter_card: form.twitter_card, schema_type: form.schema_type,
      updated_at: new Date().toISOString(),
    }).eq("page_slug", form.page_slug);
    invalidateSeoCache(form.page_slug);
    setSaving(false);
    onSave();
  };

  const tabs = [
    { id: "basic" as const, label: "SEO الأساسي" },
    { id: "og" as const, label: "Open Graph" },
    { id: "technical" as const, label: "تقني" },
    { id: "preview" as const, label: "معاينة" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div dir="rtl" style={{ position: "relative", background: "#fff", width: "min(780px, 100vw)", height: "100vh", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", margin: "0 0 0.2rem" }}>{form.page_url}</p>
            <h3 style={{ color: "#fff", margin: 0, fontSize: "1rem", fontWeight: 800 }}>{form.page_label}</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${scoreColor(score)}`, background: scoreBg(score), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.9rem", color: scoreColor(score) }}>
                {score}
              </div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", marginTop: 2 }}>SEO Score</span>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "0.4rem", padding: "0.4rem", cursor: "pointer", display: "flex", color: "#fff" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic badge */}
        {form.is_dynamic && (
          <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={14} color="#d97706" />
            <span style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: 600 }}>
              هذا قالب لصفحات ديناميكية — هذه القيم تُستخدم كافتراضيات عند تعذّر جلب SEO خاص بالمحتوى.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e2e8f0", flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent", marginBottom: -2, padding: "0.75rem 0.5rem", fontWeight: tab === t.id ? 800 : 500, color: tab === t.id ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: "0.83rem", fontFamily: "inherit", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>

          {/* ── BASIC ── */}
          {tab === "basic" && <>
            <Field label="عنوان الصفحة (Title Tag)" hint="50 – 65 حرف مثالي">
              <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="عنوان الصفحة | اسم الموقع"
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              <CharCounter len={form.title.length} min={50} max={65} />
            </Field>

            <Field label="وصف الصفحة (Meta Description)" hint="120 – 160 حرف مثالي">
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="وصف مختصر يظهر في نتائج البحث…"
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              <CharCounter len={form.description.length} min={120} max={160} />
            </Field>

            <Field label="الكلمات المفتاحية (Keywords)" hint="مفصولة بفاصلة">
              <input style={inputStyle} value={form.keywords} onChange={e => set("keywords", e.target.value)}
                placeholder="كلمة, كلمة أخرى, …"
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                عدد الكلمات: {form.keywords ? form.keywords.split(",").filter(Boolean).length : 0}
              </span>
            </Field>

            {/* Google preview inline */}
            <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}>
                <Search size={13} /> معاينة Google
              </p>
              <GooglePreview title={form.title} description={form.description} url={form.canonical_url || `https://nilelink.org${form.page_url}`} />
            </div>
          </>}

          {/* ── OG ── */}
          {tab === "og" && <>
            <Field label="OG Title (عنوان المشاركة)" hint="يُستخدم عند مشاركة الصفحة على تويتر وفيسبوك">
              <input style={inputStyle} value={form.og_title} onChange={e => set("og_title", e.target.value)}
                placeholder="اتركه فارغاً لاستخدام عنوان الصفحة تلقائياً"
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              <CharCounter len={(form.og_title || form.title).length} min={40} max={95} />
            </Field>

            <Field label="OG Description (وصف المشاركة)">
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.og_description}
                onChange={e => set("og_description", e.target.value)}
                placeholder="اتركه فارغاً لاستخدام وصف الصفحة تلقائياً"
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              <CharCounter len={(form.og_description || form.description).length} min={100} max={200} />
            </Field>

            <Field label="OG Image (صورة المشاركة)" hint="مقاسات مثالية 1200×630 px">
              <SeoImageUpload value={form.og_image} onChange={url => set("og_image", url)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <Field label="OG Type">
                <select style={{ ...inputStyle, background: "#fff", appearance: "none" }} value={form.og_type} onChange={e => set("og_type", e.target.value)}>
                  {OG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Twitter Card">
                <select style={{ ...inputStyle, background: "#fff", appearance: "none" }} value={form.twitter_card} onChange={e => set("twitter_card", e.target.value)}>
                  {TWITTER_CARDS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            {/* OG preview */}
            <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={13} /> معاينة بطاقة المشاركة
              </p>
              <OGPreview
                title={form.og_title || form.title}
                description={form.og_description || form.description}
                image={form.og_image}
                url={form.canonical_url || `nilelink.org${form.page_url}`}
              />
            </div>
          </>}

          {/* ── TECHNICAL ── */}
          {tab === "technical" && <>
            <Field label="Robots" hint="تحكم في فهرسة محركات البحث">
              <select style={{ ...inputStyle, background: "#fff", appearance: "none" }} value={form.robots} onChange={e => set("robots", e.target.value)}>
                {ROBOTS_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.25rem 0 0" }}>
                {form.robots === "index, follow" && "تُفهرس الصفحة وتتبع الروابط — الخيار الافتراضي والمفضل لمعظم الصفحات."}
                {form.robots === "noindex, follow" && "لا تُفهرس الصفحة ولكن تتبع الروابط — مفيد لصفحات النتائج والبحث."}
                {form.robots === "index, nofollow" && "تُفهرس الصفحة لكن لا تتبع روابطها."}
                {form.robots === "noindex, nofollow" && "لا تُفهرس ولا تتبع الروابط — للصفحات الخاصة كالتسجيل والدفع."}
              </p>
            </Field>

            <Field label="Canonical URL" hint="للمساعدة في تجنب المحتوى المكرر">
              <input style={{ ...inputStyle, direction: "ltr" }} value={form.canonical_url} onChange={e => set("canonical_url", e.target.value)}
                placeholder={`https://nilelink.org${form.page_url}`}
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                اتركه فارغاً لاستخدام رابط الصفحة الحالي تلقائياً
              </span>
            </Field>

            <Field label="Schema Type (JSON-LD)" hint="نوع البيانات المنظمة">
              <select style={{ ...inputStyle, background: "#fff", appearance: "none" }} value={form.schema_type} onChange={e => set("schema_type", e.target.value)}>
                {SCHEMA_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            {/* SEO checklist */}
            <div style={{ background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}><BarChart3 size={14} /> قائمة مراجعة SEO</p>
              {[
                { label: "عنوان الصفحة موجود", ok: !!form.title },
                { label: "العنوان بين 50 و 65 حرفاً", ok: form.title.length >= 50 && form.title.length <= 65 },
                { label: "الوصف موجود", ok: !!form.description },
                { label: "الوصف بين 120 و 160 حرفاً", ok: form.description.length >= 120 && form.description.length <= 160 },
                { label: "كلمات مفتاحية مضافة", ok: !!form.keywords },
                { label: "صورة OG موجودة", ok: !!form.og_image },
                { label: "إعداد Robots صحيح", ok: !!form.robots },
                { label: "نوع Schema محدد", ok: !!form.schema_type },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.35rem 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: item.ok ? "#16a34a" : "#e2e8f0", flexShrink: 0 }}>
                    <CheckCircle2 size={15} fill={item.ok ? "#16a34a" : "none"} />
                  </span>
                  <span style={{ fontSize: "0.82rem", color: item.ok ? "#374151" : "#94a3b8" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </>}

          {/* ── PREVIEW ── */}
          {tab === "preview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}><Search size={14} /> نتائج Google</p>
                <GooglePreview title={form.title} description={form.description} url={form.canonical_url || `https://nilelink.org${form.page_url}`} />
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}><ExternalLink size={14} /> بطاقة المشاركة الاجتماعية</p>
                <OGPreview title={form.og_title || form.title} description={form.og_description || form.description} image={form.og_image} url={form.canonical_url || `nilelink.org${form.page_url}`} />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem 1.25rem" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.5rem" }}>ملخص الإعدادات الحالية</p>
                {[["الصفحة", form.page_label], ["رابط الصفحة", form.page_url], ["Robots", form.robots], ["OG Type", form.og_type], ["Twitter Card", form.twitter_card], ["Schema", form.schema_type]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.8rem" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{k}</span>
                    <span style={{ color: "#0f172a", direction: "ltr", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer save */}
        <div style={{ borderTop: "1px solid #e2e8f0", padding: "1rem 1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexShrink: 0, background: "#f8fafc" }}>
          <button onClick={onClose} style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>إغلاق</button>
          <button onClick={save} disabled={saving} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1.75rem", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.5rem", opacity: saving ? 0.7 : 1 }}>
            <Save size={15} />{saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── SEO Image Upload (shared across all SEO forms) ───────────────────────────
export function SeoImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `seo/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: unknown) {
      console.error(e);
      setErr("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {value && (
        <div style={{ position: "relative" }}>
          <img src={value} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: "0.5rem", border: "1px solid #e2e8f0", display: "block" }} />
          <button type="button" onClick={() => onChange("")} style={{ position: "absolute", top: 6, insetInlineEnd: 6, background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      )}
      {!value && (
        <div onClick={() => !uploading && ref.current?.click()}
          style={{ border: "2px dashed #e2e8f0", borderRadius: "0.5rem", padding: "1.25rem", textAlign: "center", cursor: uploading ? "not-allowed" : "pointer", background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
          {uploading
            ? <span style={{ fontSize: "0.82rem", color: "#64748b" }}>جاري الرفع...</span>
            : <>
                <Upload size={20} color="#94a3b8" />
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>اضغط لرفع صورة من جهازك</span>
                <span style={{ fontSize: "0.71rem", color: "#94a3b8" }}>PNG، JPG، WebP — مقاس مثالي 1200×630</span>
              </>}
        </div>
      )}
      {err && <span style={{ color: "#dc2626", fontSize: "0.78rem" }}>{err}</span>}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="أو الصق رابط الصورة مباشرةً..." dir="ltr"
          style={{ ...inputStyle, flex: 1, fontSize: "0.8rem" }}
          onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.45rem", padding: "0 1rem", cursor: uploading ? "not-allowed" : "pointer", fontSize: "0.8rem", fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem", opacity: uploading ? 0.7 : 1 }}>
          <Upload size={14} />{uploading ? "..." : "رفع"}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Inline tab content (used inside section admins) ───────────────────────────
export function SeoTabContent({ slug }: { slug: string }) {
  const [form, setForm] = useState<SeoData | null>(null);
  const [tab, setTab] = useState<"basic" | "og" | "technical" | "preview">("basic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("page_seo").select("*").eq("page_slug", slug).maybeSingle().then(({ data: d }) => {
      if (d) setForm(d as SeoData);
    });
  }, [slug]);

  const set = (k: keyof SeoData, v: string | boolean) => setForm(f => f ? { ...f, [k]: v } : f);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    await supabase.from("page_seo").update({
      title: form.title, description: form.description, keywords: form.keywords,
      og_title: form.og_title, og_description: form.og_description, og_image: form.og_image,
      og_type: form.og_type, canonical_url: form.canonical_url, robots: form.robots,
      twitter_card: form.twitter_card, schema_type: form.schema_type,
      updated_at: new Date().toISOString(),
    }).eq("page_slug", form.page_slug);
    invalidateSeoCache(form.page_slug);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!form) return <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>جاري التحميل...</div>;

  const score = calcScore(form);
  const tabList = [
    { id: "basic" as const, label: "SEO الأساسي" },
    { id: "og" as const, label: "Open Graph" },
    { id: "technical" as const, label: "تقني" },
    { id: "preview" as const, label: "معاينة" },
  ];

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* score bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#f8fafc", borderRadius: "0.75rem", padding: "0.85rem 1.25rem", border: "1px solid #e2e8f0" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${scoreColor(score)}`, background: scoreBg(score), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1rem", color: scoreColor(score), flexShrink: 0 }}>{score}</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>درجة SEO للصفحة</p>
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>{form.page_label} — <span dir="ltr">{form.page_url}</span></p>
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* sub-tabs */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "0.65rem", padding: "0.25rem" }}>
        {tabList.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} type="button" style={{ flex: 1, background: tab === t.id ? "#fff" : "transparent", border: "none", borderRadius: "0.45rem", padding: "0.6rem 0.5rem", fontWeight: tab === t.id ? 800 : 500, color: tab === t.id ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit", transition: "all 0.15s", boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basic" && <>
        <Field label="عنوان الصفحة (Title Tag)" hint="50–65 حرف مثالي">
          <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="عنوان الصفحة | اسم الموقع" onFocus={e=>(e.target.style.borderColor="#2563eb")} onBlur={e=>(e.target.style.borderColor="#e2e8f0")} />
          <CharCounter len={form.title.length} min={50} max={65} />
        </Field>
        <Field label="وصف الصفحة (Meta Description)" hint="120–160 حرف مثالي">
          <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="وصف مختصر يظهر في نتائج البحث…" onFocus={e=>(e.target.style.borderColor="#2563eb")} onBlur={e=>(e.target.style.borderColor="#e2e8f0")} />
          <CharCounter len={form.description.length} min={120} max={160} />
        </Field>
        <Field label="الكلمات المفتاحية" hint="مفصولة بفاصلة">
          <input style={inputStyle} value={form.keywords} onChange={e => set("keywords", e.target.value)} placeholder="كلمة, كلمة أخرى, …" onFocus={e=>(e.target.style.borderColor="#2563eb")} onBlur={e=>(e.target.style.borderColor="#e2e8f0")} />
        </Field>
        <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}><Search size={13} /> معاينة Google</p>
          <GooglePreview title={form.title} description={form.description} url={form.canonical_url || `https://nilelink.org${form.page_url}`} />
        </div>
      </>}

      {tab === "og" && <>
        <Field label="OG Title" hint="عنوان المشاركة على السوشيال">
          <input style={inputStyle} value={form.og_title} onChange={e => set("og_title", e.target.value)} placeholder="اتركه فارغاً لاستخدام العنوان تلقائياً" onFocus={e=>(e.target.style.borderColor="#2563eb")} onBlur={e=>(e.target.style.borderColor="#e2e8f0")} />
          <CharCounter len={(form.og_title || form.title).length} min={40} max={95} />
        </Field>
        <Field label="OG Description">
          <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.og_description} onChange={e => set("og_description", e.target.value)} placeholder="اتركه فارغاً لاستخدام الوصف تلقائياً" onFocus={e=>(e.target.style.borderColor="#2563eb")} onBlur={e=>(e.target.style.borderColor="#e2e8f0")} />
        </Field>
        <Field label="OG Image (1200×630 px)">
          <SeoImageUpload value={form.og_image} onChange={url => set("og_image", url)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          <Field label="OG Type"><select style={{ ...inputStyle, background: "#fff" }} value={form.og_type} onChange={e => set("og_type", e.target.value)}>{OG_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Twitter Card"><select style={{ ...inputStyle, background: "#fff" }} value={form.twitter_card} onChange={e => set("twitter_card", e.target.value)}>{TWITTER_CARDS.map(t => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}><Eye size={13} /> معاينة بطاقة المشاركة</p>
          <OGPreview title={form.og_title || form.title} description={form.og_description || form.description} image={form.og_image} url={form.canonical_url || `nilelink.org${form.page_url}`} />
        </div>
      </>}

      {tab === "technical" && <>
        <Field label="Robots">
          <select style={{ ...inputStyle, background: "#fff" }} value={form.robots} onChange={e => set("robots", e.target.value)}>{ROBOTS_OPTIONS.map(r => <option key={r}>{r}</option>)}</select>
        </Field>
        <Field label="Canonical URL">
          <input style={{ ...inputStyle, direction: "ltr" }} value={form.canonical_url} onChange={e => set("canonical_url", e.target.value)} placeholder={`https://nilelink.org${form.page_url}`} onFocus={e=>(e.target.style.borderColor="#2563eb")} onBlur={e=>(e.target.style.borderColor="#e2e8f0")} />
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>اتركه فارغاً لاستخدام رابط الصفحة تلقائياً</span>
        </Field>
        <Field label="Schema Type">
          <select style={{ ...inputStyle, background: "#fff" }} value={form.schema_type} onChange={e => set("schema_type", e.target.value)}>{SCHEMA_TYPES.map(s => <option key={s}>{s}</option>)}</select>
        </Field>
        <div style={{ background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: 6 }}><BarChart3 size={14} /> قائمة مراجعة</p>
          {[
            { label: "عنوان موجود", ok: !!form.title }, { label: "العنوان 50–65 حرفاً", ok: form.title.length >= 50 && form.title.length <= 65 },
            { label: "وصف موجود", ok: !!form.description }, { label: "الوصف 120–160 حرفاً", ok: form.description.length >= 120 && form.description.length <= 160 },
            { label: "كلمات مفتاحية", ok: !!form.keywords }, { label: "صورة OG", ok: !!form.og_image },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.3rem 0", borderBottom: "1px solid #f1f5f9" }}>
              <CheckCircle2 size={15} color={item.ok ? "#16a34a" : "#e2e8f0"} fill={item.ok ? "#16a34a" : "none"} />
              <span style={{ fontSize: "0.82rem", color: item.ok ? "#374151" : "#94a3b8" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </>}

      {tab === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.75rem" }}>نتائج Google</p>
            <GooglePreview title={form.title} description={form.description} url={form.canonical_url || `https://nilelink.org${form.page_url}`} />
          </div>
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", margin: "0 0 0.75rem" }}>بطاقة المشاركة</p>
            <OGPreview title={form.og_title || form.title} description={form.og_description || form.description} image={form.og_image} url={`nilelink.org${form.page_url}`} />
          </div>
        </div>
      )}

      {/* save */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
        {saved && <span style={{ color: "#16a34a", fontSize: "0.82rem", fontWeight: 700, alignSelf: "center" }}>تم الحفظ ✓</span>}
        <button onClick={save} disabled={saving} type="button" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 2rem", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.5rem", opacity: saving ? 0.7 : 1 }}>
          <Save size={15} />{saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function AdminSeo() {
  const [pages, setPages] = useState<SeoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SeoData | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "static" | "dynamic">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("page_seo").select("*").order("is_dynamic").order("page_label");
    setPages((data ?? []) as SeoData[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const shown = pages.filter(p => {
    const matchSearch = !search || p.page_label.includes(search) || p.page_url.includes(search) || p.page_slug.includes(search);
    const matchFilter = filter === "all" || (filter === "static" && !p.is_dynamic) || (filter === "dynamic" && p.is_dynamic);
    return matchSearch && matchFilter;
  });

  const avgScore = pages.length ? Math.round(pages.reduce((s, p) => s + calcScore(p), 0) / pages.length) : 0;
  const goodCount = pages.filter(p => calcScore(p) >= 75).length;
  const warnCount = pages.filter(p => { const s = calcScore(p); return s >= 50 && s < 75; }).length;
  const badCount  = pages.filter(p => calcScore(p) < 50).length;

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 4, height: 28, background: "#2563eb", borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>إدارة SEO</h2>
        <button onClick={load} style={{ background: "#f1f5f9", border: "none", borderRadius: "0.4rem", padding: "0.35rem", cursor: "pointer", marginRight: "auto" }}>
          <RefreshCw size={15} color="#64748b" />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.85rem" }}>
        {[
          { label: "متوسط الدرجة", value: avgScore, color: scoreColor(avgScore), bg: scoreBg(avgScore) },
          { label: "ممتاز (≥75)", value: goodCount, color: "#16a34a", bg: "#f0fdf4" },
          { label: "متوسط (50–74)", value: warnCount, color: "#d97706", bg: "#fffbeb" },
          { label: "يحتاج تحسين", value: badCount, color: "#dc2626", bg: "#fff0f0" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: `1px solid ${s.color}30`, borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, margin: "0 0 0.2rem" }}>{s.value}</p>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} color="#94a3b8" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الصفحات..."
            style={{ ...inputStyle, paddingRight: "2.25rem", width: "100%" }}
            onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
        </div>
        {(["all", "static", "dynamic"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#2563eb" : "#f1f5f9", color: filter === f ? "#fff" : "#475569", border: "none", borderRadius: "0.5rem", padding: "0.55rem 1.1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit" }}>
            {f === "all" ? "الكل" : f === "static" ? "ثابتة" : "ديناميكية"}
          </button>
        ))}
      </div>

      {/* Pages grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>جاري التحميل...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {shown.map(p => {
            const score = calcScore(p);
            return (
              <div key={p.page_slug} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", gap: "1rem", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>

                {/* Score ring */}
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2.5px solid ${scoreColor(score)}`, background: scoreBg(score), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.82rem", color: scoreColor(score), flexShrink: 0 }}>
                  {score}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>{p.page_label}</p>
                    {p.is_dynamic && (
                      <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>قالب</span>
                    )}
                  </div>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "#94a3b8", direction: "ltr", textAlign: "right" }}>{p.page_url}</p>
                  {p.title && <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>}
                </div>

                {/* Indicators */}
                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                  {[["T", !!p.title], ["D", !!p.description], ["IMG", !!p.og_image], ["KW", !!p.keywords]].map(([lbl, ok]) => (
                    <span key={String(lbl)} style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: ok ? "#f0fdf4" : "#f1f5f9", color: ok ? "#16a34a" : "#cbd5e1", border: `1px solid ${ok ? "#bbf7d0" : "#e2e8f0"}` }}>{String(lbl)}</span>
                  ))}
                </div>

                <button onClick={() => setEditing(p)} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "0.5rem", padding: "0.45rem 1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap" }}>
                  تعديل SEO
                </button>
              </div>
            );
          })}
          {shown.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>لا توجد نتائج</p>
          )}
        </div>
      )}

      {/* Edit drawer */}
      {editing && (
        <EditPanel
          page={editing}
          onSave={() => { load(); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
