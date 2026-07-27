import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { SocialService, SocialInitiative, SocialStat, SocialValue } from "./supabase";
import { ServiceEditor, SocialInitiativeEditor, StatEditor, ValueEditor } from "./social-editor";
import {
  HeartHandshake, HandHeart, MessageCircle, UsersRound, Headphones,
  GraduationCap, BookOpen, UserPlus, Handshake, Eye, Network,
  ShieldCheck, UserCheck, Plus, Pencil, Trash2, GripVertical,
} from "lucide-react";

// ── Icon map ──────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  HeartHandshake, HandHeart, MessageCircle, UsersRound, Headphones,
  GraduationCap, BookOpen, UserPlus, Handshake, Eye, Network,
  ShieldCheck, UserCheck,
};
function DynIcon({ name, fallback: F }: { name: string; fallback: React.ElementType }) {
  const I = iconMap[name] || F;
  return <I size={18} />;
}

// ── Tab type ──────────────────────────────────────────────────────────────────
type SocialTab = "services" | "initiatives" | "stats" | "values";

// ── Shared row action buttons ─────────────────────────────────────────────────
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inv-row-actions">
      <button type="button" className="inv-icon-btn" title="تعديل" onClick={onEdit}><Pencil size={15} /></button>
      <button type="button" className="inv-icon-btn inv-icon-btn--danger" title="حذف" onClick={onDelete}><Trash2 size={15} /></button>
    </div>
  );
}

// ── Drag-sort hook (same as culture panel) ────────────────────────────────────
function useDragSort<T extends { id: string; sort_order: number }>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  tableName: string
) {
  const dragIdx = useRef<number | null>(null);
  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    setItems(next);
  };
  const onDrop = () => {
    items.forEach((item, i) =>
      supabase.from(tableName).update({ sort_order: i }).eq("id", item.id)
    );
    dragIdx.current = null;
  };
  return { onDragStart, onDragOver, onDrop };
}

// ── Confirm overlay ───────────────────────────────────────────────────────────
function Confirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-confirm" onClick={(e) => e.stopPropagation()}>
        <p>هل تريد حذف هذا العنصر نهائياً؟</p>
        <div className="adm-confirm-actions">
          <button className="inv-btn-ghost" onClick={onCancel}>إلغاء</button>
          <button className="inv-btn-danger" onClick={onConfirm}>حذف</button>
        </div>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHead({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <div className="inv-section-head">
      <div className="inv-section-head-title">
        <h3>{title}</h3>
        <span className="inv-section-count">{count}</span>
      </div>
      <button type="button" className="inv-btn-primary inv-btn-sm" onClick={onAdd}>
        <Plus size={14} /> إضافة
      </button>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ published }: { published: boolean }) {
  return (
    <span className={`inv-badge ${published ? "inv-badge--green" : "inv-badge--gray"}`}>
      {published ? "منشور" : "مسودة"}
    </span>
  );
}

// ── Services Tab ──────────────────────────────────────────────────────────────
function ServicesTab({ services, setServices, onEdit, onDelete }: {
  services: SocialService[];
  setServices: React.Dispatch<React.SetStateAction<SocialService[]>>;
  onEdit: (item: SocialService) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(services, setServices, "social_services");
  return (
    <div className="inv-card-list">
      {services.map((row, idx) => (
        <div key={row.id} className="inv-card-row" draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}>
          <span className="inv-drag-handle"><GripVertical size={16} /></span>
          <div className="inv-card-row-icon" style={{ background: "#0f766e22" }}>
            <DynIcon name={row.icon} fallback={HeartHandshake} />
          </div>
          <div className="inv-card-row-body">
            <b>{row.title}</b>
            <small>{row.lead}</small>
          </div>
          <div className="inv-card-row-meta">
            <Badge published={row.published} />
            <small className="inv-badge inv-badge--blue">{row.action_label}</small>
          </div>
          <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} />
        </div>
      ))}
      {services.length === 0 && <p className="inv-empty">لا توجد خدمات بعد.</p>}
    </div>
  );
}

// ── Initiatives Tab ───────────────────────────────────────────────────────────
function InitiativesTab({ initiatives, setInitiatives, onEdit, onDelete }: {
  initiatives: SocialInitiative[];
  setInitiatives: React.Dispatch<React.SetStateAction<SocialInitiative[]>>;
  onEdit: (item: SocialInitiative) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(initiatives, setInitiatives, "social_initiatives");
  return (
    <div className="inv-card-list">
      {initiatives.map((row, idx) => (
        <div key={row.id} className="inv-card-row" draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}>
          <span className="inv-drag-handle"><GripVertical size={16} /></span>
          {row.image_url && <img src={row.image_url} alt="" className="inv-card-row-thumb" />}
          <div className="inv-card-row-body">
            <b>{row.title}</b>
            <small>{row.text}</small>
          </div>
          <div className="inv-card-row-meta">
            <Badge published={row.published} />
            <small className="inv-badge inv-badge--teal">{row.progress}%</small>
            <small className="inv-badge inv-badge--amber">{row.amount}</small>
          </div>
          <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} />
        </div>
      ))}
      {initiatives.length === 0 && <p className="inv-empty">لا توجد مبادرات بعد.</p>}
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({ stats, setStats, onEdit, onDelete }: {
  stats: SocialStat[];
  setStats: React.Dispatch<React.SetStateAction<SocialStat[]>>;
  onEdit: (item: SocialStat) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(stats, setStats, "social_stats");
  return (
    <div className="inv-card-list">
      {stats.map((row, idx) => (
        <div key={row.id} className="inv-card-row" draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}>
          <span className="inv-drag-handle"><GripVertical size={16} /></span>
          <div className="inv-card-row-icon" style={{ background: "#0f766e22" }}>
            <DynIcon name={row.icon} fallback={UsersRound} />
          </div>
          <div className="inv-card-row-body">
            <b style={{ fontSize: "1.1rem", color: "#0f766e" }}>{row.value}</b>
            <small>{row.label}</small>
          </div>
          <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} />
        </div>
      ))}
      {stats.length === 0 && <p className="inv-empty">لا توجد إحصائيات بعد.</p>}
    </div>
  );
}

// ── Values Tab ────────────────────────────────────────────────────────────────
function ValuesTab({ values, setValues, onEdit, onDelete }: {
  values: SocialValue[];
  setValues: React.Dispatch<React.SetStateAction<SocialValue[]>>;
  onEdit: (item: SocialValue) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(values, setValues, "social_values");
  return (
    <div className="inv-card-list">
      {values.map((row, idx) => (
        <div key={row.id} className="inv-card-row" draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}>
          <span className="inv-drag-handle"><GripVertical size={16} /></span>
          <div className="inv-card-row-icon" style={{ background: "#0f766e22" }}>
            <DynIcon name={row.icon} fallback={HandHeart} />
          </div>
          <div className="inv-card-row-body">
            <b>{row.title}</b>
            <small>{row.text}</small>
          </div>
          <div className="inv-card-row-meta">
            <Badge published={row.published} />
          </div>
          <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} />
        </div>
      ))}
      {values.length === 0 && <p className="inv-empty">لا توجد قيم بعد.</p>}
    </div>
  );
}

// ── Main SocialPanel ──────────────────────────────────────────────────────────
export function SocialPanel() {
  const [tab, setTab] = useState<SocialTab>("services");
  const [services, setServices]     = useState<SocialService[]>([]);
  const [initiatives, setInitiatives] = useState<SocialInitiative[]>([]);
  const [stats, setStats]           = useState<SocialStat[]>([]);
  const [values, setValues]         = useState<SocialValue[]>([]);

  const [editService, setEditService]         = useState<Partial<SocialService> | null | undefined>(undefined);
  const [editInitiative, setEditInitiative]   = useState<Partial<SocialInitiative> | null | undefined>(undefined);
  const [editStat, setEditStat]               = useState<Partial<SocialStat> | null | undefined>(undefined);
  const [editValue, setEditValue]             = useState<Partial<SocialValue> | null | undefined>(undefined);

  const [confirmId, setConfirmId] = useState<{ table: string; id: string } | null>(null);

  const load = async (t: SocialTab) => {
    if (t === "services")    { const { data } = await supabase.from("social_services").select("*").order("sort_order"); setServices(data ?? []); }
    if (t === "initiatives") { const { data } = await supabase.from("social_initiatives").select("*").order("sort_order"); setInitiatives(data ?? []); }
    if (t === "stats")       { const { data } = await supabase.from("social_stats").select("*").order("sort_order"); setStats(data ?? []); }
    if (t === "values")      { const { data } = await supabase.from("social_values").select("*").order("sort_order"); setValues(data ?? []); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleDelete = async () => {
    if (!confirmId) return;
    await supabase.from(confirmId.table as "social_services").delete().eq("id", confirmId.id);
    setConfirmId(null);
    load(tab);
  };

  const tabs: { key: SocialTab; label: string }[] = [
    { key: "services",    label: "الخدمات" },
    { key: "initiatives", label: "المبادرات" },
    { key: "stats",       label: "الإحصائيات" },
    { key: "values",      label: "القيم" },
  ];

  const meta: Record<SocialTab, { title: string; count: number; onAdd: () => void }> = {
    services:    { title: "الخدمات الاجتماعية",    count: services.length,    onAdd: () => setEditService(null) },
    initiatives: { title: "المبادرات والمشاريع",    count: initiatives.length, onAdd: () => setEditInitiative(null) },
    stats:       { title: "الإحصائيات والأرقام",   count: stats.length,       onAdd: () => setEditStat(null) },
    values:      { title: "القيم المؤسسية",         count: values.length,      onAdd: () => setEditValue(null) },
  };

  return (
    <div className="inv-panel">
      <div className="inv-panel-head">
        <h2>الخدمات الاجتماعية</h2>
        <p>إدارة محتوى صفحة الخدمات الاجتماعية</p>
      </div>

      <div className="inv-tabs">
        {tabs.map(t => (
          <button key={t.key} type="button" className={`inv-tab${tab === t.key ? " inv-tab--active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <SectionHead {...meta[tab]} />

      {tab === "services"    && <ServicesTab    services={services}       setServices={setServices}       onEdit={setEditService}    onDelete={(id) => setConfirmId({ table: "social_services", id })} />}
      {tab === "initiatives" && <InitiativesTab initiatives={initiatives} setInitiatives={setInitiatives} onEdit={setEditInitiative} onDelete={(id) => setConfirmId({ table: "social_initiatives", id })} />}
      {tab === "stats"       && <StatsTab       stats={stats}             setStats={setStats}             onEdit={setEditStat}       onDelete={(id) => setConfirmId({ table: "social_stats", id })} />}
      {tab === "values"      && <ValuesTab      values={values}           setValues={setValues}           onEdit={setEditValue}      onDelete={(id) => setConfirmId({ table: "social_values", id })} />}

      {editService !== undefined && (
        <ServiceEditor key={editService?.id || "new-service"} item={editService} open={true}
          onSave={() => { setEditService(undefined); load("services"); }}
          onClose={() => setEditService(undefined)} />
      )}
      {editInitiative !== undefined && (
        <SocialInitiativeEditor key={editInitiative?.id || "new-initiative"} item={editInitiative} open={true}
          onSave={() => { setEditInitiative(undefined); load("initiatives"); }}
          onClose={() => setEditInitiative(undefined)} />
      )}
      {editStat !== undefined && (
        <StatEditor key={editStat?.id || "new-stat"} item={editStat} open={true}
          onSave={() => { setEditStat(undefined); load("stats"); }}
          onClose={() => setEditStat(undefined)} />
      )}
      {editValue !== undefined && (
        <ValueEditor key={editValue?.id || "new-value"} item={editValue} open={true}
          onSave={() => { setEditValue(undefined); load("values"); }}
          onClose={() => setEditValue(undefined)} />
      )}

      {confirmId && <Confirm onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
}
