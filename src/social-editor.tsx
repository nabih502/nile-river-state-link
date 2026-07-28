import React, { useState, useRef } from "react";
import { supabase } from "./supabase";
import { SocialService, SocialInitiative, SocialStat, SocialValue } from "./supabase";

// ── Shared helpers (mirror of culture-editor) ─────────────────────────────────
function Drawer({ title, open, onClose, footer, children }: {
  title: string; open: boolean; onClose: () => void;
  footer: React.ReactNode; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="adm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-drawer">
        <div className="adm-drawer-head">
          <h2>{title}</h2>
          <button type="button" className="adm-drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="inv-drawer-body">{children}</div>
        {footer}
      </div>
    </div>
  );
}

function DrawerFoot({ formId, saving, isEdit, onClose, published, onTogglePublish, error }: {
  formId: string; saving: boolean; isEdit: boolean; onClose: () => void;
  published: boolean; onTogglePublish: (v: boolean) => void; error: string;
}) {
  return (
    <div className="adm-drawer-foot">
      {error && <p className="inv-err">{error}</p>}
      <label className="inv-toggle">
        <input type="checkbox" checked={published} onChange={(e) => onTogglePublish(e.target.checked)} />
        <span>{published ? "منشور" : "مسودة"}</span>
      </label>
      <div className="adm-drawer-foot-actions">
        <button type="button" className="inv-btn-ghost" onClick={onClose}>إلغاء</button>
        <button type="submit" form={formId} className="inv-btn-primary" disabled={saving}>
          {saving ? "جاري الحفظ..." : isEdit ? "تحديث" : "إضافة"}
        </button>
      </div>
    </div>
  );
}

function FormSection({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <div className="inv-form-section" id={id}>
      <div className="inv-form-section-title">{title}</div>
      <div className="inv-form-section-body">{children}</div>
    </div>
  );
}

export function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    const ext = file.name.split(".").pop();
    const path = `social/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("images").upload(path, file);
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };
  return (
    <div className="inv-image-upload">
      <label className="inv-label">{label}</label>
      {value && <img src={value} alt="" className="inv-image-preview" />}
      <div className="inv-image-upload-row">
        <input value={value} className="inv-input" placeholder="رابط الصورة أو ارفع ملف..." onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="inv-btn-ghost" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? "..." : "رفع"}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={upload} />
      {error && <p className="inv-err">{error}</p>}
    </div>
  );
}

// ── Service Editor ─────────────────────────────────────────────────────────────
export function ServiceEditor({ item, open, onSave, onClose }: {
  item: Partial<SocialService> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialService>>(
    item ?? { icon: "HeartHandshake", title: "", lead: "", bullet_1: "", bullet_2: "", bullet_3: "", bullet_4: "", action_label: "تواصل معنا", slug: "", full_description: "", image_url: "", published: true }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialService>(k: K, v: SocialService[K]) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = {
      icon: form.icon, title: form.title, lead: form.lead,
      bullet_1: form.bullet_1 || "", bullet_2: form.bullet_2 || "", bullet_3: form.bullet_3 || "", bullet_4: form.bullet_4 || "",
      action_label: form.action_label,
      slug: form.slug || toSlug(form.title || "") || `service-${Date.now()}`,
      full_description: form.full_description || "",
      image_url: form.image_url || "",
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("social_services").update(payload).eq("id", form.id)
      : await supabase.from("social_services").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer title={form.id ? "تعديل خدمة" : "إضافة خدمة"} open={open} onClose={onClose}
      footer={<DrawerFoot formId="service-form" saving={saving} isEdit={!!form.id} onClose={onClose} published={!!form.published} onTogglePublish={(v) => set("published", v)} error={error} />}>
      <form id="service-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <label className="inv-label">
            <span>العنوان <span className="inv-req">*</span></span>
            <input required value={form.title || ""} className="inv-input" onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="inv-label">
            الرابط المختصر (Slug)
            <input value={form.slug || ""} className="inv-input" dir="ltr" placeholder="يُولَّد تلقائياً من العنوان" onChange={(e) => set("slug", e.target.value)} />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              الأيقونة (Lucide)
              <input value={form.icon || ""} className="inv-input" dir="ltr" placeholder="HeartHandshake" onChange={(e) => set("icon", e.target.value)} />
            </label>
            <label className="inv-label">
              نص زر الإجراء
              <input value={form.action_label || ""} className="inv-input" placeholder="تواصل معنا" onChange={(e) => set("action_label", e.target.value)} />
            </label>
          </div>
          <label className="inv-label">
            النص التعريفي المختصر
            <textarea value={form.lead || ""} className="inv-input" rows={2} placeholder="وصف موجز للخدمة..." style={{ resize: "vertical" }} onChange={(e) => set("lead", e.target.value)} />
          </label>
          <label className="inv-label">
            الوصف التفصيلي الكامل (يظهر في صفحة الخدمة)
            <textarea value={form.full_description || ""} className="inv-input" rows={6} placeholder="اكتب وصفاً تفصيلياً يظهر عند فتح صفحة الخدمة..." style={{ resize: "vertical" }} onChange={(e) => set("full_description", e.target.value)} />
          </label>
        </FormSection>
        <FormSection title="ما تشمله الخدمة (4 نقاط)">
          {(["bullet_1","bullet_2","bullet_3","bullet_4"] as const).map((k, i) => (
            <label className="inv-label" key={k}>
              النقطة {i + 1}
              <input value={form[k] || ""} className="inv-input" onChange={(e) => set(k, e.target.value)} />
            </label>
          ))}
        </FormSection>
        <FormSection title="الصورة">
          <ImageUpload value={form.image_url || ""} onChange={(url) => set("image_url", url)} label="صورة الخدمة (تظهر في صفحة التفاصيل)" />
        </FormSection>
      </form>
    </Drawer>
  );
}

function toSlug(s: string) {
  return s.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06ffa-z0-9-]/gi, "").slice(0, 60);
}

// ── Initiative Editor ──────────────────────────────────────────────────────────
export function SocialInitiativeEditor({ item, open, onSave, onClose }: {
  item: Partial<SocialInitiative> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialInitiative>>(
    item ?? { image_url: "", title: "", text: "", full_description: "", slug: "", progress: 0, amount: "", icon: "♡", action_label: "ساهم الآن", published: true }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialInitiative>(k: K, v: SocialInitiative[K]) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = {
      image_url: form.image_url,
      title: form.title,
      text: form.text,
      full_description: form.full_description || "",
      slug: form.slug || toSlug(form.title || "") || `initiative-${Date.now()}`,
      progress: Number(form.progress) || 0,
      amount: form.amount,
      icon: form.icon,
      action_label: form.action_label,
      published: form.published,
    };
    const { error: err } = form.id
      ? await supabase.from("social_initiatives").update(payload).eq("id", form.id)
      : await supabase.from("social_initiatives").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer title={form.id ? "تعديل مبادرة" : "إضافة مبادرة"} open={open} onClose={onClose}
      footer={<DrawerFoot formId="soc-init-form" saving={saving} isEdit={!!form.id} onClose={onClose} published={!!form.published} onTogglePublish={(v) => set("published", v)} error={error} />}>
      <form id="soc-init-form" onSubmit={save}>
        <FormSection title="المعلومات الأساسية">
          <label className="inv-label">
            <span>العنوان <span className="inv-req">*</span></span>
            <input required value={form.title || ""} className="inv-input" onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="inv-label">
            الرابط المختصر (Slug)
            <input value={form.slug || ""} className="inv-input" dir="ltr" placeholder="يُولَّد تلقائياً من العنوان" onChange={(e) => set("slug", e.target.value)} />
          </label>
          <label className="inv-label">
            الوصف المختصر (يظهر في البطاقة)
            <textarea value={form.text || ""} className="inv-input" rows={3} style={{ resize: "vertical" }} onChange={(e) => set("text", e.target.value)} />
          </label>
          <label className="inv-label">
            الوصف التفصيلي الكامل (يظهر في صفحة المبادرة)
            <textarea value={form.full_description || ""} className="inv-input" rows={6} placeholder="اكتب وصفاً تفصيلياً يظهر عند فتح صفحة المبادرة..." style={{ resize: "vertical" }} onChange={(e) => set("full_description", e.target.value)} />
          </label>
          <div className="inv-form-row">
            <label className="inv-label">
              الأيقونة
              <input value={form.icon || ""} className="inv-input" placeholder="♡" onChange={(e) => set("icon", e.target.value)} />
            </label>
            <label className="inv-label">
              المبلغ المستهدف
              <input value={form.amount || ""} className="inv-input" placeholder="30,000 جنيه" onChange={(e) => set("amount", e.target.value)} />
            </label>
          </div>
          <label className="inv-label">
            نسبة الإنجاز ({form.progress || 0}%)
            <input type="range" min={0} max={100} value={form.progress || 0} className="inv-input" onChange={(e) => set("progress", Number(e.target.value))} />
          </label>
          <label className="inv-label">
            نص زر الإجراء
            <input value={form.action_label || ""} className="inv-input" placeholder="ساهم الآن" onChange={(e) => set("action_label", e.target.value)} />
          </label>
        </FormSection>
        <FormSection title="الصورة">
          <ImageUpload value={form.image_url || ""} onChange={(url) => set("image_url", url)} label="صورة المبادرة" />
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Stat Editor ────────────────────────────────────────────────────────────────
export function StatEditor({ item, open, onSave, onClose }: {
  item: Partial<SocialStat> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialStat>>(
    item ?? { value: "", label: "", icon: "UsersRound" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialStat>(k: K, v: SocialStat[K]) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = { value: form.value, label: form.label, icon: form.icon };
    const { error: err } = form.id
      ? await supabase.from("social_stats").update(payload).eq("id", form.id)
      : await supabase.from("social_stats").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer title={form.id ? "تعديل إحصائية" : "إضافة إحصائية"} open={open} onClose={onClose}
      footer={
        <div className="adm-drawer-foot">
          {error && <p className="inv-err">{error}</p>}
          <div className="adm-drawer-foot-actions">
            <button type="button" className="inv-btn-ghost" onClick={onClose}>إلغاء</button>
            <button type="submit" form="stat-form" className="inv-btn-primary" disabled={saving}>{saving ? "جاري الحفظ..." : form.id ? "تحديث" : "إضافة"}</button>
          </div>
        </div>
      }>
      <form id="stat-form" onSubmit={save}>
        <FormSection title="الإحصائية">
          <label className="inv-label">
            <span>القيمة <span className="inv-req">*</span></span>
            <input required value={form.value || ""} className="inv-input" placeholder="12,680+" onChange={(e) => set("value", e.target.value)} />
          </label>
          <label className="inv-label">
            التسمية
            <input value={form.label || ""} className="inv-input" placeholder="مستفيد من خدماتنا" onChange={(e) => set("label", e.target.value)} />
          </label>
          <label className="inv-label">
            الأيقونة (Lucide)
            <input value={form.icon || ""} className="inv-input" dir="ltr" placeholder="UsersRound" onChange={(e) => set("icon", e.target.value)} />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}

// ── Value Editor ───────────────────────────────────────────────────────────────
export function ValueEditor({ item, open, onSave, onClose }: {
  item: Partial<SocialValue> | null; open: boolean; onSave: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialValue>>(
    item ?? { icon: "HandHeart", title: "", text: "", published: true }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof SocialValue>(k: K, v: SocialValue[K]) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = { icon: form.icon, title: form.title, text: form.text, published: form.published };
    const { error: err } = form.id
      ? await supabase.from("social_values").update(payload).eq("id", form.id)
      : await supabase.from("social_values").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <Drawer title={form.id ? "تعديل قيمة" : "إضافة قيمة"} open={open} onClose={onClose}
      footer={<DrawerFoot formId="value-form" saving={saving} isEdit={!!form.id} onClose={onClose} published={!!form.published} onTogglePublish={(v) => set("published", v)} error={error} />}>
      <form id="value-form" onSubmit={save}>
        <FormSection title="القيمة">
          <label className="inv-label">
            <span>العنوان <span className="inv-req">*</span></span>
            <input required value={form.title || ""} className="inv-input" onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="inv-label">
            الأيقونة (Lucide)
            <input value={form.icon || ""} className="inv-input" dir="ltr" placeholder="HandHeart" onChange={(e) => set("icon", e.target.value)} />
          </label>
          <label className="inv-label">
            النص
            <textarea value={form.text || ""} className="inv-input" rows={3} style={{ resize: "vertical" }} onChange={(e) => set("text", e.target.value)} />
          </label>
        </FormSection>
      </form>
    </Drawer>
  );
}
