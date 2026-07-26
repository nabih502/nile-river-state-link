import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type {
  InvestmentSector,
  InvestmentOpportunity,
  InvestmentIncentive,
  InvestmentSuccessStory,
  InvestmentPartner,
  InvestmentStat,
  InvestmentInquiry,
} from "./supabase";

type InvTab = "sectors" | "opportunities" | "incentives" | "stories" | "partners" | "stats" | "inquiries";

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

function slugify(text: string) {
  return text.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "").toLowerCase() || Date.now().toString();
}

// ─── Sector Editor ────────────────────────────────────────────────────────────
function SectorEditor({ item, onSave, onCancel }: { item: Partial<InvestmentSector> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<InvestmentSector> = { name: "", slug: "", description: "", image_url: "", icon: "", highlight: "", sort_order: 0, published: true };
  const [form, setForm] = useState<Partial<InvestmentSector>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof InvestmentSector, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { name: form.name, slug: form.slug || slugify(form.name || ""), description: form.description, image_url: form.image_url, icon: form.icon, highlight: form.highlight, sort_order: Number(form.sort_order) || 0, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("investment_sectors").update(payload).eq("id", form.id)
      : await supabase.from("investment_sectors").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل قطاع" : "إضافة قطاع جديد"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        {error && <p className="adm-err">{error}</p>}
        <div className="adm-form-row">
          <label>اسم القطاع *<input required value={form.name || ""} onChange={e => { set("name", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} /></label>
          <label>الرابط (slug)<input value={form.slug || ""} onChange={e => set("slug", e.target.value)} dir="ltr" /></label>
        </div>
        <label>الوصف<textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={4} /></label>
        <div className="adm-form-row">
          <label>رابط الصورة<input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} dir="ltr" /></label>
          <label>الأيقونة (اسم lucide)<input value={form.icon || ""} onChange={e => set("icon", e.target.value)} dir="ltr" /></label>
        </div>
        <div className="adm-form-row">
          <label>الرقم المميز<input value={form.highlight || ""} onChange={e => set("highlight", e.target.value)} /></label>
          <label>ترتيب العرض<input type="number" value={form.sort_order ?? 0} onChange={e => set("sort_order", e.target.value)} dir="ltr" /></label>
        </div>
        <label className="adm-toggle-label"><input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />نشر القطاع</label>
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Opportunity Editor ───────────────────────────────────────────────────────
function OpportunityEditor({ item, sectors, onSave, onCancel }: { item: Partial<InvestmentOpportunity> | null; sectors: InvestmentSector[]; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<InvestmentOpportunity> = { title: "", slug: "", sector_id: null, description: "", details: "", image_url: "", min_investment: "", expected_return: "", duration: "", location: "", status: "available", published: true };
  const [form, setForm] = useState<Partial<InvestmentOpportunity>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof InvestmentOpportunity, v: string | boolean | null) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title: form.title, slug: form.slug || slugify(form.title || ""), sector_id: form.sector_id || null, description: form.description, details: form.details, image_url: form.image_url, min_investment: form.min_investment, expected_return: form.expected_return, duration: form.duration, location: form.location, status: form.status, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("investment_opportunities").update(payload).eq("id", form.id)
      : await supabase.from("investment_opportunities").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل فرصة" : "إضافة فرصة جديدة"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        {error && <p className="adm-err">{error}</p>}
        <div className="adm-form-row">
          <label>العنوان *<input required value={form.title || ""} onChange={e => { set("title", e.target.value); if (!form.id) set("slug", slugify(e.target.value)); }} /></label>
          <label>الرابط (slug)<input value={form.slug || ""} onChange={e => set("slug", e.target.value)} dir="ltr" /></label>
        </div>
        <div className="adm-form-row">
          <label>القطاع
            <select value={form.sector_id || ""} onChange={e => set("sector_id", e.target.value || null)}>
              <option value="">— بدون قطاع —</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>الحالة
            <select value={form.status || "available"} onChange={e => set("status", e.target.value)}>
              <option value="available">متاحة</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="closed">مغلقة</option>
            </select>
          </label>
        </div>
        <label>الوصف<textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} /></label>
        <label>التفاصيل الكاملة<textarea value={form.details || ""} onChange={e => set("details", e.target.value)} rows={5} /></label>
        <label>رابط الصورة<input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} dir="ltr" /></label>
        <div className="adm-form-row">
          <label>الحد الأدنى للاستثمار<input value={form.min_investment || ""} onChange={e => set("min_investment", e.target.value)} /></label>
          <label>العائد المتوقع<input value={form.expected_return || ""} onChange={e => set("expected_return", e.target.value)} /></label>
        </div>
        <div className="adm-form-row">
          <label>المدة<input value={form.duration || ""} onChange={e => set("duration", e.target.value)} /></label>
          <label>الموقع<input value={form.location || ""} onChange={e => set("location", e.target.value)} /></label>
        </div>
        <label className="adm-toggle-label"><input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />نشر الفرصة</label>
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Incentive Editor ─────────────────────────────────────────────────────────
function IncentiveEditor({ item, onSave, onCancel }: { item: Partial<InvestmentIncentive> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<InvestmentIncentive> = { title: "", description: "", icon: "", category: "general", sort_order: 0, published: true };
  const [form, setForm] = useState<Partial<InvestmentIncentive>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof InvestmentIncentive, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title: form.title, description: form.description, icon: form.icon, category: form.category, sort_order: Number(form.sort_order) || 0, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("investment_incentives").update(payload).eq("id", form.id)
      : await supabase.from("investment_incentives").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل حافز" : "إضافة حافز جديد"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        {error && <p className="adm-err">{error}</p>}
        <div className="adm-form-row">
          <label>العنوان *<input required value={form.title || ""} onChange={e => set("title", e.target.value)} /></label>
          <label>الأيقونة (lucide)<input value={form.icon || ""} onChange={e => set("icon", e.target.value)} dir="ltr" /></label>
        </div>
        <label>الوصف<textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} /></label>
        <div className="adm-form-row">
          <label>التصنيف
            <select value={form.category || "general"} onChange={e => set("category", e.target.value)}>
              {["general", "tax", "land", "infrastructure", "admin", "finance"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>ترتيب العرض<input type="number" value={form.sort_order ?? 0} onChange={e => set("sort_order", e.target.value)} dir="ltr" /></label>
        </div>
        <label className="adm-toggle-label"><input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />نشر الحافز</label>
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Story Editor ─────────────────────────────────────────────────────────────
function StoryEditor({ item, onSave, onCancel }: { item: Partial<InvestmentSuccessStory> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<InvestmentSuccessStory> = { name: "", title: "", story: "", quote: "", image_url: "", sector: "", location: "", published: true };
  const [form, setForm] = useState<Partial<InvestmentSuccessStory>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof InvestmentSuccessStory, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { name: form.name, title: form.title, story: form.story, quote: form.quote, image_url: form.image_url, sector: form.sector, location: form.location, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("investment_success_stories").update(payload).eq("id", form.id)
      : await supabase.from("investment_success_stories").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل قصة نجاح" : "إضافة قصة نجاح"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        {error && <p className="adm-err">{error}</p>}
        <div className="adm-form-row">
          <label>اسم المستثمر *<input required value={form.name || ""} onChange={e => set("name", e.target.value)} /></label>
          <label>المسمى الوظيفي<input value={form.title || ""} onChange={e => set("title", e.target.value)} /></label>
        </div>
        <label>القصة<textarea value={form.story || ""} onChange={e => set("story", e.target.value)} rows={4} /></label>
        <label>الاقتباس المميز<textarea value={form.quote || ""} onChange={e => set("quote", e.target.value)} rows={2} /></label>
        <label>رابط الصورة<input value={form.image_url || ""} onChange={e => set("image_url", e.target.value)} dir="ltr" /></label>
        <div className="adm-form-row">
          <label>القطاع<input value={form.sector || ""} onChange={e => set("sector", e.target.value)} /></label>
          <label>الموقع<input value={form.location || ""} onChange={e => set("location", e.target.value)} /></label>
        </div>
        <label className="adm-toggle-label"><input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />نشر القصة</label>
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Partner Editor ───────────────────────────────────────────────────────────
function PartnerEditor({ item, onSave, onCancel }: { item: Partial<InvestmentPartner> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<InvestmentPartner> = { name: "", logo_url: "", website: "", description: "", category: "local", sort_order: 0, published: true };
  const [form, setForm] = useState<Partial<InvestmentPartner>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof InvestmentPartner, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { name: form.name, logo_url: form.logo_url, website: form.website, description: form.description, category: form.category, sort_order: Number(form.sort_order) || 0, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("investment_partners").update(payload).eq("id", form.id)
      : await supabase.from("investment_partners").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل شريك" : "إضافة شريك جديد"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        {error && <p className="adm-err">{error}</p>}
        <div className="adm-form-row">
          <label>اسم الجهة *<input required value={form.name || ""} onChange={e => set("name", e.target.value)} /></label>
          <label>التصنيف
            <select value={form.category || "local"} onChange={e => set("category", e.target.value)}>
              {["local", "government", "financial", "international"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label>الوصف<textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} /></label>
        <div className="adm-form-row">
          <label>رابط الشعار<input value={form.logo_url || ""} onChange={e => set("logo_url", e.target.value)} dir="ltr" /></label>
          <label>الموقع الإلكتروني<input value={form.website || ""} onChange={e => set("website", e.target.value)} dir="ltr" /></label>
        </div>
        <div className="adm-form-row">
          <label>ترتيب العرض<input type="number" value={form.sort_order ?? 0} onChange={e => set("sort_order", e.target.value)} dir="ltr" /></label>
        </div>
        <label className="adm-toggle-label"><input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} />نشر الشريك</label>
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

// ─── Stat Editor ──────────────────────────────────────────────────────────────
function StatEditor({ item, onSave, onCancel }: { item: Partial<InvestmentStat> | null; onSave: () => void; onCancel: () => void }) {
  const blank: Partial<InvestmentStat> = { label: "", value: "", icon: "", sort_order: 0 };
  const [form, setForm] = useState<Partial<InvestmentStat>>(item ?? blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof InvestmentStat, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { label: form.label, value: form.value, icon: form.icon, sort_order: Number(form.sort_order) || 0 };
    const { error: err } = form.id
      ? await supabase.from("investment_stats").update(payload).eq("id", form.id)
      : await supabase.from("investment_stats").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="adm-overlay">
      <form className="adm-editor" onSubmit={save}>
        <div className="adm-editor-head">
          <h2>{form.id ? "تعديل إحصاء" : "إضافة إحصاء جديد"}</h2>
          <button type="button" onClick={onCancel} className="adm-close">✕</button>
        </div>
        {error && <p className="adm-err">{error}</p>}
        <div className="adm-form-row">
          <label>التسمية *<input required value={form.label || ""} onChange={e => set("label", e.target.value)} /></label>
          <label>القيمة *<input required value={form.value || ""} onChange={e => set("value", e.target.value)} dir="ltr" /></label>
        </div>
        <div className="adm-form-row">
          <label>الأيقونة (lucide)<input value={form.icon || ""} onChange={e => set("icon", e.target.value)} dir="ltr" /></label>
          <label>ترتيب العرض<input type="number" value={form.sort_order ?? 0} onChange={e => set("sort_order", e.target.value)} dir="ltr" /></label>
        </div>
        <div className="adm-editor-foot">
          <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
          <button type="button" onClick={onCancel}>إلغاء</button>
        </div>
      </form>
    </div>
  );
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

// ─── Main Investment Panel ────────────────────────────────────────────────────
export default function InvestmentPanel() {
  const [tab, setTab] = useState<InvTab>("sectors");
  const [sectors, setSectors] = useState<InvestmentSector[]>([]);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [incentives, setIncentives] = useState<InvestmentIncentive[]>([]);
  const [stories, setStories] = useState<InvestmentSuccessStory[]>([]);
  const [partners, setPartners] = useState<InvestmentPartner[]>([]);
  const [stats, setStats] = useState<InvestmentStat[]>([]);
  const [inquiries, setInquiries] = useState<InvestmentInquiry[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<"all" | "new" | "contacted" | "closed">("all");

  const [editSector, setEditSector] = useState<Partial<InvestmentSector> | null | undefined>(undefined);
  const [editOpp, setEditOpp] = useState<Partial<InvestmentOpportunity> | null | undefined>(undefined);
  const [editIncentive, setEditIncentive] = useState<Partial<InvestmentIncentive> | null | undefined>(undefined);
  const [editStory, setEditStory] = useState<Partial<InvestmentSuccessStory> | null | undefined>(undefined);
  const [editPartner, setEditPartner] = useState<Partial<InvestmentPartner> | null | undefined>(undefined);
  const [editStat, setEditStat] = useState<Partial<InvestmentStat> | null | undefined>(undefined);
  const [confirmId, setConfirmId] = useState<{ table: string; id: string } | null>(null);

  const load = async (t: InvTab) => {
    if (t === "sectors") { const { data } = await supabase.from("investment_sectors").select("*").order("sort_order"); setSectors(data ?? []); }
    if (t === "opportunities") { const { data } = await supabase.from("investment_opportunities").select("*").order("created_at", { ascending: false }); setOpportunities(data ?? []); }
    if (t === "incentives") { const { data } = await supabase.from("investment_incentives").select("*").order("sort_order"); setIncentives(data ?? []); }
    if (t === "stories") { const { data } = await supabase.from("investment_success_stories").select("*").order("created_at", { ascending: false }); setStories(data ?? []); }
    if (t === "partners") { const { data } = await supabase.from("investment_partners").select("*").order("sort_order"); setPartners(data ?? []); }
    if (t === "stats") { const { data } = await supabase.from("investment_stats").select("*").order("sort_order"); setStats(data ?? []); }
    if (t === "inquiries") { const { data } = await supabase.from("investment_inquiries").select("*").order("created_at", { ascending: false }); setInquiries(data ?? []); }
  };

  useEffect(() => { load(tab); }, [tab]);

  // preload sectors for opportunity editor dropdown
  useEffect(() => { if (sectors.length === 0) supabase.from("investment_sectors").select("*").order("sort_order").then(({ data }) => setSectors(data ?? [])); }, []);

  const deleteRow = async () => {
    if (!confirmId) return;
    const table = confirmId.table as "investment_sectors" | "investment_opportunities" | "investment_incentives" | "investment_success_stories" | "investment_partners" | "investment_stats";
    await supabase.from(table).delete().eq("id", confirmId.id);
    setConfirmId(null);
    load(tab);
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    await supabase.from("investment_inquiries").update({ status }).eq("id", id);
    load("inquiries");
  };

  const newInquiriesCount = inquiries.filter(i => i.status === "new").length;

  const tabs: { key: InvTab; label: string; badge?: number }[] = [
    { key: "sectors", label: "القطاعات" },
    { key: "opportunities", label: "الفرص" },
    { key: "incentives", label: "الحوافز" },
    { key: "stories", label: "قصص النجاح" },
    { key: "partners", label: "الشركاء" },
    { key: "stats", label: "الإحصاءات" },
    { key: "inquiries", label: "الطلبات", badge: tab !== "inquiries" ? newInquiriesCount : undefined },
  ];

  return (
    <div className="adm-section">
      {/* Sub-tabs */}
      <div className="adm-inv-tabs">
        {tabs.map(t => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label}
            {t.badge ? <em>{t.badge}</em> : null}
          </button>
        ))}
      </div>

      {/* ── Sectors ── */}
      {tab === "sectors" && (
        <>
          <div className="adm-section-head">
            <h2>القطاعات الاستثمارية ({sectors.length})</h2>
            <button className="adm-btn-primary" onClick={() => setEditSector(null)}>+ إضافة قطاع</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الصورة</th><th>الاسم</th><th>الرقم المميز</th><th>الترتيب</th><th>الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {sectors.map(row => (
                  <tr key={row.id}>
                    <td>{row.image_url ? <img src={row.image_url} alt="" className="adm-thumb" /> : <span className="adm-no-img">—</span>}</td>
                    <td><b>{row.name}</b><small dir="ltr">/{row.slug}</small></td>
                    <td><small>{row.highlight || "—"}</small></td>
                    <td>{row.sort_order}</td>
                    <td><span className={`adm-status ${row.published ? "published" : "draft"}`}>{row.published ? "منشور" : "مخفي"}</span></td>
                    <td>
                      <button className="adm-btn-edit" onClick={() => setEditSector(row)}>تعديل</button>
                      <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_sectors", id: row.id })}>حذف</button>
                    </td>
                  </tr>
                ))}
                {sectors.length === 0 && <tr><td colSpan={6} className="adm-empty">لا توجد قطاعات</td></tr>}
              </tbody>
            </table>
          </div>
          {editSector !== undefined && <SectorEditor item={editSector} onSave={() => { setEditSector(undefined); load("sectors"); }} onCancel={() => setEditSector(undefined)} />}
        </>
      )}

      {/* ── Opportunities ── */}
      {tab === "opportunities" && (
        <>
          <div className="adm-section-head">
            <h2>الفرص الاستثمارية ({opportunities.length})</h2>
            <button className="adm-btn-primary" onClick={() => setEditOpp(null)}>+ إضافة فرصة</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الصورة</th><th>العنوان</th><th>الحد الأدنى</th><th>العائد</th><th>الموقع</th><th>الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {opportunities.map(row => (
                  <tr key={row.id}>
                    <td>{row.image_url ? <img src={row.image_url} alt="" className="adm-thumb" /> : <span className="adm-no-img">—</span>}</td>
                    <td><b>{row.title}</b><small dir="ltr">/{row.slug}</small></td>
                    <td><small>{row.min_investment || "—"}</small></td>
                    <td><small>{row.expected_return || "—"}</small></td>
                    <td><small>{row.location || "—"}</small></td>
                    <td>
                      <span className={`adm-status ${row.published ? "published" : "draft"}`}>{row.published ? "منشورة" : "مخفية"}</span>
                      <span className="adm-tag" style={{ marginRight: 4 }}>{row.status === "available" ? "متاحة" : row.status === "in_progress" ? "قيد التنفيذ" : "مغلقة"}</span>
                    </td>
                    <td>
                      <button className="adm-btn-edit" onClick={() => setEditOpp(row)}>تعديل</button>
                      <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_opportunities", id: row.id })}>حذف</button>
                    </td>
                  </tr>
                ))}
                {opportunities.length === 0 && <tr><td colSpan={7} className="adm-empty">لا توجد فرص</td></tr>}
              </tbody>
            </table>
          </div>
          {editOpp !== undefined && <OpportunityEditor item={editOpp} sectors={sectors} onSave={() => { setEditOpp(undefined); load("opportunities"); }} onCancel={() => setEditOpp(undefined)} />}
        </>
      )}

      {/* ── Incentives ── */}
      {tab === "incentives" && (
        <>
          <div className="adm-section-head">
            <h2>الحوافز والتسهيلات ({incentives.length})</h2>
            <button className="adm-btn-primary" onClick={() => setEditIncentive(null)}>+ إضافة حافز</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>العنوان</th><th>التصنيف</th><th>الترتيب</th><th>الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {incentives.map(row => (
                  <tr key={row.id}>
                    <td><b>{row.title}</b><br /><small>{row.description.slice(0, 60)}…</small></td>
                    <td><span className="adm-tag">{row.category}</span></td>
                    <td>{row.sort_order}</td>
                    <td><span className={`adm-status ${row.published ? "published" : "draft"}`}>{row.published ? "منشور" : "مخفي"}</span></td>
                    <td>
                      <button className="adm-btn-edit" onClick={() => setEditIncentive(row)}>تعديل</button>
                      <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_incentives", id: row.id })}>حذف</button>
                    </td>
                  </tr>
                ))}
                {incentives.length === 0 && <tr><td colSpan={5} className="adm-empty">لا توجد حوافز</td></tr>}
              </tbody>
            </table>
          </div>
          {editIncentive !== undefined && <IncentiveEditor item={editIncentive} onSave={() => { setEditIncentive(undefined); load("incentives"); }} onCancel={() => setEditIncentive(undefined)} />}
        </>
      )}

      {/* ── Stories ── */}
      {tab === "stories" && (
        <>
          <div className="adm-section-head">
            <h2>قصص النجاح ({stories.length})</h2>
            <button className="adm-btn-primary" onClick={() => setEditStory(null)}>+ إضافة قصة</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الصورة</th><th>الاسم</th><th>المسمى</th><th>القطاع</th><th>الموقع</th><th>التاريخ</th><th>إجراءات</th></tr></thead>
              <tbody>
                {stories.map(row => (
                  <tr key={row.id}>
                    <td>{row.image_url ? <img src={row.image_url} alt="" className="adm-thumb" /> : <span className="adm-no-img">—</span>}</td>
                    <td><b>{row.name}</b></td>
                    <td><small>{row.title}</small></td>
                    <td><span className="adm-tag">{row.sector || "—"}</span></td>
                    <td><small>{row.location || "—"}</small></td>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      <button className="adm-btn-edit" onClick={() => setEditStory(row)}>تعديل</button>
                      <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_success_stories", id: row.id })}>حذف</button>
                    </td>
                  </tr>
                ))}
                {stories.length === 0 && <tr><td colSpan={7} className="adm-empty">لا توجد قصص</td></tr>}
              </tbody>
            </table>
          </div>
          {editStory !== undefined && <StoryEditor item={editStory} onSave={() => { setEditStory(undefined); load("stories"); }} onCancel={() => setEditStory(undefined)} />}
        </>
      )}

      {/* ── Partners ── */}
      {tab === "partners" && (
        <>
          <div className="adm-section-head">
            <h2>الشركاء ({partners.length})</h2>
            <button className="adm-btn-primary" onClick={() => setEditPartner(null)}>+ إضافة شريك</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الاسم</th><th>التصنيف</th><th>الموقع</th><th>الترتيب</th><th>إجراءات</th></tr></thead>
              <tbody>
                {partners.map(row => (
                  <tr key={row.id}>
                    <td><b>{row.name}</b><br /><small>{row.description.slice(0, 50)}…</small></td>
                    <td><span className="adm-tag">{row.category}</span></td>
                    <td><small dir="ltr">{row.website || "—"}</small></td>
                    <td>{row.sort_order}</td>
                    <td>
                      <button className="adm-btn-edit" onClick={() => setEditPartner(row)}>تعديل</button>
                      <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_partners", id: row.id })}>حذف</button>
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && <tr><td colSpan={5} className="adm-empty">لا يوجد شركاء</td></tr>}
              </tbody>
            </table>
          </div>
          {editPartner !== undefined && <PartnerEditor item={editPartner} onSave={() => { setEditPartner(undefined); load("partners"); }} onCancel={() => setEditPartner(undefined)} />}
        </>
      )}

      {/* ── Stats ── */}
      {tab === "stats" && (
        <>
          <div className="adm-section-head">
            <h2>الإحصاءات ({stats.length})</h2>
            <button className="adm-btn-primary" onClick={() => setEditStat(null)}>+ إضافة إحصاء</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>التسمية</th><th>القيمة</th><th>الأيقونة</th><th>الترتيب</th><th>إجراءات</th></tr></thead>
              <tbody>
                {stats.map(row => (
                  <tr key={row.id}>
                    <td><b>{row.label}</b></td>
                    <td><b dir="ltr">{row.value}</b></td>
                    <td><small dir="ltr">{row.icon || "—"}</small></td>
                    <td>{row.sort_order}</td>
                    <td>
                      <button className="adm-btn-edit" onClick={() => setEditStat(row)}>تعديل</button>
                      <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_stats", id: row.id })}>حذف</button>
                    </td>
                  </tr>
                ))}
                {stats.length === 0 && <tr><td colSpan={5} className="adm-empty">لا توجد إحصاءات</td></tr>}
              </tbody>
            </table>
          </div>
          {editStat !== undefined && <StatEditor item={editStat} onSave={() => { setEditStat(undefined); load("stats"); }} onCancel={() => setEditStat(undefined)} />}
        </>
      )}

      {/* ── Inquiries ── */}
      {tab === "inquiries" && (() => {
        const filtered = inquiries.filter(i => inquiryFilter === "all" || i.status === inquiryFilter);
        return (
          <>
            <div className="adm-section-head">
              <h2>طلبات الاستثمار ({inquiries.length})</h2>
              <div className="adm-inv-filter">
                {(["all", "new", "contacted", "closed"] as const).map(f => (
                  <button key={f} className={inquiryFilter === f ? "active" : ""} onClick={() => setInquiryFilter(f)}>
                    {f === "all" ? `الكل (${inquiries.length})` : f === "new" ? `جديد (${inquiries.filter(i => i.status === "new").length})` : f === "contacted" ? `تم التواصل (${inquiries.filter(i => i.status === "contacted").length})` : `مغلق (${inquiries.filter(i => i.status === "closed").length})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="adm-inquiries-list">
              {filtered.map(row => (
                <div key={row.id} className={`adm-inquiry-card status-${row.status}`}>
                  <div className="adm-inquiry-top">
                    <div className="adm-inquiry-ref">
                      <span className="adm-inquiry-type">{row.type === "sector" ? "قطاع" : "فرصة"}</span>
                      <strong>{row.reference_title || row.reference_slug}</strong>
                    </div>
                    <div className="adm-inquiry-meta">
                      <span className={`adm-inq-badge ${row.status}`}>{row.status === "new" ? "جديد" : row.status === "contacted" ? "تم التواصل" : "مغلق"}</span>
                      <small>{formatDate(row.created_at)}</small>
                    </div>
                  </div>
                  <div className="adm-inquiry-body">
                    <div className="adm-inquiry-contact">
                      <b>{row.name}</b>
                      {row.phone && <a href={`tel:${row.phone}`} dir="ltr">{row.phone}</a>}
                      {row.email && <a href={`mailto:${row.email}`} dir="ltr">{row.email}</a>}
                    </div>
                    {row.message && <p className="adm-inquiry-msg">{row.message}</p>}
                  </div>
                  <div className="adm-inquiry-actions">
                    {row.status !== "contacted" && <button className="adm-btn-edit" onClick={() => updateInquiryStatus(row.id, "contacted")}>تم التواصل</button>}
                    {row.status !== "closed" && <button className="adm-btn-secondary" onClick={() => updateInquiryStatus(row.id, "closed")}>إغلاق</button>}
                    {row.status !== "new" && <button onClick={() => updateInquiryStatus(row.id, "new")}>إعادة فتح</button>}
                    <button className="adm-btn-danger" onClick={() => setConfirmId({ table: "investment_inquiries", id: row.id })}>حذف</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="adm-empty">لا توجد طلبات</p>}
            </div>
          </>
        );
      })()}

      {confirmId && (
        <Confirm
          message="هل أنت متأكد من الحذف؟ لا يمكن التراجع."
          onConfirm={deleteRow}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
