import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { MemberRow } from "./admin-types";
import { formatDate } from "./admin-utils";

const STATUS_LABEL: Record<string, string> = { active: "نشط", pending: "معلق", rejected: "مرفوض", suspended: "موقوف" };
const STATUS_COLOR: Record<string, string> = { active: "green", pending: "yellow", rejected: "red", suspended: "gray" };
const MEMBER_TYPES = ["عادي", "مؤسس", "فخري", "داعم"];

export default function AdminMembersSection({ onStatsChange }: { onStatsChange: () => void }) {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [viewing, setViewing] = useState<MemberRow | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("members").select("id,full_name,email,phone,national_id,gender,country,state,city,membership_type,status,created_at,member_number,job_title,specialization").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => {
    if (search && !r.full_name?.includes(search) && !r.email?.includes(search) && !r.phone?.includes(search) && !r.member_number?.includes(search)) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterType !== "all" && r.membership_type !== filterType) return false;
    return true;
  });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("members").update({ status }).eq("id", id);
    if (viewing?.id === id) setViewing({ ...viewing, status } as MemberRow);
    load();
    onStatsChange();
  };

  const exportCsv = () => {
    const header = "الاسم,الرقم,البريد,الهاتف,النوع,الحالة,الدولة,الولاية,تاريخ التسجيل\n";
    const body = filtered.map(r => [r.full_name, r.member_number, r.email, r.phone, r.membership_type, r.status, r.country, r.state, formatDate(r.created_at)].join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "members.csv"; a.click();
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <div className="adm-filters">
          <input placeholder="بحث بالاسم أو الهاتف أو رقم العضوية..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="adm-search" />
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="adm-select">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="rejected">مرفوض</option>
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="adm-select">
            <option value="all">كل الأنواع</option>
            {MEMBER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="adm-section-head-actions">
          <span className="adm-count-label">{filtered.length} عضو</span>
          <button className="adm-export-btn" onClick={exportCsv}>تصدير CSV</button>
        </div>
      </div>

      {loading ? <div className="adm-loading">جاري التحميل...</div> : (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>العضو</th><th>رقم العضوية</th><th>الاتصال</th><th>النوع</th><th>الحالة</th><th>تاريخ التسجيل</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-member-cell">
                        <div className="adm-member-avatar">{r.full_name?.[0] ?? "؟"}</div>
                        <div>
                          <div className="adm-cell-title">{r.full_name}</div>
                          <div className="adm-cell-sub">{r.state} · {r.country}</div>
                        </div>
                      </div>
                    </td>
                    <td><code>{r.member_number || "-"}</code></td>
                    <td>
                      <div>{r.email || "-"}</div>
                      <div className="adm-cell-sub">{r.phone || "-"}</div>
                    </td>
                    <td><span className="adm-pill blue">{r.membership_type}</span></td>
                    <td><span className={`adm-pill ${STATUS_COLOR[r.status] ?? "gray"}`}>{STATUS_LABEL[r.status] ?? r.status}</span></td>
                    <td>{formatDate(r.created_at)}</td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-btn-edit" onClick={() => setViewing(r)}>عرض</button>
                        {r.status === "pending" && <button className="adm-btn-approve" onClick={() => setStatus(r.id, "active")}>قبول</button>}
                        {r.status !== "rejected" && <button className="adm-btn-del" onClick={() => setStatus(r.id, "rejected")}>رفض</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && <tr><td colSpan={7} className="adm-empty">لا توجد نتائج</td></tr>}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="adm-pagination">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      {viewing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-md">
            <div className="adm-modal-head">
              <h2>بيانات العضو</h2>
              <button className="adm-modal-close" onClick={() => setViewing(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-member-profile">
                <div className="adm-member-avatar-lg">{viewing.full_name?.[0] ?? "؟"}</div>
                <div className="adm-member-profile-name">{viewing.full_name}</div>
                <div><code className="adm-member-num">{viewing.member_number || "لم يُعيَّن"}</code></div>
                <span className={`adm-pill ${STATUS_COLOR[viewing.status] ?? "gray"}`}>{STATUS_LABEL[viewing.status] ?? viewing.status}</span>
              </div>
              <div className="adm-member-details">
                {[
                  ["البريد الإلكتروني", viewing.email],
                  ["رقم الهاتف", viewing.phone],
                  ["الرقم الوطني", viewing.national_id],
                  ["الجنس", viewing.gender],
                  ["الدولة", viewing.country],
                  ["الولاية", viewing.state],
                  ["المدينة", viewing.city],
                  ["نوع العضوية", viewing.membership_type],
                  ["المسمى الوظيفي", viewing.job_title],
                  ["التخصص", viewing.specialization],
                  ["تاريخ التسجيل", formatDate(viewing.created_at)],
                ].map(([label, val]) => val ? (
                  <div key={label as string} className="adm-detail-row">
                    <span className="adm-detail-label">{label}</span>
                    <span className="adm-detail-val">{val}</span>
                  </div>
                ) : null)}
              </div>
            </div>
            <div className="adm-modal-foot">
              {viewing.status !== "active" && <button className="adm-btn-approve" onClick={() => setStatus(viewing.id, "active")}>قبول العضو</button>}
              {viewing.status !== "rejected" && <button className="adm-btn-danger" onClick={() => setStatus(viewing.id, "rejected")}>رفض العضو</button>}
              {viewing.status !== "pending" && <button className="adm-btn-cancel" onClick={() => setStatus(viewing.id, "pending")}>إعادة للانتظار</button>}
              <button className="adm-btn-cancel" onClick={() => setViewing(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
