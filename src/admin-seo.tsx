import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { SeoRow } from "./admin-types";

const PAGE_LABELS: Record<string, string> = {
  home: "الرئيسية", about: "عن الرابطة", education: "التعليم",
  health: "الصحة", investment: "الاستثمار", culture: "الثقافة",
  social: "الخدمات الاجتماعية", membership: "العضوية", contact: "تواصل معنا",
};

export default function AdminSeoSection() {
  const [rows, setRows] = useState<SeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SeoRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("page_seo").select("*").order("page_key");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (r: SeoRow) => setEditing({ ...r });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from("page_seo")
      .update({ ...editing, updated_at: new Date().toISOString() })
      .eq("id", editing.id);
    setSaving(false);
    setSaved(editing.page_key);
    setTimeout(() => setSaved(null), 2500);
    setEditing(null);
    load();
  };

  const titleScore = (t: string) => {
    const l = t.length;
    if (l === 0) return { label: "فارغ", color: "#94a3b8" };
    if (l < 30) return { label: "قصير", color: "#f59e0b" };
    if (l <= 60) return { label: "مثالي", color: "#10b981" };
    return { label: "طويل", color: "#ef4444" };
  };
  const descScore = (d: string) => {
    const l = d.length;
    if (l === 0) return { label: "فارغ", color: "#94a3b8" };
    if (l < 80) return { label: "قصير", color: "#f59e0b" };
    if (l <= 160) return { label: "مثالي", color: "#10b981" };
    return { label: "طويل", color: "#ef4444" };
  };

  return (
    <div className="adm-section">
      <div className="adm-seo-intro">
        <p>تحكم كامل في إعدادات محركات البحث لكل صفحة من صفحات الموقع. تأكد من أن كل صفحة لديها عنوان ووصف مناسبَين.</p>
      </div>
      {loading ? <div className="adm-loading">جاري التحميل...</div> : (
        <div className="adm-seo-cards">
          {rows.map(r => {
            const ts = titleScore(r.meta_title);
            const ds = descScore(r.meta_description);
            return (
              <div key={r.id} className="adm-seo-card">
                <div className="adm-seo-card-head">
                  <div>
                    <span className="adm-seo-page-key">{PAGE_LABELS[r.page_key] ?? r.page_key}</span>
                    <code className="adm-seo-slug">/{r.page_key}</code>
                  </div>
                  <div className="adm-seo-scores">
                    <span style={{ color: ts.color }} title="عنوان">العنوان: {ts.label}</span>
                    <span style={{ color: ds.color }} title="وصف">الوصف: {ds.label}</span>
                  </div>
                </div>
                <div className="adm-seo-preview">
                  <div className="adm-seo-preview-title">{r.meta_title || <em>لا يوجد عنوان</em>}</div>
                  <div className="adm-seo-preview-url">https://nilenile.org/{r.page_key}</div>
                  <div className="adm-seo-preview-desc">{r.meta_description || <em>لا يوجد وصف</em>}</div>
                </div>
                <div className="adm-seo-card-foot">
                  {saved === r.page_key && <span className="adm-saved-badge">✓ تم الحفظ</span>}
                  <button className="adm-btn-edit" onClick={() => openEdit(r)}>تعديل SEO</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-md">
            <div className="adm-modal-head">
              <h2>SEO صفحة: {PAGE_LABELS[editing.page_key] ?? editing.page_key}</h2>
              <button className="adm-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form">
                <div className="adm-form-row">
                  <label>
                    عنوان Meta Title
                    <span className="adm-char-count" style={{ color: titleScore(editing.meta_title).color }}>
                      {editing.meta_title.length}/60 — {titleScore(editing.meta_title).label}
                    </span>
                  </label>
                  <input value={editing.meta_title} onChange={e => setEditing({ ...editing, meta_title: e.target.value })} maxLength={70} />
                  <div className="adm-char-bar"><div style={{ width: `${Math.min(100, editing.meta_title.length / 60 * 100)}%`, background: titleScore(editing.meta_title).color }} /></div>
                </div>
                <div className="adm-form-row">
                  <label>
                    وصف Meta Description
                    <span className="adm-char-count" style={{ color: descScore(editing.meta_description).color }}>
                      {editing.meta_description.length}/160 — {descScore(editing.meta_description).label}
                    </span>
                  </label>
                  <textarea rows={4} value={editing.meta_description} onChange={e => setEditing({ ...editing, meta_description: e.target.value })} maxLength={180} />
                  <div className="adm-char-bar"><div style={{ width: `${Math.min(100, editing.meta_description.length / 160 * 100)}%`, background: descScore(editing.meta_description).color }} /></div>
                </div>
                <div className="adm-form-row">
                  <label>الكلمات المفتاحية (keywords)</label>
                  <input value={editing.keywords} onChange={e => setEditing({ ...editing, keywords: e.target.value })} placeholder="كلمة1, كلمة2, كلمة3" />
                  <div className="adm-form-hint">افصل بين الكلمات بفاصلة</div>
                </div>
                <div className="adm-form-row">
                  <label>صورة Open Graph (URL)</label>
                  <input value={editing.og_image} onChange={e => setEditing({ ...editing, og_image: e.target.value })} dir="ltr" placeholder="https://..." />
                  {editing.og_image && <img src={editing.og_image} alt="" className="adm-img-preview" />}
                </div>
                <div className="adm-form-row">
                  <label>Canonical URL</label>
                  <input value={editing.canonical_url} onChange={e => setEditing({ ...editing, canonical_url: e.target.value })} dir="ltr" placeholder="https://nilenile.org/..." />
                </div>
                <div className="adm-seo-google-preview">
                  <div className="adm-seo-gp-label">معاينة Google</div>
                  <div className="adm-seo-preview">
                    <div className="adm-seo-preview-title">{editing.meta_title || "لا يوجد عنوان"}</div>
                    <div className="adm-seo-preview-url">https://nilenile.org/{editing.page_key}</div>
                    <div className="adm-seo-preview-desc">{editing.meta_description || "لا يوجد وصف"}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-cancel" onClick={() => setEditing(null)}>إلغاء</button>
              <button className="adm-btn-save" onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ إعدادات SEO"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
