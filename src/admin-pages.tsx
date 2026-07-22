import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { PageRow } from "./admin-types";
import { formatDate, PAGE_TYPES } from "./admin-utils";

const EMPTY: Omit<PageRow, "id" | "created_at" | "updated_at"> = {
  title: "", page_type: "custom", subtitle: "", body: "",
  image_url: "", icon: "", published: true, sort_order: 0,
};

const SECTION_LABELS: Record<string, string> = {
  home: "الرئيسية", about: "عن الرابطة", education: "التعليم",
  health: "الصحة", investment: "الاستثمار", culture: "الثقافة",
  social: "الخدمات الاجتماعية", membership: "العضوية",
  contact: "تواصل معنا", custom: "مخصصة",
};

export default function AdminPagesSection({ onStatsChange }: { onStatsChange: () => void }) {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PageRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("pages").select("*").order("sort_order");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    !search || r.title.includes(search) || (r.page_type ?? "").includes(search)
  );

  const openNew = () => setEditing({ ...EMPTY });
  const openEdit = (r: PageRow) => setEditing({ ...r });

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from("pages").update({ ...editing, updated_at: new Date().toISOString() }).eq("id", editing.id);
    } else {
      await supabase.from("pages").insert(editing);
    }
    setSaving(false);
    setEditing(null);
    load();
    onStatsChange();
  };

  const togglePublish = async (r: PageRow) => {
    await supabase.from("pages").update({ published: !r.published }).eq("id", r.id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("pages").delete().eq("id", id);
    setDelConfirm(null);
    load();
    onStatsChange();
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <div className="adm-filters">
          <input placeholder="بحث في الصفحات..." value={search} onChange={e => setSearch(e.target.value)} className="adm-search" />
        </div>
        <button className="adm-add-btn" onClick={openNew}>+ صفحة جديدة</button>
      </div>

      {loading ? <div className="adm-loading">جاري التحميل...</div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>العنوان</th><th>النوع</th><th>الترتيب</th><th>آخر تحديث</th><th>الحالة</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="adm-cell-title">{r.title}</div>
                    {r.subtitle && <div className="adm-cell-sub">{r.subtitle.slice(0, 60)}</div>}
                  </td>
                  <td><span className="adm-pill blue">{SECTION_LABELS[r.page_type] ?? r.page_type}</span></td>
                  <td>{r.sort_order}</td>
                  <td>{formatDate(r.updated_at || r.created_at)}</td>
                  <td>
                    <button className={`adm-pill toggle ${r.published ? "green" : "gray"}`} onClick={() => togglePublish(r)}>
                      {r.published ? "مفعّل" : "مخفي"}
                    </button>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-btn-edit" onClick={() => openEdit(r)}>تعديل</button>
                      <button className="adm-btn-del" onClick={() => setDelConfirm(r.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="adm-empty">لا توجد صفحات مضافة بعد</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-lg">
            <div className="adm-modal-head">
              <h2>{editing.id ? "تعديل الصفحة" : "صفحة جديدة"}</h2>
              <button className="adm-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form">
                <div className="adm-form-row2">
                  <div className="adm-form-row">
                    <label>عنوان الصفحة *</label>
                    <input value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                  </div>
                  <div className="adm-form-row">
                    <label>نوع الصفحة</label>
                    <select value={editing.page_type ?? "custom"} onChange={e => setEditing({ ...editing, page_type: e.target.value })}>
                      {PAGE_TYPES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="adm-form-row">
                  <label>العنوان الفرعي</label>
                  <input value={editing.subtitle ?? ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
                </div>
                <div className="adm-form-row2">
                  <div className="adm-form-row">
                    <label>صورة الهيرو (URL)</label>
                    <input value={editing.image_url ?? ""} onChange={e => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" placeholder="https://..." />
                    {editing.image_url && <img src={editing.image_url} alt="" className="adm-img-preview" />}
                  </div>
                  <div className="adm-form-row">
                    <label>الأيقونة (emoji/SVG)</label>
                    <input value={editing.icon ?? ""} onChange={e => setEditing({ ...editing, icon: e.target.value })} />
                    <div className="adm-form-hint">مثال: 🏫 أو كود SVG</div>
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
                      <span>{editing.published ? "مفعّل" : "مخفي"}</span>
                    </label>
                  </div>
                </div>
                <div className="adm-form-row">
                  <label>محتوى الصفحة</label>
                  <textarea rows={14} value={editing.body ?? ""} onChange={e => setEditing({ ...editing, body: e.target.value })} className="adm-body-editor" placeholder="يمكنك استخدام HTML أو نص عادي..." />
                </div>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-cancel" onClick={() => setEditing(null)}>إلغاء</button>
              <button className="adm-btn-save" onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ الصفحة"}</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-sm">
            <div className="adm-modal-head"><h2>تأكيد الحذف</h2></div>
            <div className="adm-modal-body"><p>هل أنت متأكد من حذف هذه الصفحة؟</p></div>
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
