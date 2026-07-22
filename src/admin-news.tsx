import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { NewsRow } from "./admin-types";
import { formatDate, slugify, NEWS_CATS } from "./admin-utils";

const EMPTY: Omit<NewsRow, "id" | "created_at"> = {
  title: "", slug: "", excerpt: "", body: "", image_url: "",
  category: "عام", published: false, published_at: null,
  seo_title: "", seo_description: "", seo_image: "",
};

export default function AdminNewsSection({ onStatsChange }: { onStatsChange: () => void }) {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterPub, setFilterPub] = useState("all");
  const [editing, setEditing] = useState<Partial<NewsRow> | null>(null);
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => {
    if (search && !r.title.includes(search) && !r.excerpt.includes(search)) return false;
    if (filterCat !== "all" && r.category !== filterCat) return false;
    if (filterPub === "pub" && !r.published) return false;
    if (filterPub === "draft" && r.published) return false;
    return true;
  });

  const openNew = () => { setEditing({ ...EMPTY }); setTab("content"); };
  const openEdit = (r: NewsRow) => { setEditing({ ...r }); setTab("content"); };

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const payload = { ...editing };
    if (!payload.slug) payload.slug = slugify(payload.title ?? "");
    if (editing.id) {
      await supabase.from("news").update(payload).eq("id", editing.id);
    } else {
      if (payload.published) payload.published_at = new Date().toISOString();
      await supabase.from("news").insert(payload);
    }
    setSaving(false);
    setEditing(null);
    load();
    onStatsChange();
  };

  const togglePublish = async (r: NewsRow) => {
    await supabase.from("news").update({ published: !r.published, published_at: !r.published ? new Date().toISOString() : null }).eq("id", r.id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("news").delete().eq("id", id);
    setDelConfirm(null);
    load();
    onStatsChange();
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <div className="adm-filters">
          <input placeholder="بحث في الأخبار..." value={search} onChange={e => setSearch(e.target.value)} className="adm-search" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="adm-select">
            <option value="all">كل التصنيفات</option>
            {NEWS_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterPub} onChange={e => setFilterPub(e.target.value)} className="adm-select">
            <option value="all">الكل</option>
            <option value="pub">منشور</option>
            <option value="draft">مسودة</option>
          </select>
        </div>
        <button className="adm-add-btn" onClick={openNew}>+ خبر جديد</button>
      </div>

      {loading ? <div className="adm-loading">جاري التحميل...</div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>العنوان</th><th>التصنيف</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="adm-cell-title">{r.title}</div>
                    {r.image_url && <img src={r.image_url} alt="" className="adm-row-thumb" />}
                  </td>
                  <td><span className="adm-pill blue">{r.category}</span></td>
                  <td>
                    <button className={`adm-pill toggle ${r.published ? "green" : "gray"}`} onClick={() => togglePublish(r)}>
                      {r.published ? "منشور" : "مسودة"}
                    </button>
                  </td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-btn-edit" onClick={() => openEdit(r)}>تعديل</button>
                      <button className="adm-btn-del" onClick={() => setDelConfirm(r.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="adm-empty">لا توجد نتائج</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {editing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-lg">
            <div className="adm-modal-head">
              <h2>{editing.id ? "تعديل خبر" : "خبر جديد"}</h2>
              <button className="adm-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="adm-editor-tabs">
              <button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>المحتوى</button>
              <button className={tab === "seo" ? "active" : ""} onClick={() => setTab("seo")}>SEO</button>
            </div>
            <div className="adm-modal-body">
              {tab === "content" && (
                <div className="adm-form">
                  <div className="adm-form-row">
                    <label>العنوان *</label>
                    <input value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
                  </div>
                  <div className="adm-form-row">
                    <label>الـ Slug</label>
                    <input value={editing.slug ?? ""} onChange={e => setEditing({ ...editing, slug: e.target.value })} dir="ltr" />
                  </div>
                  <div className="adm-form-row2">
                    <div className="adm-form-row">
                      <label>التصنيف</label>
                      <select value={editing.category ?? "عام"} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                        {NEWS_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="adm-form-row">
                      <label>الحالة</label>
                      <label className="adm-toggle">
                        <input type="checkbox" checked={!!editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} />
                        <span>{editing.published ? "منشور" : "مسودة"}</span>
                      </label>
                    </div>
                  </div>
                  <div className="adm-form-row">
                    <label>صورة الخبر (URL)</label>
                    <input value={editing.image_url ?? ""} onChange={e => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" placeholder="https://..." />
                    {editing.image_url && <img src={editing.image_url} alt="" className="adm-img-preview" />}
                  </div>
                  <div className="adm-form-row">
                    <label>الملخص</label>
                    <textarea rows={2} value={editing.excerpt ?? ""} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
                  </div>
                  <div className="adm-form-row">
                    <label>المحتوى الكامل</label>
                    <textarea rows={12} value={editing.body ?? ""} onChange={e => setEditing({ ...editing, body: e.target.value })} className="adm-body-editor" />
                  </div>
                </div>
              )}
              {tab === "seo" && (
                <div className="adm-form">
                  <div className="adm-seo-hint">إعدادات تحسين محركات البحث لهذا الخبر تحديداً</div>
                  <div className="adm-form-row">
                    <label>عنوان SEO <span className="adm-char-count">{(editing.seo_title ?? "").length}/60</span></label>
                    <input value={editing.seo_title ?? ""} onChange={e => setEditing({ ...editing, seo_title: e.target.value })} maxLength={60} />
                    <div className="adm-char-bar"><div style={{ width: `${Math.min(100, (editing.seo_title ?? "").length / 60 * 100)}%`, background: (editing.seo_title ?? "").length > 60 ? "#dc2626" : "#2563eb" }} /></div>
                  </div>
                  <div className="adm-form-row">
                    <label>وصف SEO <span className="adm-char-count">{(editing.seo_description ?? "").length}/160</span></label>
                    <textarea rows={3} value={editing.seo_description ?? ""} onChange={e => setEditing({ ...editing, seo_description: e.target.value })} maxLength={160} />
                    <div className="adm-char-bar"><div style={{ width: `${Math.min(100, (editing.seo_description ?? "").length / 160 * 100)}%`, background: (editing.seo_description ?? "").length > 160 ? "#dc2626" : "#2563eb" }} /></div>
                  </div>
                  <div className="adm-form-row">
                    <label>صورة Open Graph (URL)</label>
                    <input value={editing.seo_image ?? ""} onChange={e => setEditing({ ...editing, seo_image: e.target.value })} dir="ltr" placeholder="https://..." />
                  </div>
                </div>
              )}
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-cancel" onClick={() => setEditing(null)}>إلغاء</button>
              <button className="adm-btn-save" onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-sm">
            <div className="adm-modal-head"><h2>تأكيد الحذف</h2></div>
            <div className="adm-modal-body"><p>هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع.</p></div>
            <div className="adm-modal-foot">
              <button className="adm-btn-cancel" onClick={() => setDelConfirm(null)}>إلغاء</button>
              <button className="adm-btn-danger" onClick={() => del(delConfirm)}>حذف نهائياً</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
