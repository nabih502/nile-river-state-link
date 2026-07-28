import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import type { SocialService, SocialInitiative, SocialStat, SocialValue } from "./supabase";
import {
  ServiceEditor,
  SocialInitiativeEditor,
  StatEditor,
  ValueEditor,
} from "./social-editor";
import {
  HeartHandshake, HandHeart, MessageCircle, UsersRound, Headphones,
  GraduationCap, BookOpen, UserPlus, Handshake, Eye, Network,
  ShieldCheck, UserCheck, Plus, Pencil, Trash2,
  TrendingUp, Users, Heart, Star,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type SocialTab = "services" | "initiatives" | "stats" | "values";

// ── Icon map ──────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  HeartHandshake, HandHeart, MessageCircle, UsersRound, Headphones,
  GraduationCap, BookOpen, UserPlus, Handshake, Eye, Network,
  ShieldCheck, UserCheck,
};
function DynIcon({ name, size = 18 }: { name: string; size?: number }) {
  const I = iconMap[name] || Heart;
  return <I size={size} />;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: "green" | "gray" | "teal" | "amber" | "blue" | "red" }) {
  const map = {
    green: "#dcfce7 #15803d", gray: "#f1f5f9 #64748b", teal: "#ccfbf1 #0f766e",
    amber: "#fef3c7 #b45309", blue: "#dbeafe #1d4ed8", red: "#fee2e2 #dc2626",
  };
  const [bg, fg] = map[color].split(" ");
  return (
    <span style={{ background: bg, color: fg, padding: "0.2rem 0.7rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ── Drag sort ─────────────────────────────────────────────────────────────────
function useDragSort<T extends { id: string; sort_order: number }>(
  items: T[], setItems: React.Dispatch<React.SetStateAction<T[]>>, tableName: string
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
    items.forEach((item, i) => supabase.from(tableName).update({ sort_order: i }).eq("id", item.id));
    dragIdx.current = null;
  };
  return { onDragStart, onDragOver, onDrop };
}

// ── Confirm dialog ─────────────────────────────────────────────────────────────
function Confirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-confirm" onClick={(e) => e.stopPropagation()}>
        <p>هل تريد حذف هذا العنصر نهائياً؟</p>
        <div className="adm-confirm-actions">
          <button className="inv-btn-ghost" onClick={onCancel}>إلغاء</button>
          <button className="inv-btn-danger" onClick={onConfirm}>حذف نهائياً</button>
        </div>
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHead({ title, count, addLabel, onAdd }: { title: string; count: number; addLabel: string; onAdd: () => void }) {
  return (
    <div className="inv-section-head" style={{ marginBottom: "1.5rem" }}>
      <div className="inv-section-head-title">
        <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>{title}</h2>
        <span className="inv-section-count">{count}</span>
      </div>
      <button className="adm-btn-primary" onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

// ── Stats overview bar ─────────────────────────────────────────────────────────
function OverviewBar({ services, initiatives, stats, values }: {
  services: number; initiatives: number; stats: number; values: number;
}) {
  const cards = [
    { icon: Headphones, label: "خدمة اجتماعية", value: services, color: "#0f766e", bg: "#f0fdfa" },
    { icon: TrendingUp, label: "مبادرة نشطة", value: initiatives, color: "#d97706", bg: "#fffbeb" },
    { icon: Users, label: "إحصائية", value: stats, color: "#1d4ed8", bg: "#eff6ff" },
    { icon: Star, label: "قيمة مؤسسية", value: values, color: "#7c3aed", bg: "#f5f3ff" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.75rem" }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: c.bg, borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.85rem", border: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ background: c.color + "22", color: c.color, width: 40, height: 40, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <c.icon size={20} />
          </span>
          <div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Services Tab ──────────────────────────────────────────────────────────────
function ServicesTab({ items, setItems, onEdit, onDelete }: {
  items: SocialService[];
  setItems: React.Dispatch<React.SetStateAction<SocialService[]>>;
  onEdit: (r: SocialService) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(items, setItems, "social_services");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
      {items.map((row, idx) => (
        <div key={row.id} draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}
          style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", overflow: "hidden", cursor: "grab", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
        >
          <div style={{ background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", padding: "1.25rem 1.25rem 1rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ background: "#0f766e", color: "#fff", width: 42, height: 42, borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <DynIcon name={row.icon} size={20} />
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{row.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.1rem" }}>{row.action_label}</div>
              </div>
            </div>
            <Badge label={row.published ? "منشور" : "مسودة"} color={row.published ? "green" : "gray"} />
          </div>
          <div style={{ padding: "0.875rem 1.25rem" }}>
            <p style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "0.75rem", lineHeight: 1.5 }}>{row.lead}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.875rem" }}>
              {[row.bullet_1, row.bullet_2, row.bullet_3, row.bullet_4].filter(Boolean).map(b => (
                <span key={b} style={{ background: "#f1f5f9", color: "#475569", padding: "0.2rem 0.6rem", borderRadius: "0.375rem", fontSize: "0.72rem" }}>{b}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
              {row.slug && <a href={`/social/service/${row.slug}`} target="_blank" rel="noopener noreferrer" style={{ background: "#f0fdfa", color: "#0f766e", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, textDecoration: "none", border: "1px solid #ccfbf1" }}>↗ معاينة</a>}
              <button type="button" className="inv-icon-btn" onClick={() => onEdit(row)} title="تعديل"><Pencil size={14} /></button>
              <button type="button" className="inv-icon-btn inv-icon-btn--danger" onClick={() => onDelete(row.id)} title="حذف"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="inv-empty" style={{ gridColumn: "1/-1" }}>لا توجد خدمات بعد.</p>}
    </div>
  );
}

// ── Initiatives Tab ───────────────────────────────────────────────────────────
function InitiativesTab({ items, setItems, onEdit, onDelete }: {
  items: SocialInitiative[];
  setItems: React.Dispatch<React.SetStateAction<SocialInitiative[]>>;
  onEdit: (r: SocialInitiative) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(items, setItems, "social_initiatives");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
      {items.map((row, idx) => (
        <div key={row.id} draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}
          style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", overflow: "hidden", cursor: "grab", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
        >
          {row.image_url ? (
            <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
              <img src={row.image_url} alt={row.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.5),transparent)" }} />
              <span style={{ position: "absolute", bottom: "0.75rem", right: "0.875rem", background: "#0f766e", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700 }}>
                {row.icon} {row.amount}
              </span>
            </div>
          ) : (
            <div style={{ height: 90, background: "linear-gradient(135deg,#0f766e,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={40} color="rgba(255,255,255,0.4)" />
            </div>
          )}
          <div style={{ padding: "1rem 1.125rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{row.title}</h3>
              <Badge label={row.published ? "منشور" : "مسودة"} color={row.published ? "green" : "gray"} />
            </div>
            <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.75rem", lineHeight: 1.5 }}>{row.text}</p>
            <div style={{ marginBottom: "0.625rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", marginBottom: "0.25rem" }}>
                <span>نسبة الإنجاز</span>
                <span style={{ fontWeight: 700, color: "#0f766e" }}>{row.progress}%</span>
              </div>
              <div style={{ height: 6, background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${row.progress}%`, background: "linear-gradient(90deg,#0f766e,#14b8a6)", borderRadius: "9999px" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {row.slug && <a href={`/social/initiative/${row.slug}`} target="_blank" rel="noopener noreferrer" style={{ background: "#f0fdfa", color: "#0f766e", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, textDecoration: "none", border: "1px solid #ccfbf1" }}>↗ معاينة</a>}
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button type="button" className="inv-icon-btn" onClick={() => onEdit(row)} title="تعديل"><Pencil size={14} /></button>
                <button type="button" className="inv-icon-btn inv-icon-btn--danger" onClick={() => onDelete(row.id)} title="حذف"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="inv-empty" style={{ gridColumn: "1/-1" }}>لا توجد مبادرات بعد.</p>}
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({ items, setItems, onEdit, onDelete }: {
  items: SocialStat[];
  setItems: React.Dispatch<React.SetStateAction<SocialStat[]>>;
  onEdit: (r: SocialStat) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(items, setItems, "social_stats");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.875rem" }}>
      {items.map((row, idx) => (
        <div key={row.id} draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}
          style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.25rem", textAlign: "center", cursor: "grab", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "relative", transition: "box-shadow 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)")}
        >
          <div style={{ color: "#0f766e", marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
            <DynIcon name={row.icon} size={28} />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{row.value}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{row.label}</div>
          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "0.875rem" }}>
            <button type="button" className="inv-icon-btn" onClick={() => onEdit(row)} title="تعديل"><Pencil size={13} /></button>
            <button type="button" className="inv-icon-btn inv-icon-btn--danger" onClick={() => onDelete(row.id)} title="حذف"><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="inv-empty" style={{ gridColumn: "1/-1" }}>لا توجد إحصائيات بعد.</p>}
    </div>
  );
}

// ── Values Tab ────────────────────────────────────────────────────────────────
function ValuesTab({ items, setItems, onEdit, onDelete }: {
  items: SocialValue[];
  setItems: React.Dispatch<React.SetStateAction<SocialValue[]>>;
  onEdit: (r: SocialValue) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(items, setItems, "social_values");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "0.875rem" }}>
      {items.map((row, idx) => (
        <div key={row.id} draggable
          onDragStart={() => drag.onDragStart(idx)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={drag.onDrop}
          style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1.25rem", cursor: "grab", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ background: "#f0fdfa", color: "#0f766e", width: 38, height: 38, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <DynIcon name={row.icon} size={18} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>{row.title}</div>
              <Badge label={row.published ? "منشور" : "مسودة"} color={row.published ? "green" : "gray"} />
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.55, marginBottom: "0.875rem" }}>{row.text}</p>
          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
            <button type="button" className="inv-icon-btn" onClick={() => onEdit(row)} title="تعديل"><Pencil size={13} /></button>
            <button type="button" className="inv-icon-btn inv-icon-btn--danger" onClick={() => onDelete(row.id)} title="حذف"><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="inv-empty" style={{ gridColumn: "1/-1" }}>لا توجد قيم بعد.</p>}
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export function SocialPanel() {
  const [tab, setTab] = useState<SocialTab>("services");

  const [services,    setServices]    = useState<SocialService[]>([]);
  const [initiatives, setInitiatives] = useState<SocialInitiative[]>([]);
  const [stats,       setStats]       = useState<SocialStat[]>([]);
  const [values,      setValues]      = useState<SocialValue[]>([]);

  const [editService,    setEditService]    = useState<Partial<SocialService> | null | undefined>(undefined);
  const [editInitiative, setEditInitiative] = useState<Partial<SocialInitiative> | null | undefined>(undefined);
  const [editStat,       setEditStat]       = useState<Partial<SocialStat> | null | undefined>(undefined);
  const [editValue,      setEditValue]      = useState<Partial<SocialValue> | null | undefined>(undefined);

  const [confirmId, setConfirmId] = useState<{ table: string; id: string } | null>(null);

  const load = async (t: SocialTab) => {
    if (t === "services")    { const { data } = await supabase.from("social_services").select("*").order("sort_order");    setServices(data ?? []); }
    if (t === "initiatives") { const { data } = await supabase.from("social_initiatives").select("*").order("sort_order"); setInitiatives(data ?? []); }
    if (t === "stats")       { const { data } = await supabase.from("social_stats").select("*").order("sort_order");       setStats(data ?? []); }
    if (t === "values")      { const { data } = await supabase.from("social_values").select("*").order("sort_order");      setValues(data ?? []); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleDelete = async () => {
    if (!confirmId) return;
    await supabase.from(confirmId.table as "social_services").delete().eq("id", confirmId.id);
    setConfirmId(null);
    load(tab);
  };

  const tabs: { key: SocialTab; label: string; icon: React.ElementType }[] = [
    { key: "services",    label: "الخدمات",     icon: Headphones },
    { key: "initiatives", label: "المبادرات",   icon: TrendingUp },
    { key: "stats",       label: "الإحصائيات", icon: Users },
    { key: "values",      label: "القيم",       icon: Star },
  ];

  const meta: Record<SocialTab, { title: string; addLabel: string; onAdd: () => void }> = {
    services:    { title: "الخدمات الاجتماعية",    addLabel: "إضافة خدمة",      onAdd: () => setEditService(null) },
    initiatives: { title: "المبادرات والمشاريع",    addLabel: "إضافة مبادرة",    onAdd: () => setEditInitiative(null) },
    stats:       { title: "الإحصائيات والأرقام",   addLabel: "إضافة إحصائية",  onAdd: () => setEditStat(null) },
    values:      { title: "القيم المؤسسية",         addLabel: "إضافة قيمة",     onAdd: () => setEditValue(null) },
  };

  const counts = { services: services.length, initiatives: initiatives.length, stats: stats.length, values: values.length };

  return (
    <div className="inv-panel">
      {/* ── Panel header ── */}
      <div className="inv-panel-head" style={{ marginBottom: "0" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HeartHandshake size={22} color="#0f766e" /> الخدمات الاجتماعية
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "0.2rem" }}>إدارة محتوى وصفحات قسم الخدمات الاجتماعية</p>
        </div>
      </div>

      {/* ── Overview cards ── */}
      <OverviewBar services={counts.services} initiatives={counts.initiatives} stats={counts.stats} values={counts.values} />

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "0.25rem", background: "#f1f5f9", borderRadius: "0.75rem", padding: "0.3rem", marginBottom: "1.5rem" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                padding: "0.55rem 0.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: "0.82rem", fontWeight: tab === t.key ? 700 : 500,
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? "#0f766e" : "#64748b",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />{t.label}
              <span style={{ background: tab === t.key ? "#f0fdfa" : "#e2e8f0", color: tab === t.key ? "#0f766e" : "#94a3b8", padding: "0 0.45rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, lineHeight: "1.6" }}>
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Section head + content ── */}
      <SectionHead {...meta[tab]} count={counts[tab]} />

      {tab === "services"    && <ServicesTab    items={services}    setItems={setServices}    onEdit={setEditService}    onDelete={(id) => setConfirmId({ table: "social_services",    id })} />}
      {tab === "initiatives" && <InitiativesTab items={initiatives} setItems={setInitiatives} onEdit={setEditInitiative} onDelete={(id) => setConfirmId({ table: "social_initiatives", id })} />}
      {tab === "stats"       && <StatsTab       items={stats}       setItems={setStats}       onEdit={setEditStat}       onDelete={(id) => setConfirmId({ table: "social_stats",        id })} />}
      {tab === "values"      && <ValuesTab      items={values}      setItems={setValues}      onEdit={setEditValue}      onDelete={(id) => setConfirmId({ table: "social_values",       id })} />}

      {/* ── Editors ── */}
      {editService !== undefined && (
        <ServiceEditor key={editService?.id || "new-svc"} item={editService} open={true}
          onSave={() => { setEditService(undefined); load("services"); }}
          onClose={() => setEditService(undefined)} />
      )}
      {editInitiative !== undefined && (
        <SocialInitiativeEditor key={editInitiative?.id || "new-init"} item={editInitiative} open={true}
          onSave={() => { setEditInitiative(undefined); load("initiatives"); }}
          onClose={() => setEditInitiative(undefined)} />
      )}
      {editStat !== undefined && (
        <StatEditor key={editStat?.id || "new-stat"} item={editStat} open={true}
          onSave={() => { setEditStat(undefined); load("stats"); }}
          onClose={() => setEditStat(undefined)} />
      )}
      {editValue !== undefined && (
        <ValueEditor key={editValue?.id || "new-val"} item={editValue} open={true}
          onSave={() => { setEditValue(undefined); load("values"); }}
          onClose={() => setEditValue(undefined)} />
      )}

      {confirmId && <Confirm onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
}
