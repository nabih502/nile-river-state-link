import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type {
  InvestmentSector,
  InvestmentOpportunity,
  InvestmentIncentive,
  InvestmentSuccessStory,
  InvestmentPartner,
  InvestmentStat,
  InvestmentInquiry,
} from "./supabase";
import {
  SectorEditor,
  OpportunityEditor,
  IncentiveEditor,
  StoryEditor,
  PartnerEditor,
  StatEditor,
} from "./investment-editor";

import { SeoTabContent } from "./admin-seo";
type InvTab =
  | "sectors"
  | "opportunities"
  | "incentives"
  | "stories"
  | "partners"
  | "stats"
  | "inquiries"
  | "seo";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function Confirm({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="adm-overlay">
      <div className="adm-confirm">
        <p>{message}</p>
        <div>
          <button className="adm-btn-danger" onClick={onConfirm}>
            تأكيد الحذف
          </button>
          <button onClick={onCancel}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "gray" | "teal";
}) {
  return <span className={`inv-badge inv-badge-${color}`}>{children}</span>;
}

// ── Drag Handle Icon ──────────────────────────────────────────────────────────
function DragHandle() {
  return (
    <div className="inv-drag-handle" title="اسحب لإعادة الترتيب">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({
  title,
  count,
  onAdd,
  addLabel,
}: {
  title: string;
  count: number;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="inv-section-head">
      <div className="inv-section-head-title">
        <h2>{title}</h2>
        <span className="inv-section-count">{count}</span>
      </div>
      <button className="adm-btn-primary" onClick={onAdd}>
        + {addLabel}
      </button>
    </div>
  );
}

// ── useDragSort hook ──────────────────────────────────────────────────────────
function useDragSort<T extends { id: string }>(
  items: T[],
  setItems: (items: T[]) => void,
  tableName: string
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const onDragStart = (id: string) => setDraggingId(id);

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const onDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (!draggingId) return;
    const fromIdx = items.findIndex((i) => i.id === draggingId);
    if (fromIdx === -1 || fromIdx === dropIdx) {
      setDraggingId(null);
      setOverIdx(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(dropIdx, 0, moved);
    setItems(next);
    setDraggingId(null);
    setOverIdx(null);
    setSaving(true);
    await Promise.all(
      next.map((item, i) =>
        supabase.from(tableName).update({ sort_order: i }).eq("id", item.id)
      )
    );
    setSaving(false);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverIdx(null);
  };

  return { draggingId, overIdx, onDragStart, onDragOver, onDrop, onDragEnd, saving };
}

// ── Sectors Tab ───────────────────────────────────────────────────────────────
function SectorsTab({
  sectors,
  setSectors,
  onEdit,
  onDelete,
}: {
  sectors: InvestmentSector[];
  setSectors: (s: InvestmentSector[]) => void;
  onEdit: (s: InvestmentSector) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(sectors, setSectors, "investment_sectors");

  return (
    <div className={`inv-card-grid${drag.saving ? " inv-saving" : ""}`}>
      {sectors.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-card${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          {row.image_url ? (
            <div className="inv-card-img">
              <img src={row.image_url} alt={row.name} />
            </div>
          ) : (
            <div className="inv-card-img-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            </div>
          )}
          <div className="inv-card-body">
            <div className="inv-card-title">{row.name}</div>
            {row.highlight && (
              <div className="inv-card-highlight">{row.highlight}</div>
            )}
            <div className="inv-card-badges">
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشور" : "مخفي"}
              </Badge>
              <Badge color="blue">ترتيب: {row.sort_order}</Badge>
            </div>
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {sectors.length === 0 && (
        <p className="inv-empty-state">لا توجد قطاعات حتى الآن. أضف أول قطاع.</p>
      )}
    </div>
  );
}

// ── Opportunities Tab ─────────────────────────────────────────────────────────
function OpportunitiesTab({
  opportunities,
  sectors,
  onEdit,
  onDelete,
}: {
  opportunities: InvestmentOpportunity[];
  sectors: InvestmentSector[];
  onEdit: (o: InvestmentOpportunity) => void;
  onDelete: (id: string) => void;
}) {
  const sectorName = (id: string | null) =>
    sectors.find((s) => s.id === id)?.name || null;

  const statusLabel: Record<string, string> = {
    available: "متاحة",
    in_progress: "قيد التنفيذ",
    closed: "مغلقة",
  };
  const statusColor: Record<string, "green" | "amber" | "red"> = {
    available: "green",
    in_progress: "amber",
    closed: "red",
  };

  return (
    <div className="inv-opp-grid">
      {opportunities.map((row) => (
        <div key={row.id} className="inv-opp-card-adm">
          {row.image_url ? (
            <div className="inv-opp-card-img">
              <img src={row.image_url} alt={row.title} />
            </div>
          ) : (
            <div className="inv-opp-card-img inv-opp-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            </div>
          )}
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              <Badge color={statusColor[row.status] || "gray"}>
                {statusLabel[row.status] || row.status}
              </Badge>
              {sectorName(row.sector_id) && (
                <Badge color="teal">{sectorName(row.sector_id)}</Badge>
              )}
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشورة" : "مخفية"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            {row.description && (
              <div className="inv-opp-card-desc">
                {row.description.slice(0, 120)}{row.description.length > 120 ? "..." : ""}
              </div>
            )}
            <div className="inv-opp-card-specs">
              {row.min_investment && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  {row.min_investment}
                </span>
              )}
              {row.expected_return && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                  {row.expected_return}
                </span>
              )}
              {row.location && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  {row.location}
                </span>
              )}
            </div>
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {opportunities.length === 0 && (
        <p className="inv-empty-state">لا توجد فرص استثمارية حتى الآن.</p>
      )}
    </div>
  );
}

// ── Incentives Tab ────────────────────────────────────────────────────────────
function IncentivesTab({
  incentives,
  setIncentives,
  onEdit,
  onDelete,
}: {
  incentives: InvestmentIncentive[];
  setIncentives: (i: InvestmentIncentive[]) => void;
  onEdit: (i: InvestmentIncentive) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(incentives, setIncentives, "investment_incentives");

  const catColors: Record<string, "blue" | "green" | "amber" | "teal" | "red" | "gray"> = {
    tax: "green",
    land: "amber",
    infrastructure: "teal",
    admin: "blue",
    finance: "red",
    general: "gray",
  };
  const catLabels: Record<string, string> = {
    general: "عام", tax: "ضريبي", land: "أراضي",
    infrastructure: "بنية تحتية", admin: "إداري", finance: "تمويل",
  };

  return (
    <div className={`inv-compact-grid${drag.saving ? " inv-saving" : ""}`}>
      {incentives.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-compact-card${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          <div className="inv-compact-card-head">
            <div className="inv-compact-card-title">{row.title}</div>
            <div className="inv-compact-card-badges">
              <Badge color={catColors[row.category] || "gray"}>
                {catLabels[row.category] || row.category}
              </Badge>
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "✓" : "—"}
              </Badge>
            </div>
          </div>
          {row.description && (
            <div className="inv-compact-card-desc">
              {row.description.slice(0, 100)}{row.description.length > 100 ? "..." : ""}
            </div>
          )}
          <div className="inv-compact-card-foot">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {incentives.length === 0 && (
        <p className="inv-empty-state">لا توجد حوافز حتى الآن.</p>
      )}
    </div>
  );
}

// ── Stories Tab ───────────────────────────────────────────────────────────────
function StoriesTab({
  stories,
  onEdit,
  onDelete,
}: {
  stories: InvestmentSuccessStory[];
  onEdit: (s: InvestmentSuccessStory) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="inv-stories-grid">
      {stories.map((row) => (
        <div key={row.id} className="inv-story-card">
          <div className="inv-story-card-top">
            {row.image_url ? (
              <img src={row.image_url} alt={row.name} className="inv-story-avatar" />
            ) : (
              <div className="inv-story-avatar-placeholder">
                {row.name.charAt(0)}
              </div>
            )}
            <div className="inv-story-card-info">
              <div className="inv-story-name">{row.name}</div>
              {row.title && <div className="inv-story-title">{row.title}</div>}
              <div className="inv-story-meta">
                {row.sector && <Badge color="teal">{row.sector}</Badge>}
                {row.location && <Badge color="blue">{row.location}</Badge>}
                <Badge color={row.published ? "green" : "gray"}>
                  {row.published ? "منشورة" : "مخفية"}
                </Badge>
              </div>
            </div>
          </div>
          {row.quote && (
            <blockquote className="inv-story-quote">"{row.quote}"</blockquote>
          )}
          {row.story && !row.quote && (
            <p className="inv-story-preview">
              {row.story.slice(0, 120)}{row.story.length > 120 ? "..." : ""}
            </p>
          )}
          <div className="inv-card-actions">
            <small className="inv-story-date">{formatDate(row.created_at)}</small>
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {stories.length === 0 && (
        <p className="inv-empty-state">لا توجد قصص نجاح حتى الآن.</p>
      )}
    </div>
  );
}

// ── Partners Tab ──────────────────────────────────────────────────────────────
function PartnersTab({
  partners,
  setPartners,
  onEdit,
  onDelete,
}: {
  partners: InvestmentPartner[];
  setPartners: (p: InvestmentPartner[]) => void;
  onEdit: (p: InvestmentPartner) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(partners, setPartners, "investment_partners");
  const catLabels: Record<string, string> = {
    local: "محلي", government: "حكومي", financial: "مالي", international: "دولي",
  };

  return (
    <div className={`inv-partners-grid${drag.saving ? " inv-saving" : ""}`}>
      {partners.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-partner-card${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          <div className="inv-partner-logo">
            {row.logo_url ? (
              <img src={row.logo_url} alt={row.name} />
            ) : (
              <span>{row.name.charAt(0)}</span>
            )}
          </div>
          <div className="inv-partner-body">
            <div className="inv-partner-name">{row.name}</div>
            <div className="inv-partner-badges">
              <Badge color="blue">{catLabels[row.category] || row.category}</Badge>
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشور" : "مخفي"}
              </Badge>
            </div>
            {row.website && (
              <a
                href={row.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inv-partner-site"
                dir="ltr"
              >
                {row.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {partners.length === 0 && (
        <p className="inv-empty-state">لا يوجد شركاء حتى الآن.</p>
      )}
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({
  stats,
  setStats,
  onEdit,
  onDelete,
}: {
  stats: InvestmentStat[];
  setStats: (s: InvestmentStat[]) => void;
  onEdit: (s: InvestmentStat) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(stats, setStats, "investment_stats");

  return (
    <div className={`inv-stats-grid${drag.saving ? " inv-saving" : ""}`}>
      {stats.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-stat-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          <div className="inv-stat-card-value" dir="ltr">{row.value}</div>
          <div className="inv-stat-card-label">{row.label}</div>
          {row.icon && <div className="inv-stat-card-icon" dir="ltr">{row.icon}</div>}
          <div className="inv-card-actions inv-stat-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {stats.length === 0 && (
        <p className="inv-empty-state">لا توجد إحصاءات حتى الآن.</p>
      )}
    </div>
  );
}

// ── Inquiries Tab ─────────────────────────────────────────────────────────────
function InquiriesTab({
  inquiries,
  onUpdateStatus,
  onDelete,
}: {
  inquiries: InvestmentInquiry[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "closed">("all");
  const filtered = inquiries.filter((i) => filter === "all" || i.status === filter);

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  return (
    <>
      <div className="adm-inv-filter" style={{ marginBottom: "1rem" }}>
        {(["all", "new", "contacted", "closed"] as const).map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `الكل (${counts.all})` : f === "new" ? `جديد (${counts.new})` : f === "contacted" ? `تم التواصل (${counts.contacted})` : `مغلق (${counts.closed})`}
          </button>
        ))}
      </div>
      <div className="adm-inquiries-list">
        {filtered.map((row) => (
          <div key={row.id} className={`adm-inquiry-card status-${row.status}`}>
            <div className="adm-inquiry-top">
              <div className="adm-inquiry-ref">
                <span className="adm-inquiry-type">
                  {row.type === "sector" ? "قطاع" : "فرصة"}
                </span>
                <strong>{row.reference_title || row.reference_slug}</strong>
              </div>
              <div className="adm-inquiry-meta">
                <span className={`adm-inq-badge ${row.status}`}>
                  {row.status === "new" ? "جديد" : row.status === "contacted" ? "تم التواصل" : "مغلق"}
                </span>
                <small>{formatDate(row.created_at)}</small>
              </div>
            </div>
            <div className="adm-inquiry-body">
              <div className="adm-inquiry-contact">
                <b>{row.name}</b>
                {row.phone && <a href={`tel:${row.phone}`} dir="ltr">{row.phone}</a>}
                {row.email && <a href={`mailto:${row.email}`} dir="ltr">{row.email}</a>}
              </div>
              {row.message && <p className="adm-inquiry-msg">{row.message}</p>}
            </div>
            <div className="adm-inquiry-actions">
              {row.status !== "contacted" && (
                <button className="adm-btn-edit" onClick={() => onUpdateStatus(row.id, "contacted")}>
                  تم التواصل
                </button>
              )}
              {row.status !== "closed" && (
                <button className="adm-btn-secondary" onClick={() => onUpdateStatus(row.id, "closed")}>
                  إغلاق
                </button>
              )}
              {row.status !== "new" && (
                <button onClick={() => onUpdateStatus(row.id, "new")}>إعادة فتح</button>
              )}
              <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>
                حذف
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="adm-empty">لا توجد طلبات</p>}
      </div>
    </>
  );
}

// ── Main Investment Panel ─────────────────────────────────────────────────────
export default function InvestmentPanel() {
  const [tab, setTab] = useState<InvTab>("sectors");

  const [sectors, setSectors] = useState<InvestmentSector[]>([]);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [incentives, setIncentives] = useState<InvestmentIncentive[]>([]);
  const [stories, setStories] = useState<InvestmentSuccessStory[]>([]);
  const [partners, setPartners] = useState<InvestmentPartner[]>([]);
  const [stats, setStats] = useState<InvestmentStat[]>([]);
  const [inquiries, setInquiries] = useState<InvestmentInquiry[]>([]);

  // editor state — undefined = closed, null = new item, object = edit item
  const [editSector, setEditSector] = useState<Partial<InvestmentSector> | null | undefined>(undefined);
  const [editOpp, setEditOpp] = useState<Partial<InvestmentOpportunity> | null | undefined>(undefined);
  const [editIncentive, setEditIncentive] = useState<Partial<InvestmentIncentive> | null | undefined>(undefined);
  const [editStory, setEditStory] = useState<Partial<InvestmentSuccessStory> | null | undefined>(undefined);
  const [editPartner, setEditPartner] = useState<Partial<InvestmentPartner> | null | undefined>(undefined);
  const [editStat, setEditStat] = useState<Partial<InvestmentStat> | null | undefined>(undefined);

  const [confirmId, setConfirmId] = useState<{ table: string; id: string } | null>(null);

  const load = async (t: InvTab) => {
    if (t === "sectors") {
      const { data } = await supabase.from("investment_sectors").select("*").order("sort_order");
      setSectors(data ?? []);
    }
    if (t === "opportunities") {
      const { data } = await supabase.from("investment_opportunities").select("*").order("created_at", { ascending: false });
      setOpportunities(data ?? []);
    }
    if (t === "incentives") {
      const { data } = await supabase.from("investment_incentives").select("*").order("sort_order");
      setIncentives(data ?? []);
    }
    if (t === "stories") {
      const { data } = await supabase.from("investment_success_stories").select("*").order("created_at", { ascending: false });
      setStories(data ?? []);
    }
    if (t === "partners") {
      const { data } = await supabase.from("investment_partners").select("*").order("sort_order");
      setPartners(data ?? []);
    }
    if (t === "stats") {
      const { data } = await supabase.from("investment_stats").select("*").order("sort_order");
      setStats(data ?? []);
    }
    if (t === "inquiries") {
      const { data } = await supabase.from("investment_inquiries").select("*").order("created_at", { ascending: false });
      setInquiries(data ?? []);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  // preload sectors for opportunity editor dropdown
  useEffect(() => {
    supabase.from("investment_sectors").select("*").order("sort_order").then(({ data }) => setSectors(data ?? []));
  }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    await supabase.from(confirmId.table as "investment_sectors").delete().eq("id", confirmId.id);
    setConfirmId(null);
    load(tab);
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    await supabase.from("investment_inquiries").update({ status }).eq("id", id);
    load("inquiries");
  };

  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  const tabs: { key: InvTab; label: string; badge?: number }[] = [
    { key: "sectors", label: "القطاعات" },
    { key: "opportunities", label: "الفرص" },
    { key: "incentives", label: "الحوافز" },
    { key: "stories", label: "قصص النجاح" },
    { key: "partners", label: "الشركاء" },
    { key: "stats", label: "الإحصاءات" },
    { key: "inquiries", label: "الطلبات", badge: tab !== "inquiries" ? newInquiriesCount : undefined },
    { key: "seo", label: "SEO" },
  ];

  const tabConfig: Record<InvTab, { title: string; addLabel: string; count: number; onAdd: () => void }> = {
    sectors: { title: "القطاعات الاستثمارية", addLabel: "إضافة قطاع", count: sectors.length, onAdd: () => setEditSector(null) },
    opportunities: { title: "الفرص الاستثمارية", addLabel: "إضافة فرصة", count: opportunities.length, onAdd: () => setEditOpp(null) },
    incentives: { title: "الحوافز والتسهيلات", addLabel: "إضافة حافز", count: incentives.length, onAdd: () => setEditIncentive(null) },
    stories: { title: "قصص النجاح", addLabel: "إضافة قصة", count: stories.length, onAdd: () => setEditStory(null) },
    partners: { title: "الشركاء الاستراتيجيون", addLabel: "إضافة شريك", count: partners.length, onAdd: () => setEditPartner(null) },
    stats: { title: "إحصاءات الاستثمار", addLabel: "إضافة إحصاء", count: stats.length, onAdd: () => setEditStat(null) },
    inquiries: { title: "طلبات الاستثمار", addLabel: "", count: inquiries.length, onAdd: () => {} },
  };

  const cfg = tabConfig[tab];

  return (
    <div className="adm-section">
      {/* Sub-tabs */}
      <div className="adm-inv-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.badge ? <em>{t.badge}</em> : null}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="inv-tab-body">
        {tab !== "inquiries" ? (
          <SectionHead
            title={cfg.title}
            count={cfg.count}
            onAdd={cfg.onAdd}
            addLabel={cfg.addLabel}
          />
        ) : (
          <div className="inv-section-head">
            <div className="inv-section-head-title">
              <h2>{cfg.title}</h2>
              <span className="inv-section-count">{cfg.count}</span>
            </div>
          </div>
        )}

        {/* Tab content */}
        {tab === "sectors" && (
          <SectorsTab
            sectors={sectors}
            setSectors={setSectors}
            onEdit={(s) => setEditSector(s)}
            onDelete={(id) => setConfirmId({ table: "investment_sectors", id })}
          />
        )}
        {tab === "opportunities" && (
          <OpportunitiesTab
            opportunities={opportunities}
            sectors={sectors}
            onEdit={(o) => setEditOpp(o)}
            onDelete={(id) => setConfirmId({ table: "investment_opportunities", id })}
          />
        )}
        {tab === "incentives" && (
          <IncentivesTab
            incentives={incentives}
            setIncentives={setIncentives}
            onEdit={(i) => setEditIncentive(i)}
            onDelete={(id) => setConfirmId({ table: "investment_incentives", id })}
          />
        )}
        {tab === "stories" && (
          <StoriesTab
            stories={stories}
            onEdit={(s) => setEditStory(s)}
            onDelete={(id) => setConfirmId({ table: "investment_success_stories", id })}
          />
        )}
        {tab === "partners" && (
          <PartnersTab
            partners={partners}
            setPartners={setPartners}
            onEdit={(p) => setEditPartner(p)}
            onDelete={(id) => setConfirmId({ table: "investment_partners", id })}
          />
        )}
        {tab === "stats" && (
          <StatsTab
            stats={stats}
            setStats={setStats}
            onEdit={(s) => setEditStat(s)}
            onDelete={(id) => setConfirmId({ table: "investment_stats", id })}
          />
        )}
        {tab === "inquiries" && (
          <InquiriesTab
            inquiries={inquiries}
            onUpdateStatus={updateInquiryStatus}
            onDelete={(id) => setConfirmId({ table: "investment_inquiries", id })}
          />
        )}
        {tab === "seo" && <SeoTabContent slug="investment" />}
      </div>

      {/* Editors (drawers) — key forces remount when switching items */}
      {editSector !== undefined && (
        <SectorEditor
          key={editSector?.id || "new-sector"}
          item={editSector}
          open={true}
          onSave={() => { setEditSector(undefined); load("sectors"); }}
          onClose={() => setEditSector(undefined)}
        />
      )}
      {editOpp !== undefined && (
        <OpportunityEditor
          key={editOpp?.id || "new-opp"}
          item={editOpp}
          sectors={sectors}
          open={true}
          onSave={() => { setEditOpp(undefined); load("opportunities"); }}
          onClose={() => setEditOpp(undefined)}
        />
      )}
      {editIncentive !== undefined && (
        <IncentiveEditor
          key={editIncentive?.id || "new-incentive"}
          item={editIncentive}
          open={true}
          onSave={() => { setEditIncentive(undefined); load("incentives"); }}
          onClose={() => setEditIncentive(undefined)}
        />
      )}
      {editStory !== undefined && (
        <StoryEditor
          key={editStory?.id || "new-story"}
          item={editStory}
          open={true}
          onSave={() => { setEditStory(undefined); load("stories"); }}
          onClose={() => setEditStory(undefined)}
        />
      )}
      {editPartner !== undefined && (
        <PartnerEditor
          key={editPartner?.id || "new-partner"}
          item={editPartner}
          open={true}
          onSave={() => { setEditPartner(undefined); load("partners"); }}
          onClose={() => setEditPartner(undefined)}
        />
      )}
      {editStat !== undefined && (
        <StatEditor
          key={editStat?.id || "new-stat"}
          item={editStat}
          open={true}
          onSave={() => { setEditStat(undefined); load("stats"); }}
          onClose={() => setEditStat(undefined)}
        />
      )}

      {confirmId && (
        <Confirm
          message="هل أنت متأكد من الحذف؟ لا يمكن التراجع."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
