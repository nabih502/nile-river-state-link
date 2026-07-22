import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { MessageRow } from "./admin-types";
import { formatDate } from "./admin-utils";

export default function AdminMessagesSection({ onStatsChange }: { onStatsChange: () => void }) {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<MessageRow | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => {
    if (search && !r.name?.includes(search) && !r.email?.includes(search) && !r.subject?.includes(search)) return false;
    if (filterRead === "unread" && r.read) return false;
    if (filterRead === "read" && !r.read) return false;
    return true;
  });

  const openView = async (r: MessageRow) => {
    setViewing(r);
    if (!r.read) {
      await supabase.from("contact_messages").update({ read: true }).eq("id", r.id);
      setRows(prev => prev.map(x => x.id === r.id ? { ...x, read: true } : x));
      onStatsChange();
    }
  };

  const toggleRead = async (r: MessageRow) => {
    await supabase.from("contact_messages").update({ read: !r.read }).eq("id", r.id);
    load();
    onStatsChange();
  };

  const del = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setDelConfirm(null);
    if (viewing?.id === id) setViewing(null);
    load();
    onStatsChange();
  };

  const unreadCount = rows.filter(r => !r.read).length;

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <div className="adm-filters">
          <input placeholder="بحث في الرسائل..." value={search} onChange={e => setSearch(e.target.value)} className="adm-search" />
          <select value={filterRead} onChange={e => setFilterRead(e.target.value)} className="adm-select">
            <option value="all">كل الرسائل</option>
            <option value="unread">غير مقروءة {unreadCount > 0 ? `(${unreadCount})` : ""}</option>
            <option value="read">مقروءة</option>
          </select>
        </div>
        <span className="adm-count-label">{filtered.length} رسالة</span>
      </div>

      {loading ? <div className="adm-loading">جاري التحميل...</div> : (
        <div className="adm-messages-list">
          {filtered.map(r => (
            <div key={r.id} className={`adm-msg-row${!r.read ? " unread" : ""}`} onClick={() => openView(r)}>
              <div className="adm-msg-avatar">{r.name?.[0] ?? "؟"}</div>
              <div className="adm-msg-info">
                <div className="adm-msg-header">
                  <span className="adm-msg-name">{r.name}</span>
                  <span className="adm-msg-date">{formatDate(r.created_at)}</span>
                </div>
                <div className="adm-msg-subject">{r.subject || "(بدون موضوع)"}</div>
                <div className="adm-msg-preview">{r.message?.slice(0, 100)}</div>
              </div>
              <div className="adm-msg-actions" onClick={e => e.stopPropagation()}>
                <button className="adm-btn-icon" onClick={() => toggleRead(r)} title={r.read ? "تحديد كغير مقروء" : "تحديد كمقروء"}>
                  {r.read ? "◎" : "●"}
                </button>
                <button className="adm-btn-del-sm" onClick={() => setDelConfirm(r.id)} title="حذف">✕</button>
              </div>
              {!r.read && <div className="adm-msg-dot" />}
            </div>
          ))}
          {filtered.length === 0 && <div className="adm-empty-state"><p>لا توجد رسائل</p></div>}
        </div>
      )}

      {viewing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-md">
            <div className="adm-modal-head">
              <h2>رسالة من: {viewing.name}</h2>
              <button className="adm-modal-close" onClick={() => setViewing(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-msg-detail">
                <div className="adm-msg-meta-grid">
                  {[
                    ["الاسم", viewing.name],
                    ["البريد الإلكتروني", viewing.email],
                    ["الهاتف", viewing.phone],
                    ["الموضوع", viewing.subject],
                    ["التاريخ", formatDate(viewing.created_at)],
                  ].map(([label, val]) => (
                    <div key={label as string} className="adm-detail-row">
                      <span className="adm-detail-label">{label}</span>
                      <span className="adm-detail-val">{val || "-"}</span>
                    </div>
                  ))}
                </div>
                <div className="adm-msg-body">{viewing.message}</div>
              </div>
            </div>
            <div className="adm-modal-foot">
              {viewing.email && (
                <a href={`mailto:${viewing.email}?subject=رد: ${encodeURIComponent(viewing.subject ?? "")}`}
                  className="adm-btn-save" style={{ textDecoration: "none" }}>
                  الرد عبر البريد
                </a>
              )}
              <button className="adm-btn-danger" onClick={() => setDelConfirm(viewing.id)}>حذف الرسالة</button>
              <button className="adm-btn-cancel" onClick={() => setViewing(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-sm">
            <div className="adm-modal-head"><h2>حذف الرسالة</h2></div>
            <div className="adm-modal-body"><p>هل أنت متأكد من حذف هذه الرسالة؟</p></div>
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
