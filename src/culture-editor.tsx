import { useState, useRef } from "react";
import { supabase } from "./supabase";
import type {
  CultureEvent,
  CultureNews,
  CultureArtist,
  CultureAssociation,
  CultureInitiative,
  CultureContest,
  CultureMedia,
} from "./supabase";

// ── Image Upload ──────────────────────────────────────────────────────────────
async function uploadImageFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `culture/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

export function ImageUpload({
  value,
  onChange,
  label = "الصورة",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="inv-field">
      <span className="inv-field-label">{label}</span>
      {value ? (
        <div className="inv-img-thumb">
          <img src={value} alt="" />
          <button
            type="button"
            className="inv-img-clear"
            onClick={() => onChange("")}
            title="إزالة الصورة"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          className="inv-upload-zone"
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <span className="inv-uploading">جاري الرفع...</span>
          ) : (
            <>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>اضغط لاختيار صورة</span>
              <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                PNG، JPG، WebP — حتى 10MB
              </span>
            </>
          )}
        </div>
      )}
      {uploadError && (
        <span style={{ color: "#dc2626", fontSize: ".8rem" }}>{uploadError}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
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
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inv-form-section" id={id}>
      <div className="inv-form-section-header">{title}</div>
      <div className="inv-form-section-body">{children}</div>
    </div>
  );
}

// ── Section Quick-Nav ─────────────────────────────────────────────────────────
function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="inv-section-nav">
      {sections.map((s) => (
        <button key={s.id} type="button" className="inv-section-pill" onClick={() => scrollTo(s.id)}>
          {s.label}
        </button>
      ))}
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

// ── Event Editor ──────────────────────────────────────────────────────────────
export function EventEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureEvent> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureEvent>>(
    item ?? {
      title: "",
      image_url: "",
      tag: "",
      description: "",
      event_date: "",
      location: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureEvent>(k: K, v: CultureEvent[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      image_url: form.image_url,
      tag: form.tag,
      event_date: form.event_date || null,
      location: form.location,
      description: form.description || "",
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_events").update(payload).eq("id", form.id)
      : await supabase.from("culture_events").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل فعالية" : "إضافة فعالية"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="event-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="event-form" onSubmit={save}>
        <SectionNav
          sections={[
            { id: "event-basics", label: "المعلومات الأساسية" },
            { id: "event-desc", label: "الوصف" },
            { id: "event-image", label: "الصورة" },
          ]}
        />

        <FormSection title="المعلومات الأساسية" id="event-basics">
          <label className="inv-label">
            <span>
              العنوان <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              الوسم / التصنيف
              <input
                value={form.tag || ""}
                className="inv-input"
                placeholder="مثال: موسيقى، مسرح، فنون"
                onChange={(e) => set("tag", e.target.value)}
              />
            </label>
            <label className="inv-label">
              تاريخ الفعالية
              <input
                type="date"
                value={form.event_date || ""}
                className="inv-input"
                dir="ltr"
                onChange={(e) => set("event_date", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            الموقع
            <input
              value={form.location || ""}
              className="inv-input"
              placeholder="مثال: مدينة دنقلا — قاعة الاحتفالات"
              onChange={(e) => set("location", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="الوصف" id="event-desc">
          <label className="inv-label">
            وصف الفعالية
            <RichTextarea
              value={form.description || ""}
              onChange={(v) => set("description", v)}
              rows={6}
              max={2000}
              placeholder="اكتب وصفاً كاملاً للفعالية..."
            />
          </label>
        </FormSection>

        <FormSection title="الصورة" id="event-image">
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة الفعالية"
          />
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Culture News Editor ───────────────────────────────────────────────────────
export function CultureNewsEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureNews> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureNews>>(
    item ?? {
      slug: "",
      title: "",
      image_url: "",
      excerpt: "",
      body: "",
      published_at: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureNews>(k: K, v: CultureNews[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      slug: form.slug || toSlug(form.title || "") || `news-${Date.now()}`,
      title: form.title,
      image_url: form.image_url,
      excerpt: form.excerpt,
      body: form.body,
      published_at: form.published_at || null,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_news").update(payload).eq("id", form.id)
      : await supabase.from("culture_news").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل خبر ثقافي" : "إضافة خبر ثقافي"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="culture-news-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="culture-news-form" onSubmit={save}>
        <SectionNav
          sections={[
            { id: "cnews-basics", label: "المعلومات الأساسية" },
            { id: "cnews-media", label: "الصورة والمحتوى" },
          ]}
        />

        <FormSection title="المعلومات الأساسية" id="cnews-basics">
          <label className="inv-label">
            <span>
              العنوان <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className="inv-label">
            الرابط المختصر (Slug)
            <input
              value={form.slug || ""}
              className="inv-input"
              dir="ltr"
              placeholder="يُولَّد تلقائياً من العنوان"
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
          <label className="inv-label">
            المقتطف
            <textarea
              value={form.excerpt || ""}
              className="inv-input"
              rows={2}
              placeholder="وصف موجز يظهر في بطاقة الخبر..."
              style={{ resize: "vertical" }}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </label>
          <label className="inv-label">
            تاريخ النشر
            <input
              type="date"
              value={form.published_at || ""}
              className="inv-input"
              dir="ltr"
              onChange={(e) => set("published_at", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="الصورة والمحتوى" id="cnews-media">
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة الخبر"
          />
          <label className="inv-label">
            نص الخبر
            <RichTextarea
              value={form.body || ""}
              onChange={(v) => set("body", v)}
              rows={8}
              max={3000}
              placeholder="اكتب تفاصيل الخبر الثقافي..."
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Artist Editor ─────────────────────────────────────────────────────────────
export function ArtistEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureArtist> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureArtist>>(
    item ?? {
      slug: "",
      name: "",
      image_url: "",
      role: "",
      bio: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureArtist>(k: K, v: CultureArtist[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      slug: form.slug || toSlug(form.name || "") || `artist-${Date.now()}`,
      name: form.name,
      image_url: form.image_url,
      role: form.role,
      bio: form.bio,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_artists").update(payload).eq("id", form.id)
      : await supabase.from("culture_artists").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل فنان" : "إضافة فنان"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="artist-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="artist-form" onSubmit={save}>
        <SectionNav
          sections={[
            { id: "artist-basics", label: "المعلومات الأساسية" },
            { id: "artist-image", label: "الصورة" },
          ]}
        />

        <FormSection title="المعلومات الأساسية" id="artist-basics">
          <label className="inv-label">
            <span>
              الاسم <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.name || ""}
              className="inv-input"
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              الرابط المختصر (Slug)
              <input
                value={form.slug || ""}
                className="inv-input"
                dir="ltr"
                placeholder="يُولَّد تلقائياً من الاسم"
                onChange={(e) => set("slug", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الدور / التخصص
              <input
                value={form.role || ""}
                className="inv-input"
                placeholder="مثال: رسام، موسيقار، شاعر"
                onChange={(e) => set("role", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            السيرة الذاتية
            <RichTextarea
              value={form.bio || ""}
              onChange={(v) => set("bio", v)}
              rows={5}
              max={1000}
              placeholder="اكتب نبذة عن الفنان..."
            />
          </label>
        </FormSection>

        <FormSection title="الصورة" id="artist-image">
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة الفنان"
          />
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Association Editor ────────────────────────────────────────────────────────
export function AssociationEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureAssociation> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureAssociation>>(
    item ?? {
      slug: "",
      title: "",
      place: "",
      icon: "BookOpen",
      description: "",
      founded_year: "",
      email: "",
      phone: "",
      members_count: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureAssociation>(k: K, v: CultureAssociation[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      slug: form.slug || toSlug(form.title || "") || `assoc-${Date.now()}`,
      title: form.title,
      place: form.place,
      icon: form.icon,
      description: form.description || "",
      founded_year: form.founded_year || "",
      email: form.email || "",
      phone: form.phone || "",
      members_count: form.members_count || "",
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_associations").update(payload).eq("id", form.id)
      : await supabase.from("culture_associations").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل جمعية" : "إضافة جمعية"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="association-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="association-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <label className="inv-label">
            <span>
              الاسم <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className="inv-label">
            الرابط المختصر (Slug)
            <input
              value={form.slug || ""}
              className="inv-input"
              dir="ltr"
              placeholder="يُولَّد تلقائياً من الاسم"
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              المكان / الموقع
              <input
                value={form.place || ""}
                className="inv-input"
                placeholder="مثال: عطبرة"
                onChange={(e) => set("place", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الأيقونة (Lucide)
              <input
                value={form.icon || ""}
                className="inv-input"
                dir="ltr"
                placeholder="BookOpen"
                onChange={(e) => set("icon", e.target.value)}
              />
            </label>
          </div>
          <div className="inv-form-row">
            <label className="inv-label">
              سنة التأسيس
              <input
                value={form.founded_year || ""}
                className="inv-input"
                placeholder="مثال: ١٩٩٥"
                onChange={(e) => set("founded_year", e.target.value)}
              />
            </label>
            <label className="inv-label">
              عدد الأعضاء
              <input
                value={form.members_count || ""}
                className="inv-input"
                placeholder="مثال: ٧٠ عضواً"
                onChange={(e) => set("members_count", e.target.value)}
              />
            </label>
          </div>
          <div className="inv-form-row">
            <label className="inv-label">
              البريد الإلكتروني
              <input
                type="email"
                value={form.email || ""}
                className="inv-input"
                dir="ltr"
                placeholder="info@example.com"
                onChange={(e) => set("email", e.target.value)}
              />
            </label>
            <label className="inv-label">
              رقم الهاتف
              <input
                value={form.phone || ""}
                className="inv-input"
                dir="ltr"
                placeholder="+249-..."
                onChange={(e) => set("phone", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            الوصف التفصيلي
            <RichTextarea
              value={form.description || ""}
              onChange={(v) => set("description", v)}
              rows={6}
              max={2000}
              placeholder="اكتب وصفاً تفصيلياً عن الجمعية وأنشطتها..."
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

function toSlug(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06ff-]/g, "").slice(0, 60);
}

// ── Initiative Editor ─────────────────────────────────────────────────────────
export function InitiativeEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureInitiative> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureInitiative>>(
    item ?? {
      slug: "",
      title: "",
      image_url: "",
      text: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureInitiative>(k: K, v: CultureInitiative[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      slug: form.slug || toSlug(form.title || "") || `initiative-${Date.now()}`,
      title: form.title,
      image_url: form.image_url,
      text: form.text,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_initiatives").update(payload).eq("id", form.id)
      : await supabase.from("culture_initiatives").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل مبادرة" : "إضافة مبادرة"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="initiative-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="initiative-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <label className="inv-label">
            <span>
              العنوان <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className="inv-label">
            الرابط المختصر (Slug)
            <input
              value={form.slug || ""}
              className="inv-input"
              dir="ltr"
              placeholder="يُولَّد تلقائياً من العنوان"
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة المبادرة"
          />
          <label className="inv-label">
            النص / التفاصيل
            <RichTextarea
              value={form.text || ""}
              onChange={(v) => set("text", v)}
              rows={6}
              max={2000}
              placeholder="اكتب تفاصيل المبادرة..."
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Contest Editor ────────────────────────────────────────────────────────────
export function ContestEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureContest> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureContest>>(
    item ?? {
      title: "",
      deadline: "",
      prize: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureContest>(k: K, v: CultureContest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      deadline: form.deadline || null,
      prize: form.prize,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_contests").update(payload).eq("id", form.id)
      : await supabase.from("culture_contests").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل مسابقة" : "إضافة مسابقة"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="contest-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="contest-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <label className="inv-label">
            <span>
              عنوان المسابقة <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              الموعد النهائي
              <input
                type="date"
                value={form.deadline || ""}
                className="inv-input"
                dir="ltr"
                onChange={(e) => set("deadline", e.target.value)}
              />
            </label>
            <label className="inv-label">
              الجائزة
              <input
                value={form.prize || ""}
                className="inv-input"
                placeholder="مثال: 10,000 جنيه سوداني"
                onChange={(e) => set("prize", e.target.value)}
              />
            </label>
          </div>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Culture Media Editor ──────────────────────────────────────────────────────
export function CultureMediaEditor({
  item,
  open,
  onSave,
  onClose,
}: {
  item: Partial<CultureMedia> | null;
  open: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CultureMedia>>(
    item ?? {
      title: "",
      image_url: "",
      type: "فيديو",
      media_date: "",
      link_url: "",
      description: "",
      published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CultureMedia>(k: K, v: CultureMedia[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      image_url: form.image_url,
      type: form.type,
      media_date: form.media_date || null,
      link_url: form.link_url,
      description: form.description || "",
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("culture_media").update(payload).eq("id", form.id)
      : await supabase.from("culture_media").insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل وسيط ثقافي" : "إضافة وسيط ثقافي"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="culture-media-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="culture-media-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <label className="inv-label">
            <span>
              العنوان <span className="inv-req">*</span>
            </span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              النوع
              <select
                value={form.type || "فيديو"}
                className="inv-input"
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="فيديو">فيديو</option>
                <option value="بودكاست">بودكاست</option>
                <option value="مقال">مقال</option>
              </select>
            </label>
            <label className="inv-label">
              التاريخ
              <input
                type="date"
                value={form.media_date || ""}
                className="inv-input"
                dir="ltr"
                onChange={(e) => set("media_date", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            رابط المحتوى
            <input
              value={form.link_url || ""}
              className="inv-input"
              dir="ltr"
              placeholder="https://..."
              onChange={(e) => set("link_url", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="الوصف">
          <label className="inv-label">
            وصف المحتوى
            <RichTextarea
              value={form.description || ""}
              onChange={(v) => set("description", v)}
              rows={5}
              max={1500}
              placeholder="اكتب وصفاً للفيديو أو البودكاست..."
            />
          </label>
        </FormSection>

        <FormSection title="الصورة المصغرة">
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة مصغرة"
          />
        </FormSection>
      </form>
    </Drawer>
  );
}
