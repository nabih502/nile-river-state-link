import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { GalleryRow } from "./admin-types";
import { GALLERY_SECTIONS } from "./admin-utils";

const EMPTY: Omit<GalleryRow, "id" | "created_at"> = {
  title: "", section: "عام", image_url: "", description: "", sort_order: 0, published: true,
};

export default function AdminGallerySection({ onStatsChange }: { onStatsChange: () => void }) {
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("all");
  const [editing, setEditing] = useState<Partial<GalleryRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filterSection === "all" ? rows : rows.filter(r => r.section === filterSection);

  const save = async () => {
    if (!editing?.image_url) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from("gallery_items").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("gallery_items").insert(editing);
    }
    setSaving(false);
    setEditing(null);
    load();
    onStatsChange();
  };

  const togglePublish = async (r: GalleryRow) => {
    await supabase.from("gallery_items").update({ published: !r.published }).eq("id", r.id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("gallery_items").delete().eq("id", id);
    setDelConfirm(null);
    load();
    onStatsChange();
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <div className="adm-filters">
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="adm-select">
            <option value="all">كل الأقسام</option>
            {GALLERY_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="adm-section-head-actions">
          <span className="adm-count-label">{filtered.length} صورة</span>
          <button className="adm-add-btn" onClick={() => setEditing({ ...EMPTY })}>+ إضافة صورة</button>
        </div>
      </div>

      {loading ? <div className="adm-loading">جاري التحميل...</div> : (
        <div className="adm-gallery-grid">
          {filtered.map(r => (
            <div key={r.id} className={`adm-gallery-item${!r.published ? " unpublished" : ""}`}>
              <div className="adm-gallery-img-wrap">
                <img src={r.image_url} alt={r.title} loading="lazy" onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='200' height='150' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2394a3b8' dy='.3em'%3E✕%3C/text%3E%3C/svg%3E"; }} />
                {!r.published && <div className="adm-gallery-hidden-badge">مخفي</div>}
              </div>
              <div className="adm-gallery-info">
                <div className="adm-gallery-title">{r.title || "(بدون عنوان)"}</div>
                <div className="adm-gallery-section"><span className="adm-pill blue">{r.section}</span></div>
              </div>
              <div className="adm-gallery-actions">
                <button className="adm-btn-edit" onClick={() => setEditing({ ...r })}>تعديل</button>
                <button className={`adm-pill toggle ${r.published ? "green" : "gray"}`} onClick={() => togglePublish(r)}>{r.published ? "ظاهر" : "مخفي"}</button>
                <button className="adm-btn-del" onClick={() => setDelConfirm(r.id)}>حذف</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="adm-gallery-empty">
              <p>لا توجد صور في هذا القسم</p>
              <button className="adm-add-btn" onClick={() => setEditing({ ...EMPTY })}>+ إضافة صورة</button>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-md">
            <div className="adm-modal-head">
              <h2>{editing.id ? "تعديل الصورة" : "إضافة صورة"}</h2>
              <button className="adm-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form">
                <div className="adm-form-row">
                  <label>رابط الصورة (URL) *</label>
                  <input value={editing.image_url ?? ""} onChange={e => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" placeholder="https://..." />
                  {editing.image_url && (
                    <div className="adm-gallery-preview">
                      <img src={editing.image_url} alt="" />
                    </div>
                  )}
                </div>
                <div className="adm-form-row2">
                  <div className="adm-form-row">
                    <label>العنوان</label>
                    <input value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                  </div>
                  <div className="adm-form-row">
                    <label>القسم</label>
                    <select value={editing.section ?? "عام"} onChange={e => setEditing({ ...editing, section: e.target.value })}>
                      {GALLERY_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="adm-form-row2">
                  <div className="adm-form-row">
                    <label>الترتيب</label>
                    <input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} />
                  </div>
                  <div className="adm-form-row">
                    <label>الحالة</label>
                    <label className="adm-toggle">
                      <input type="checkbox" checked={!!editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} />
                      <span>{editing.published ? "ظاهر" : "مخفي"}</span>
                    </label>
                  </div>
                </div>
                <div className="adm-form-row">
                  <label>وصف الصورة</label>
                  <textarea rows={3} value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-cancel" onClick={() => setEditing(null)}>إلغاء</button>
              <button className="adm-btn-save" onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-sm">
            <div className="adm-modal-head"><h2>تأكيد الحذف</h2></div>
            <div className="adm-modal-body"><p>هل أنت متأكد من حذف هذه الصورة؟</p></div>
            <div className="adm-modal-foot">
              <button className="adm-btn-cancel" onClick={() => setDelConfirm(null)}>إلغاء</button>
              <button className="adm-btn-danger" onClick={() => del(delConfirm)}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
