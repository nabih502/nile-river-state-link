import { useState, useRef } from "react";
import { supabase } from "./supabase";
import type {
  InvestmentSector,
  InvestmentOpportunity,
  InvestmentIncentive,
  InvestmentSuccessStory,
  InvestmentPartner,
  InvestmentStat,
} from "./supabase";

export function slugify(text: string) {
  return (
    text
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
      .toLowerCase() || Date.now().toString()
  );
}

// ── Image Preview ─────────────────────────────────────────────────────────────
export function ImagePreview({ url }: { url: string }) {
  const [show, setShow] = useState(true);
  if (!url.trim() || !show) return null;
  return (
    <div className="inv-img-preview">
      <img
        src={url}
        alt=""
        onError={() => setShow(false)}
        onLoad={() => setShow(true)}
      />
    </div>
  );
}

// ── Publish Toggle ────────────────────────────────────────────────────────────
export function PublishToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inv-pub-toggle" onClick={() => onChange(!checked)}>
      <div className={`inv-toggle-track ${checked ? "on" : ""}`}>
        <div className="inv-toggle-thumb" />
      </div>
      <span className={checked ? "inv-toggle-label-on" : "inv-toggle-label-off"}>
        {checked ? "منشور" : "مخفي"}
      </span>
    </label>
  );
}

// ── Form Section ──────────────────────────────────────────────────────────────
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inv-form-section">
      <div className="inv-form-section-header">{title}</div>
      <div className="inv-form-section-body">{children}</div>
    </div>
  );
}

// ── Char Counter ──────────────────────────────────────────────────────────────
function CharCounter({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.85;
  return (
    <span className={`inv-char-count${near ? " warn" : ""}`}>
      {value.length} / {max}
    </span>
  );
}

// ── Rich Textarea ─────────────────────────────────────────────────────────────
function RichTextarea({
  value,
  onChange,
  rows = 5,
  max,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  max?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const selected = value.slice(s, e);
    onChange(value.slice(0, s) + before + selected + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const rest = value.slice(lineStart);
    if (rest.startsWith(prefix)) {
      onChange(value.slice(0, lineStart) + rest.slice(prefix.length));
    } else {
      onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    }
    requestAnimationFrame(() => el.focus());
  };

  return (
    <div className="inv-rich-wrap">
      <div className="inv-rich-toolbar">
        <button type="button" title="خط عريض" onClick={() => wrap("**", "**")}>
          <b>B</b>
        </button>
        <button type="button" title="خط مائل" onClick={() => wrap("_", "_")}>
          <em>I</em>
        </button>
        <span className="inv-rich-div" />
        <button type="button" title="قائمة نقطية" onClick={() => linePrefix("• ")}>
          ≡
        </button>
        <button type="button" title="عنوان فرعي" onClick={() => linePrefix("## ")}>
          H
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="inv-rich-area"
      />
      {max && (
        <div className="inv-rich-foot">
          <CharCounter value={value} max={max} />
        </div>
      )}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
export function Drawer({
  title,
  open,
  onClose,
  children,
  footer,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <div
        className={`inv-drawer-backdrop${open ? " open" : ""}`}
        onClick={onClose}
      />
      <div className={`inv-drawer${open ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="inv-drawer-head">
          <h2>{title}</h2>
          <button type="button" className="inv-drawer-close" onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="inv-drawer-body">{children}</div>
        {footer && <div className="inv-drawer-foot">{footer}</div>}
      </div>
    </>
  );
}

// ── Drawer Footer Helper ──────────────────────────────────────────────────────
function DrawerFoot({
  formId,
  saving,
  isEdit,
  onClose,
  published,
  onTogglePublish,
  error,
}: {
  formId: string;
  saving: boolean;
  isEdit: boolean;
  onClose: () => void;
  published: boolean;
  onTogglePublish: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="inv-dfoot-wrap">
      {error && <p className="inv-form-err">{error}</p>}
      <div className="inv-dfoot-row">
        <PublishToggle checked={published} onChange={onTogglePublish} />
        <div className="inv-dfoot-btns">
          <button type="button" onClick={onClose} className="inv-btn-cancel">
            إلغاء
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inv-btn-save"
          >
            {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sector Editor ─────────────────────────────────────────────────────────────
export function SectorEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<InvestmentSector> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<InvestmentSector>>(
    item ?? {
      name: "",
      slug: "",
      description: "",
      image_url: "",
      icon: "",
      highlight: "",
      sort_order: 0,
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof InvestmentSector>(k: K, v: InvestmentSector[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name || ""),
      description: form.description,
      image_url: form.image_url,
      icon: form.icon,
      highlight: form.highlight,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("investment_sectors").update(payload).eq("id", form.id)
      : await supabase.from("investment_sectors").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل قطاع" : "إضافة قطاع جديد"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="sector-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="sector-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <div className="inv-form-row">
            <label className="inv-label">
              اسم القطاع <span className="inv-req">*</span>
              <input
                required
                value={form.name || ""}
                className="inv-input"
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!form.id) set("slug", slugify(e.target.value));
                }}
              />
            </label>
            <label className="inv-label">
              الرابط (Slug)
              <input
                value={form.slug || ""}
                className="inv-input inv-slug"
                dir="ltr"
                onChange={(e) => set("slug", e.target.value)}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="الصورة والمحتوى">
          <label className="inv-label">
            رابط الصورة
            <input
              value={form.image_url || ""}
              className="inv-input"
              dir="ltr"
              placeholder="https://..."
              onChange={(e) => set("image_url", e.target.value)}
            />
          </label>
          <ImagePreview url={form.image_url || ""} />
          <label className="inv-label">
            الوصف
            <RichTextarea
              value={form.description || ""}
              onChange={(v) => set("description", v)}
              rows={5}
              max={800}
              placeholder="اكتب وصفاً شاملاً للقطاع..."
            />
          </label>
        </FormSection>

        <FormSection title="إعدادات العرض">
          <div className="inv-form-row">
            <label className="inv-label">
              الأيقونة (Lucide)
              <input
                value={form.icon || ""}
                className="inv-input"
                dir="ltr"
                placeholder="TrendingUp"
                onChange={(e) => set("icon", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الرقم المميز
              <input
                value={form.highlight || ""}
                className="inv-input"
                placeholder="+200 مشروع"
                onChange={(e) => set("highlight", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label inv-label-sm">
            ترتيب العرض
            <input
              type="number"
              value={form.sort_order ?? 0}
              className="inv-input"
              dir="ltr"
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Opportunity Editor ────────────────────────────────────────────────────────
export function OpportunityEditor({
  item,
  sectors,
  open,
  onSave,
  onClose,
}: {
  item: Partial<InvestmentOpportunity> | null;
  sectors: InvestmentSector[];
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<InvestmentOpportunity>>(
    item ?? {
      title: "",
      slug: "",
      sector_id: null,
      description: "",
      details: "",
      image_url: "",
      min_investment: "",
      expected_return: "",
      duration: "",
      location: "",
      status: "available",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof InvestmentOpportunity>(
    k: K,
    v: InvestmentOpportunity[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title || ""),
      sector_id: form.sector_id || null,
      description: form.description,
      details: form.details,
      image_url: form.image_url,
      min_investment: form.min_investment,
      expected_return: form.expected_return,
      duration: form.duration,
      location: form.location,
      status: form.status,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("investment_opportunities").update(payload).eq("id", form.id)
      : await supabase.from("investment_opportunities").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل فرصة استثمارية" : "إضافة فرصة جديدة"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="opp-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="opp-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <div className="inv-form-row">
            <label className="inv-label">
              العنوان <span className="inv-req">*</span>
              <input
                required
                value={form.title || ""}
                className="inv-input"
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!form.id) set("slug", slugify(e.target.value));
                }}
              />
            </label>
            <label className="inv-label">
              الرابط (Slug)
              <input
                value={form.slug || ""}
                className="inv-input inv-slug"
                dir="ltr"
                onChange={(e) => set("slug", e.target.value)}
              />
            </label>
          </div>
          <div className="inv-form-row">
            <label className="inv-label">
              القطاع
              <select
                value={form.sector_id || ""}
                className="inv-input"
                onChange={(e) => set("sector_id", e.target.value || null)}
              >
                <option value="">— بدون قطاع —</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="inv-label">
              الحالة
              <select
                value={form.status || "available"}
                className="inv-input"
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="available">متاحة</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="closed">مغلقة</option>
              </select>
            </label>
          </div>
        </FormSection>

        <FormSection title="الصورة والمحتوى">
          <label className="inv-label">
            رابط الصورة
            <input
              value={form.image_url || ""}
              className="inv-input"
              dir="ltr"
              placeholder="https://..."
              onChange={(e) => set("image_url", e.target.value)}
            />
          </label>
          <ImagePreview url={form.image_url || ""} />
          <label className="inv-label">
            الوصف المختصر
            <RichTextarea
              value={form.description || ""}
              onChange={(v) => set("description", v)}
              rows={3}
              max={400}
              placeholder="وصف موجز يظهر في بطاقة الفرصة..."
            />
          </label>
          <label className="inv-label">
            التفاصيل الكاملة
            <RichTextarea
              value={form.details || ""}
              onChange={(v) => set("details", v)}
              rows={7}
              max={2000}
              placeholder="اكتب تفاصيل الفرصة الاستثمارية بالكامل..."
            />
          </label>
        </FormSection>

        <FormSection title="المواصفات المالية">
          <div className="inv-form-row">
            <label className="inv-label">
              الحد الأدنى للاستثمار
              <input
                value={form.min_investment || ""}
                className="inv-input"
                placeholder="مثال: 50,000 جنيه"
                onChange={(e) => set("min_investment", e.target.value)}
              />
            </label>
            <label className="inv-label">
              العائد المتوقع
              <input
                value={form.expected_return || ""}
                className="inv-input"
                placeholder="مثال: 15%–20% سنوياً"
                onChange={(e) => set("expected_return", e.target.value)}
              />
            </label>
          </div>
          <div className="inv-form-row">
            <label className="inv-label">
              مدة الاستثمار
              <input
                value={form.duration || ""}
                className="inv-input"
                placeholder="مثال: 3–5 سنوات"
                onChange={(e) => set("duration", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الموقع
              <input
                value={form.location || ""}
                className="inv-input"
                placeholder="مثال: مدينة دنقلا"
                onChange={(e) => set("location", e.target.value)}
              />
            </label>
          </div>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Incentive Editor ──────────────────────────────────────────────────────────
export function IncentiveEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<InvestmentIncentive> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<InvestmentIncentive>>(
    item ?? {
      title: "",
      description: "",
      icon: "",
      category: "general",
      sort_order: 0,
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof InvestmentIncentive>(
    k: K,
    v: InvestmentIncentive[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      category: form.category,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("investment_incentives").update(payload).eq("id", form.id)
      : await supabase.from("investment_incentives").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  const categoryLabels: Record<string, string> = {
    general: "عام",
    tax: "إعفاء ضريبي",
    land: "أراضي",
    infrastructure: "بنية تحتية",
    admin: "إداري",
    finance: "تمويل",
  };

  return (
    <Drawer
      title={form.id ? "تعديل حافز" : "إضافة حافز جديد"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="incentive-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="incentive-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <div className="inv-form-row">
            <label className="inv-label">
              عنوان الحافز <span className="inv-req">*</span>
              <input
                required
                value={form.title || ""}
                className="inv-input"
                onChange={(e) => set("title", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الأيقونة (Lucide)
              <input
                value={form.icon || ""}
                className="inv-input"
                dir="ltr"
                placeholder="ShieldCheck"
                onChange={(e) => set("icon", e.target.value)}
              />
            </label>
          </div>
          <div className="inv-form-row">
            <label className="inv-label">
              التصنيف
              <select
                value={form.category || "general"}
                className="inv-input"
                onChange={(e) => set("category", e.target.value)}
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="inv-label">
              ترتيب العرض
              <input
                type="number"
                value={form.sort_order ?? 0}
                className="inv-input"
                dir="ltr"
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="الوصف">
          <label className="inv-label">
            نص الحافز
            <RichTextarea
              value={form.description || ""}
              onChange={(v) => set("description", v)}
              rows={4}
              max={600}
              placeholder="اشرح تفاصيل هذا الحافز أو التسهيل..."
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Story Editor ──────────────────────────────────────────────────────────────
export function StoryEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<InvestmentSuccessStory> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<InvestmentSuccessStory>>(
    item ?? {
      name: "",
      title: "",
      story: "",
      quote: "",
      image_url: "",
      sector: "",
      location: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof InvestmentSuccessStory>(
    k: K,
    v: InvestmentSuccessStory[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      title: form.title,
      story: form.story,
      quote: form.quote,
      image_url: form.image_url,
      sector: form.sector,
      location: form.location,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("investment_success_stories").update(payload).eq("id", form.id)
      : await supabase.from("investment_success_stories").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل قصة نجاح" : "إضافة قصة نجاح"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="story-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="story-form" onSubmit={save}>
        <FormSection title="معلومات المستثمر">
          <div className="inv-form-row">
            <label className="inv-label">
              اسم المستثمر <span className="inv-req">*</span>
              <input
                required
                value={form.name || ""}
                className="inv-input"
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <label className="inv-label">
              المسمى / النشاط
              <input
                value={form.title || ""}
                className="inv-input"
                placeholder="مدير مشروع زراعي"
                onChange={(e) => set("title", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            رابط الصورة
            <input
              value={form.image_url || ""}
              className="inv-input"
              dir="ltr"
              placeholder="https://..."
              onChange={(e) => set("image_url", e.target.value)}
            />
          </label>
          <ImagePreview url={form.image_url || ""} />
        </FormSection>

        <FormSection title="قصة النجاح">
          <label className="inv-label">
            النص الكامل
            <RichTextarea
              value={form.story || ""}
              onChange={(v) => set("story", v)}
              rows={6}
              max={1500}
              placeholder="اكتب قصة نجاح المستثمر..."
            />
          </label>
          <label className="inv-label">
            الاقتباس المميز
            <textarea
              value={form.quote || ""}
              className="inv-input"
              rows={2}
              placeholder="جملة مؤثرة تُعرض بشكل بارز..."
              onChange={(e) => set("quote", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </label>
        </FormSection>

        <FormSection title="التصنيف">
          <div className="inv-form-row">
            <label className="inv-label">
              القطاع
              <input
                value={form.sector || ""}
                className="inv-input"
                placeholder="زراعي / صناعي..."
                onChange={(e) => set("sector", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الموقع
              <input
                value={form.location || ""}
                className="inv-input"
                placeholder="مدينة / منطقة"
                onChange={(e) => set("location", e.target.value)}
              />
            </label>
          </div>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Partner Editor ────────────────────────────────────────────────────────────
export function PartnerEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<InvestmentPartner> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<InvestmentPartner>>(
    item ?? {
      name: "",
      logo_url: "",
      website: "",
      description: "",
      category: "local",
      sort_order: 0,
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof InvestmentPartner>(k: K, v: InvestmentPartner[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      website: form.website,
      description: form.description,
      category: form.category,
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("investment_partners").update(payload).eq("id", form.id)
      : await supabase.from("investment_partners").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  const catLabels: Record<string, string> = {
    local: "محلي",
    government: "حكومي",
    financial: "مالي",
    international: "دولي",
  };

  return (
    <Drawer
      title={form.id ? "تعديل شريك" : "إضافة شريك جديد"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="partner-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="partner-form" onSubmit={save}>
        <FormSection title="معلومات الجهة">
          <div className="inv-form-row">
            <label className="inv-label">
              اسم الجهة <span className="inv-req">*</span>
              <input
                required
                value={form.name || ""}
                className="inv-input"
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <label className="inv-label">
              التصنيف
              <select
                value={form.category || "local"}
                className="inv-input"
                onChange={(e) => set("category", e.target.value)}
              >
                {Object.entries(catLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="inv-label">
            الوصف
            <textarea
              value={form.description || ""}
              className="inv-input"
              rows={3}
              style={{ resize: "vertical" }}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="الروابط والشعار">
          <label className="inv-label">
            رابط الشعار
            <input
              value={form.logo_url || ""}
              className="inv-input"
              dir="ltr"
              placeholder="https://..."
              onChange={(e) => set("logo_url", e.target.value)}
            />
          </label>
          <ImagePreview url={form.logo_url || ""} />
          <label className="inv-label">
            الموقع الإلكتروني
            <input
              value={form.website || ""}
              className="inv-input"
              dir="ltr"
              placeholder="https://..."
              onChange={(e) => set("website", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="الترتيب">
          <label className="inv-label inv-label-sm">
            ترتيب العرض
            <input
              type="number"
              value={form.sort_order ?? 0}
              className="inv-input"
              dir="ltr"
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Stat Editor ───────────────────────────────────────────────────────────────
export function StatEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<InvestmentStat> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<InvestmentStat>>(
    item ?? { label: "", value: "", icon: "", sort_order: 0 }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof InvestmentStat>(k: K, v: InvestmentStat[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      label: form.label,
      value: form.value,
      icon: form.icon,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error: err } = form.id
      ? await supabase.from("investment_stats").update(payload).eq("id", form.id)
      : await supabase.from("investment_stats").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل إحصاء" : "إضافة إحصاء جديد"}
      open={open}
      onClose={onClose}
      footer={
        <div className="inv-dfoot-wrap">
          {error && <p className="inv-form-err">{error}</p>}
          <div className="inv-dfoot-row">
            <span />
            <div className="inv-dfoot-btns">
              <button type="button" onClick={onClose} className="inv-btn-cancel">
                إلغاء
              </button>
              <button
                type="submit"
                form="stat-form"
                disabled={saving}
                className="inv-btn-save"
              >
                {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      }
    >
      <form id="stat-form" onSubmit={save}>
        <FormSection title="بيانات الإحصاء">
          <div className="inv-form-row">
            <label className="inv-label">
              التسمية <span className="inv-req">*</span>
              <input
                required
                value={form.label || ""}
                className="inv-input"
                placeholder="عدد المشاريع"
                onChange={(e) => set("label", e.target.value)}
              />
            </label>
            <label className="inv-label">
              القيمة <span className="inv-req">*</span>
              <input
                required
                value={form.value || ""}
                className="inv-input"
                dir="ltr"
                placeholder="+500"
                onChange={(e) => set("value", e.target.value)}
              />
            </label>
          </div>
          <div className="inv-form-row">
            <label className="inv-label">
              الأيقونة (Lucide)
              <input
                value={form.icon || ""}
                className="inv-input"
                dir="ltr"
                placeholder="BarChart2"
                onChange={(e) => set("icon", e.target.value)}
              />
            </label>
            <label className="inv-label">
              ترتيب العرض
              <input
                type="number"
                value={form.sort_order ?? 0}
                className="inv-input"
                dir="ltr"
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </label>
          </div>
        </FormSection>
      </form>
    </Drawer>
  );
}
