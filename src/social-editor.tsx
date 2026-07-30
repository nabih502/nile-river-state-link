import { SeoImageUpload } from "./admin-seo";
import React, { useState, useRef } from "react";
import { supabase } from "./supabase";
import type { SocialService, SocialInitiative, SocialStat, SocialValue } from "./supabase";

// ── Image Upload ───────────────────────────────────────────────────────────────
async function uploadImageFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `social/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>اضغط لاختيار صورة</span>
              <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>PNG، JPG، WebP — حتى 10MB</span>
            </>
          )}
        </div>
      )}
      {uploadError && <span style={{ color: "#dc2626", fontSize: ".8rem" }}>{uploadError}</span>}
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

// ── Publish Toggle ─────────────────────────────────────────────────────────────
export function PublishToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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

// ── Form Section ───────────────────────────────────────────────────────────────
function FormSection({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <div className="inv-form-section" id={id}>
      <div className="inv-form-section-header">{title}</div>
      <div className="inv-form-section-body">{children}</div>
    </div>
  );
}

// ── Section Nav ────────────────────────────────────────────────────────────────
function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

// ── Char Counter ───────────────────────────────────────────────────────────────
function CharCounter({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.85;
  return (
    <span className={`inv-char-count${near ? " warn" : ""}`}>
      {value.length} / {max}
    </span>
  );
}

// ── Drawer ─────────────────────────────────────────────────────────────────────
export function Drawer({
  title, open, onClose, children, footer,
}: {
  title: string; open: boolean; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <>
      <div className={`inv-drawer-backdrop${open ? " open" : ""}`} onClick={onClose} />
      <div className={`inv-drawer${open ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="inv-drawer-head">
          <h2>{title}</h2>
          <button type="button" className="inv-drawer-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

// ── Drawer Footer ──────────────────────────────────────────────────────────────
function DrawerFoot({
  formId, saving, isEdit, onClose, published, onTogglePublish, error,
}: {
  formId: string; saving: boolean; isEdit: boolean; onClose: () => void;
  published: boolean; onTogglePublish: (v: boolean) => void; error?: string;
}) {
  return (
    <div className="inv-dfoot-wrap">
      {error && <p className="inv-form-err">{error}</p>}
      <div className="inv-dfoot-row">
        <PublishToggle checked={published} onChange={onTogglePublish} />
        <div className="inv-dfoot-btns">
          <button type="button" onClick={onClose} className="inv-btn-cancel">إلغاء</button>
          <button type="submit" form={formId} disabled={saving} className="inv-btn-save">
            {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}

function toSlug(s: string) {
  return s.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06ffa-z0-9-]/gi, "").slice(0, 60);
}

// ── Service Editor ─────────────────────────────────────────────────────────────
export function ServiceEditor({
  item, open, onSave, onClose,
}: {
  item: Partial<SocialService> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialService>>(
    item ?? {
      icon: "HeartHandshake", title: "", lead: "", bullet_1: "", bullet_2: "",
      bullet_3: "", bullet_4: "", action_label: "تواصل معنا", slug: "",
      full_description: "", image_url: "", published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialService>(k: K, v: SocialService[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      icon: form.icon || "HeartHandshake",
      title: form.title,
      lead: form.lead || "",
      bullet_1: form.bullet_1 || "",
      bullet_2: form.bullet_2 || "",
      bullet_3: form.bullet_3 || "",
      bullet_4: form.bullet_4 || "",
      action_label: form.action_label || "تواصل معنا",
      slug: form.slug || toSlug(form.title || "") || `service-${Date.now()}`,
      full_description: form.full_description || "",
      image_url: form.image_url || "",
      published: form.published,
      seo_title: (form as any).seo_title || "",
      seo_description: (form as any).seo_description || "",
      seo_image: (form as any).seo_image || "",
    };
    const { error: err } = form.id
      ? await supabase.from("social_services").update(payload).eq("id", form.id)
      : await supabase.from("social_services").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل خدمة" : "إضافة خدمة"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="service-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="service-form" onSubmit={save}>
        <SectionNav
          sections={[
            { id: "svc-basics", label: "المعلومات الأساسية" },
            { id: "svc-bullets", label: "نقاط الخدمة" },
            { id: "svc-image", label: "الصورة" },
            { id: "svc-seo", label: "SEO" },
          ]}
        />

        <FormSection title="المعلومات الأساسية" id="svc-basics">
          <label className="inv-label">
            <span>العنوان <span className="inv-req">*</span></span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              placeholder="مثال: الدعم الأسري"
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
          <div className="inv-form-row">
            <label className="inv-label">
              الأيقونة (Lucide)
              <input
                value={form.icon || ""}
                className="inv-input"
                dir="ltr"
                placeholder="HeartHandshake"
                onChange={(e) => set("icon", e.target.value)}
              />
            </label>
            <label className="inv-label">
              نص زر الإجراء
              <input
                value={form.action_label || ""}
                className="inv-input"
                placeholder="تواصل معنا"
                onChange={(e) => set("action_label", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            النص التعريفي المختصر
            <textarea
              value={form.lead || ""}
              className="inv-input"
              rows={2}
              placeholder="وصف موجز يظهر في بطاقة الخدمة..."
              style={{ resize: "vertical" }}
              onChange={(e) => set("lead", e.target.value)}
            />
            <CharCounter value={form.lead || ""} max={160} />
          </label>
          <label className="inv-label">
            الوصف التفصيلي الكامل
            <textarea
              value={form.full_description || ""}
              className="inv-input"
              rows={5}
              placeholder="وصف تفصيلي يظهر في صفحة الخدمة..."
              style={{ resize: "vertical" }}
              onChange={(e) => set("full_description", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="ما تشمله الخدمة (4 نقاط)" id="svc-bullets">
          <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 0.75rem" }}>
            أي نقطة فارغة لن تُعرض للزوار.
          </p>
          {(["bullet_1", "bullet_2", "bullet_3", "bullet_4"] as const).map((k, i) => (
            <label className="inv-label" key={k}>
              النقطة {i + 1}
              <input
                value={form[k] || ""}
                className="inv-input"
                placeholder={`اكتب النقطة ${i + 1}...`}
                onChange={(e) => set(k, e.target.value)}
              />
            </label>
          ))}
        </FormSection>

        <FormSection title="الصورة" id="svc-image">
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة الخدمة (تظهر في صفحة التفاصيل)"
          />
        </FormSection>

        <FormSection title="تحسين محركات البحث (SEO)" id="svc-seo">
          <label className="inv-label">
            عنوان SEO
            <input
              value={(form as any).seo_title || ""}
              className="inv-input"
              onChange={(e) => (set as any)("seo_title", e.target.value)}
              placeholder="اتركه فارغاً لاستخدام العنوان الافتراضي"
            />
            <CharCounter value={(form as any).seo_title || ""} max={65} />
          </label>
          <label className="inv-label">
            وصف SEO
            <textarea
              rows={3}
              value={(form as any).seo_description || ""}
              className="inv-input"
              onChange={(e) => (set as any)("seo_description", e.target.value)}
              placeholder="اتركه فارغاً لاستخدام الوصف الافتراضي"
              style={{ resize: "vertical" }}
            />
            <CharCounter value={(form as any).seo_description || ""} max={160} />
          </label>
          <label className="inv-label">
            صورة المشاركة (OG Image)
            <SeoImageUpload
              value={(form as any).seo_image || ""}
              onChange={(url) => (set as any)("seo_image", url)}
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Initiative Editor ──────────────────────────────────────────────────────────
export function SocialInitiativeEditor({
  item, open, onSave, onClose,
}: {
  item: Partial<SocialInitiative> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialInitiative>>(
    item ?? {
      image_url: "", title: "", text: "", full_description: "", slug: "",
      progress: 0, amount: "", icon: "♡", action_label: "ساهم الآن", published: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialInitiative>(k: K, v: SocialInitiative[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      image_url: form.image_url || "",
      title: form.title,
      text: form.text || "",
      full_description: form.full_description || "",
      slug: form.slug || toSlug(form.title || "") || `initiative-${Date.now()}`,
      progress: Number(form.progress) || 0,
      amount: form.amount || "",
      icon: form.icon || "♡",
      action_label: form.action_label || "ساهم الآن",
      published: form.published,
      seo_title: (form as any).seo_title || "",
      seo_description: (form as any).seo_description || "",
      seo_image: (form as any).seo_image || "",
    };
    const { error: err } = form.id
      ? await supabase.from("social_initiatives").update(payload).eq("id", form.id)
      : await supabase.from("social_initiatives").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  const progress = Number(form.progress) || 0;

  return (
    <Drawer
      title={form.id ? "تعديل مبادرة" : "إضافة مبادرة"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="soc-init-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="soc-init-form" onSubmit={save}>
        <SectionNav
          sections={[
            { id: "init-basics", label: "المعلومات الأساسية" },
            { id: "init-details", label: "التفاصيل" },
            { id: "init-image", label: "الصورة" },
            { id: "init-seo", label: "SEO" },
          ]}
        />

        <FormSection title="المعلومات الأساسية" id="init-basics">
          <label className="inv-label">
            <span>العنوان <span className="inv-req">*</span></span>
            <input
              required
              value={form.title || ""}
              className="inv-input"
              placeholder="مثال: مبادرة دعم الأسر المحتاجة"
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
            الوصف المختصر (يظهر في البطاقة)
            <textarea
              value={form.text || ""}
              className="inv-input"
              rows={3}
              placeholder="وصف موجز يعرض على بطاقة المبادرة..."
              style={{ resize: "vertical" }}
              onChange={(e) => set("text", e.target.value)}
            />
            <CharCounter value={form.text || ""} max={200} />
          </label>
          <label className="inv-label">
            الوصف التفصيلي الكامل
            <textarea
              value={form.full_description || ""}
              className="inv-input"
              rows={5}
              placeholder="وصف تفصيلي يظهر في صفحة المبادرة..."
              style={{ resize: "vertical" }}
              onChange={(e) => set("full_description", e.target.value)}
            />
          </label>
        </FormSection>

        <FormSection title="التفاصيل" id="init-details">
          <div className="inv-form-row">
            <label className="inv-label">
              الأيقونة
              <input
                value={form.icon || ""}
                className="inv-input"
                placeholder="♡"
                onChange={(e) => set("icon", e.target.value)}
              />
            </label>
            <label className="inv-label">
              نص زر الإجراء
              <input
                value={form.action_label || ""}
                className="inv-input"
                placeholder="ساهم الآن"
                onChange={(e) => set("action_label", e.target.value)}
              />
            </label>
          </div>
          <label className="inv-label">
            المبلغ المستهدف
            <input
              value={form.amount || ""}
              className="inv-input"
              placeholder="مثال: 30,000 جنيه"
              onChange={(e) => set("amount", e.target.value)}
            />
          </label>
          <label className="inv-label">
            نسبة الإنجاز
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                style={{ flex: 1, accentColor: "#2563eb" }}
                onChange={(e) => set("progress", Number(e.target.value))}
              />
              <span style={{ minWidth: "3rem", textAlign: "center", fontWeight: 700, color: "#2563eb", fontSize: "1rem" }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#e2e8f0", marginTop: "0.35rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#2563eb", transition: "width 0.2s" }} />
            </div>
          </label>
        </FormSection>

        <FormSection title="الصورة" id="init-image">
          <ImageUpload
            value={form.image_url || ""}
            onChange={(url) => set("image_url", url)}
            label="صورة المبادرة"
          />
        </FormSection>

        <FormSection title="تحسين محركات البحث (SEO)" id="init-seo">
          <label className="inv-label">
            عنوان SEO
            <input
              value={(form as any).seo_title || ""}
              className="inv-input"
              onChange={(e) => (set as any)("seo_title", e.target.value)}
              placeholder="اتركه فارغاً لاستخدام العنوان الافتراضي"
            />
            <CharCounter value={(form as any).seo_title || ""} max={65} />
          </label>
          <label className="inv-label">
            وصف SEO
            <textarea
              rows={3}
              value={(form as any).seo_description || ""}
              className="inv-input"
              onChange={(e) => (set as any)("seo_description", e.target.value)}
              placeholder="اتركه فارغاً لاستخدام الوصف الافتراضي"
              style={{ resize: "vertical" }}
            />
            <CharCounter value={(form as any).seo_description || ""} max={160} />
          </label>
          <label className="inv-label">
            صورة المشاركة (OG Image)
            <SeoImageUpload
              value={(form as any).seo_image || ""}
              onChange={(url) => (set as any)("seo_image", url)}
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Stat Editor ────────────────────────────────────────────────────────────────
export function StatEditor({
  item, open, onSave, onClose,
}: {
  item: Partial<SocialStat> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialStat>>(
    item ?? { value: "", label: "", icon: "UsersRound" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialStat>(k: K, v: SocialStat[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { value: form.value, label: form.label, icon: form.icon };
    const { error: err } = form.id
      ? await supabase.from("social_stats").update(payload).eq("id", form.id)
      : await supabase.from("social_stats").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل إحصائية" : "إضافة إحصائية"}
      open={open}
      onClose={onClose}
      footer={
        <div className="inv-dfoot-wrap">
          {error && <p className="inv-form-err">{error}</p>}
          <div className="inv-dfoot-row">
            <div />
            <div className="inv-dfoot-btns">
              <button type="button" onClick={onClose} className="inv-btn-cancel">إلغاء</button>
              <button type="submit" form="stat-form" disabled={saving} className="inv-btn-save">
                {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      }
    >
      <form id="stat-form" onSubmit={save}>
        <FormSection title="الإحصائية">
          <label className="inv-label">
            <span>القيمة <span className="inv-req">*</span></span>
            <input
              required
              value={form.value || ""}
              className="inv-input"
              placeholder="12,680+"
              onChange={(e) => set("value", e.target.value)}
            />
          </label>
          <label className="inv-label">
            التسمية
            <input
              value={form.label || ""}
              className="inv-input"
              placeholder="مستفيد من خدماتنا"
              onChange={(e) => set("label", e.target.value)}
            />
          </label>
          <label className="inv-label">
            الأيقونة (Lucide)
            <input
              value={form.icon || ""}
              className="inv-input"
              dir="ltr"
              placeholder="UsersRound"
              onChange={(e) => set("icon", e.target.value)}
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Value Editor ───────────────────────────────────────────────────────────────
export function ValueEditor({
  item, open, onSave, onClose,
}: {
  item: Partial<SocialValue> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialValue>>(
    item ?? { icon: "HandHeart", title: "", text: "", published: true }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialValue>(k: K, v: SocialValue[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { icon: form.icon, title: form.title, text: form.text, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("social_values").update(payload).eq("id", form.id)
      : await supabase.from("social_values").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer
      title={form.id ? "تعديل قيمة" : "إضافة قيمة"}
      open={open}
      onClose={onClose}
      footer={
        <DrawerFoot
          formId="value-form"
          saving={saving}
          isEdit={!!form.id}
          onClose={onClose}
          published={!!form.published}
          onTogglePublish={(v) => set("published", v)}
          error={error}
        />
      }
    >
      <form id="value-form" onSubmit={save}>
        <FormSection title="القيمة">
          <label className="inv-label">
            <span>العنوان <span className="inv-req">*</span></span>
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
              placeholder="HandHeart"
              onChange={(e) => set("icon", e.target.value)}
            />
          </label>
          <label className="inv-label">
            النص
            <textarea
              value={form.text || ""}
              className="inv-input"
              rows={3}
              style={{ resize: "vertical" }}
              onChange={(e) => set("text", e.target.value)}
            />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}
