import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Pencil, Trash2 } from "lucide-react";
import type {
  CultureEvent,
  CultureNews,
  CultureArtist,
  CultureAssociation,
  CultureInitiative,
  CultureContest,
  CultureMedia,
} from "./supabase";
import {
  EventEditor,
  CultureNewsEditor,
  ArtistEditor,
  AssociationEditor,
  InitiativeEditor,
  ContestEditor,
  CultureMediaEditor,
  ArtCategoryEditor,
  type ArtCategory,
} from "./culture-editor";

import { SeoTabContent } from "./admin-seo";
import { GalleryManager } from "./gallery-manager";
type CultureTab =
  | "events"
  | "news"
  | "artists"
  | "associations"
  | "initiatives"
  | "contests"
  | "media"
  | "art_categories"
  | "gallery"
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

// ── Events Tab ────────────────────────────────────────────────────────────────
function EventsTab({
  events,
  setEvents,
  onEdit,
  onDelete,
}: {
  events: CultureEvent[];
  setEvents: (e: CultureEvent[]) => void;
  onEdit: (e: CultureEvent) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(events, setEvents, "culture_events");

  return (
    <div className={`inv-opp-grid${drag.saving ? " inv-saving" : ""}`}>
      {events.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-opp-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          {row.image_url ? (
            <div className="inv-opp-card-img">
              <img src={row.image_url} alt={row.title} />
            </div>
          ) : (
            <div className="inv-opp-card-img inv-opp-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              {row.tag && <Badge color="teal">{row.tag}</Badge>}
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشورة" : "مخفية"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            <div className="inv-opp-card-specs">
              {row.event_date && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(row.event_date)}
                </span>
              )}
              {row.location && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
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
      {events.length === 0 && (
        <p className="inv-empty-state">لا توجد فعاليات حتى الآن. أضف أول فعالية.</p>
      )}
    </div>
  );
}

// ── Culture News Tab ──────────────────────────────────────────────────────────
function CultureNewsTab({
  news,
  onEdit,
  onDelete,
}: {
  news: CultureNews[];
  onEdit: (n: CultureNews) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="inv-opp-grid">
      {news.map((row) => (
        <div key={row.id} className="inv-opp-card-adm">
          {row.image_url ? (
            <div className="inv-opp-card-img">
              <img src={row.image_url} alt={row.title} />
            </div>
          ) : (
            <div className="inv-opp-card-img inv-opp-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشور" : "مخفي"}
              </Badge>
              {row.published_at && (
                <Badge color="blue">{formatDate(row.published_at)}</Badge>
              )}
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            {row.excerpt && (
              <div className="inv-opp-card-desc">
                {row.excerpt.slice(0, 120)}{row.excerpt.length > 120 ? "..." : ""}
              </div>
            )}
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {news.length === 0 && (
        <p className="inv-empty-state">لا توجد أخبار ثقافية حتى الآن. أضف أول خبر.</p>
      )}
    </div>
  );
}

// ── Artists Tab ───────────────────────────────────────────────────────────────
function ArtistsTab({
  artists,
  setArtists,
  onEdit,
  onDelete,
}: {
  artists: CultureArtist[];
  setArtists: (a: CultureArtist[]) => void;
  onEdit: (a: CultureArtist) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(artists, setArtists, "culture_artists");

  return (
    <div className={`inv-opp-grid${drag.saving ? " inv-saving" : ""}`}>
      {artists.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-opp-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          {row.image_url ? (
            <div className="inv-opp-card-img">
              <img src={row.image_url} alt={row.name} />
            </div>
          ) : (
            <div className="inv-opp-card-img inv-opp-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          )}
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              {row.role && <Badge color="teal">{row.role}</Badge>}
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشور" : "مخفي"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.name}</div>
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {artists.length === 0 && (
        <p className="inv-empty-state">لا يوجد فنانون أو كتّاب حتى الآن. أضف أول فنان.</p>
      )}
    </div>
  );
}

// ── Associations Tab ──────────────────────────────────────────────────────────
function AssociationsTab({
  associations,
  setAssociations,
  onEdit,
  onDelete,
}: {
  associations: CultureAssociation[];
  setAssociations: (a: CultureAssociation[]) => void;
  onEdit: (a: CultureAssociation) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(associations, setAssociations, "culture_associations");

  return (
    <div className={`inv-opp-grid${drag.saving ? " inv-saving" : ""}`}>
      {associations.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-opp-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              {row.icon && <Badge color="blue">{row.icon}</Badge>}
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشورة" : "مخفية"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            {row.place && (
              <div className="inv-opp-card-specs">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {row.place}
                </span>
              </div>
            )}
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {associations.length === 0 && (
        <p className="inv-empty-state">لا توجد جمعيات حتى الآن. أضف أول جمعية.</p>
      )}
    </div>
  );
}

// ── Initiatives Tab ───────────────────────────────────────────────────────────
function InitiativesTab({
  initiatives,
  setInitiatives,
  onEdit,
  onDelete,
}: {
  initiatives: CultureInitiative[];
  setInitiatives: (i: CultureInitiative[]) => void;
  onEdit: (i: CultureInitiative) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(initiatives, setInitiatives, "culture_initiatives");

  return (
    <div className={`inv-opp-grid${drag.saving ? " inv-saving" : ""}`}>
      {initiatives.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-opp-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          {row.image_url ? (
            <div className="inv-opp-card-img">
              <img src={row.image_url} alt={row.title} />
            </div>
          ) : (
            <div className="inv-opp-card-img inv-opp-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشورة" : "مخفية"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            {row.text && (
              <div className="inv-opp-card-desc">
                {row.text.slice(0, 120)}{row.text.length > 120 ? "..." : ""}
              </div>
            )}
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {initiatives.length === 0 && (
        <p className="inv-empty-state">لا توجد مبادرات حتى الآن. أضف أول مبادرة.</p>
      )}
    </div>
  );
}

// ── Contests Tab ──────────────────────────────────────────────────────────────
function ContestsTab({
  contests,
  setContests,
  onEdit,
  onDelete,
}: {
  contests: CultureContest[];
  setContests: (c: CultureContest[]) => void;
  onEdit: (c: CultureContest) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(contests, setContests, "culture_contests");

  return (
    <div className={`inv-opp-grid${drag.saving ? " inv-saving" : ""}`}>
      {contests.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-opp-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشورة" : "مخفية"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            <div className="inv-opp-card-specs">
              {row.deadline && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(row.deadline)}
                </span>
              )}
              {row.prize && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                  {row.prize}
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
      {contests.length === 0 && (
        <p className="inv-empty-state">لا توجد مسابقات حتى الآن. أضف أول مسابقة.</p>
      )}
    </div>
  );
}

// ── Media Tab ─────────────────────────────────────────────────────────────────
function MediaTab({
  media,
  setMedia,
  onEdit,
  onDelete,
}: {
  media: CultureMedia[];
  setMedia: (m: CultureMedia[]) => void;
  onEdit: (m: CultureMedia) => void;
  onDelete: (id: string) => void;
}) {
  const drag = useDragSort(media, setMedia, "culture_media");

  const typeColor: Record<string, "blue" | "amber" | "teal"> = {
    فيديو: "blue",
    بودكاست: "amber",
    مقال: "teal",
  };

  return (
    <div className={`inv-opp-grid${drag.saving ? " inv-saving" : ""}`}>
      {media.map((row, idx) => (
        <div
          key={row.id}
          className={`inv-opp-card-adm${drag.draggingId === row.id ? " dragging" : ""}${drag.overIdx === idx && drag.draggingId !== row.id ? " drag-over" : ""}`}
          draggable
          onDragStart={() => drag.onDragStart(row.id)}
          onDragOver={(e) => drag.onDragOver(e, idx)}
          onDrop={(e) => drag.onDrop(e, idx)}
          onDragEnd={drag.onDragEnd}
        >
          <DragHandle />
          {row.image_url ? (
            <div className="inv-opp-card-img">
              <img src={row.image_url} alt={row.title} />
            </div>
          ) : (
            <div className="inv-opp-card-img inv-opp-img-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            </div>
          )}
          <div className="inv-opp-card-body">
            <div className="inv-opp-card-badges">
              {row.type && (
                <Badge color={typeColor[row.type] || "gray"}>{row.type}</Badge>
              )}
              <Badge color={row.published ? "green" : "gray"}>
                {row.published ? "منشور" : "مخفي"}
              </Badge>
            </div>
            <div className="inv-opp-card-title">{row.title}</div>
            {row.media_date && (
              <div className="inv-opp-card-specs">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(row.media_date)}
                </span>
              </div>
            )}
          </div>
          <div className="inv-card-actions">
            <button className="adm-btn-edit" onClick={() => onEdit(row)}>تعديل</button>
            <button className="adm-btn-danger" onClick={() => onDelete(row.id)}>حذف</button>
          </div>
        </div>
      ))}
      {media.length === 0 && (
        <p className="inv-empty-state">لا توجد وسائط حتى الآن. أضف أول وسيط.</p>
      )}
    </div>
  );
}

// ── Main Culture Panel ────────────────────────────────────────────────────────
export default function CulturePanel() {
  const [tab, setTab] = useState<CultureTab>("events");

  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [news, setNews] = useState<CultureNews[]>([]);
  const [artists, setArtists] = useState<CultureArtist[]>([]);
  const [associations, setAssociations] = useState<CultureAssociation[]>([]);
  const [initiatives, setInitiatives] = useState<CultureInitiative[]>([]);
  const [contests, setContests] = useState<CultureContest[]>([]);
  const [media, setMedia] = useState<CultureMedia[]>([]);
  const [artCategories, setArtCategories] = useState<ArtCategory[]>([]);

  // editor state — undefined = closed, null = new item, object = edit item
  const [editEvent, setEditEvent] = useState<Partial<CultureEvent> | null | undefined>(undefined);
  const [editNews, setEditNews] = useState<Partial<CultureNews> | null | undefined>(undefined);
  const [editArtist, setEditArtist] = useState<Partial<CultureArtist> | null | undefined>(undefined);
  const [editAssociation, setEditAssociation] = useState<Partial<CultureAssociation> | null | undefined>(undefined);
  const [editInitiative, setEditInitiative] = useState<Partial<CultureInitiative> | null | undefined>(undefined);
  const [editContest, setEditContest] = useState<Partial<CultureContest> | null | undefined>(undefined);
  const [editMedia, setEditMedia] = useState<Partial<CultureMedia> | null | undefined>(undefined);
  const [editArtCategory, setEditArtCategory] = useState<Partial<ArtCategory> | null | undefined>(undefined);

  const [confirmId, setConfirmId] = useState<{ table: string; id: string } | null>(null);

  const load = async (t: CultureTab) => {
    if (t === "events") {
      const { data } = await supabase.from("culture_events").select("*").order("sort_order");
      setEvents(data ?? []);
    }
    if (t === "news") {
      const { data } = await supabase.from("culture_news").select("*").order("created_at", { ascending: false });
      setNews(data ?? []);
    }
    if (t === "artists") {
      const { data } = await supabase.from("culture_artists").select("*").order("sort_order");
      setArtists(data ?? []);
    }
    if (t === "associations") {
      const { data } = await supabase.from("culture_associations").select("*").order("sort_order");
      setAssociations(data ?? []);
    }
    if (t === "initiatives") {
      const { data } = await supabase.from("culture_initiatives").select("*").order("sort_order");
      setInitiatives(data ?? []);
    }
    if (t === "contests") {
      const { data } = await supabase.from("culture_contests").select("*").order("sort_order");
      setContests(data ?? []);
    }
    if (t === "media") {
      const { data } = await supabase.from("culture_media").select("*").order("sort_order");
      setMedia(data ?? []);
    }
    if (t === "art_categories") {
      const { data } = await supabase.from("culture_art_categories").select("*").order("sort_order");
      setArtCategories((data ?? []) as ArtCategory[]);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const handleDelete = async () => {
    if (!confirmId) return;
    await supabase.from(confirmId.table as "culture_events").delete().eq("id", confirmId.id);
    setConfirmId(null);
    load(tab);
  };

  const tabs: { key: CultureTab; label: string }[] = [
    { key: "events", label: "الفعاليات" },
    { key: "news", label: "الأخبار" },
    { key: "artists", label: "الفنانون والكتّاب" },
    { key: "associations", label: "الجمعيات" },
    { key: "initiatives", label: "المبادرات" },
    { key: "contests", label: "المسابقات" },
    { key: "media", label: "الوسائط" },
    { key: "art_categories", label: "مجالات الفنون" },
    { key: "gallery", label: "معرض الصفحة" },
    { key: "seo", label: "SEO" },
  ];

  const tabConfig: Record<CultureTab, { title: string; addLabel: string; count: number; onAdd: () => void }> = {
    events: { title: "الفعاليات الثقافية", addLabel: "إضافة فعالية جديدة", count: events.length, onAdd: () => setEditEvent(null) },
    news: { title: "الأخبار الثقافية", addLabel: "إضافة خبر جديد", count: news.length, onAdd: () => setEditNews(null) },
    artists: { title: "الفنانون والكتّاب", addLabel: "إضافة فنان جديد", count: artists.length, onAdd: () => setEditArtist(null) },
    associations: { title: "الجمعيات الثقافية", addLabel: "إضافة جمعية جديدة", count: associations.length, onAdd: () => setEditAssociation(null) },
    initiatives: { title: "المبادرات الثقافية", addLabel: "إضافة مبادرة جديدة", count: initiatives.length, onAdd: () => setEditInitiative(null) },
    contests: { title: "المسابقات الثقافية", addLabel: "إضافة مسابقة جديدة", count: contests.length, onAdd: () => setEditContest(null) },
    media: { title: "الوسائط الثقافية", addLabel: "إضافة وسيط جديد", count: media.length, onAdd: () => setEditMedia(null) },
    art_categories: { title: "مجالات الفنون", addLabel: "إضافة مجال فني جديد", count: artCategories.length, onAdd: () => setEditArtCategory(null) },
    gallery: { title: "معرض وسائط الصفحة الثقافية", addLabel: "", count: 0, onAdd: () => {} },
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
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="inv-tab-body">
        <SectionHead
          title={cfg.title}
          count={cfg.count}
          onAdd={cfg.onAdd}
          addLabel={cfg.addLabel}
        />

        {/* Tab content */}
        {tab === "events" && (
          <EventsTab
            events={events}
            setEvents={setEvents}
            onEdit={(e) => setEditEvent(e)}
            onDelete={(id) => setConfirmId({ table: "culture_events", id })}
          />
        )}
        {tab === "news" && (
          <CultureNewsTab
            news={news}
            onEdit={(n) => setEditNews(n)}
            onDelete={(id) => setConfirmId({ table: "culture_news", id })}
          />
        )}
        {tab === "artists" && (
          <ArtistsTab
            artists={artists}
            setArtists={setArtists}
            onEdit={(a) => setEditArtist(a)}
            onDelete={(id) => setConfirmId({ table: "culture_artists", id })}
          />
        )}
        {tab === "associations" && (
          <AssociationsTab
            associations={associations}
            setAssociations={setAssociations}
            onEdit={(a) => setEditAssociation(a)}
            onDelete={(id) => setConfirmId({ table: "culture_associations", id })}
          />
        )}
        {tab === "initiatives" && (
          <InitiativesTab
            initiatives={initiatives}
            setInitiatives={setInitiatives}
            onEdit={(i) => setEditInitiative(i)}
            onDelete={(id) => setConfirmId({ table: "culture_initiatives", id })}
          />
        )}
        {tab === "contests" && (
          <ContestsTab
            contests={contests}
            setContests={setContests}
            onEdit={(c) => setEditContest(c)}
            onDelete={(id) => setConfirmId({ table: "culture_contests", id })}
          />
        )}
        {tab === "media" && (
          <MediaTab
            media={media}
            setMedia={setMedia}
            onEdit={(m) => setEditMedia(m)}
            onDelete={(id) => setConfirmId({ table: "culture_media", id })}
          />
        )}
        {tab === "art_categories" && (
          <ArtCategoriesTab
            rows={artCategories}
            onEdit={(r) => setEditArtCategory(r)}
            onDelete={(id) => setConfirmId({ table: "culture_art_categories", id })}
          />
        )}
        {tab === "gallery" && (
          <div style={{ paddingTop: "1rem" }}>
            <GalleryManager contentType="page_culture" contentId={null} accentColor="#7c3aed" />
          </div>
        )}
        {tab === "seo" && <SeoTabContent slug="culture" />}
      </div>

      {/* Editors (drawers) — key forces remount when switching items */}
      {editEvent !== undefined && (
        <EventEditor
          key={editEvent?.id || "new-event"}
          item={editEvent}
          open={true}
          onSave={() => { setEditEvent(undefined); load("events"); }}
          onClose={() => setEditEvent(undefined)}
        />
      )}
      {editNews !== undefined && (
        <CultureNewsEditor
          key={editNews?.id || "new-news"}
          item={editNews}
          open={true}
          onSave={() => { setEditNews(undefined); load("news"); }}
          onClose={() => setEditNews(undefined)}
        />
      )}
      {editArtist !== undefined && (
        <ArtistEditor
          key={editArtist?.id || "new-artist"}
          item={editArtist}
          open={true}
          onSave={() => { setEditArtist(undefined); load("artists"); }}
          onClose={() => setEditArtist(undefined)}
        />
      )}
      {editAssociation !== undefined && (
        <AssociationEditor
          key={editAssociation?.id || "new-association"}
          item={editAssociation}
          open={true}
          onSave={() => { setEditAssociation(undefined); load("associations"); }}
          onClose={() => setEditAssociation(undefined)}
        />
      )}
      {editInitiative !== undefined && (
        <InitiativeEditor
          key={editInitiative?.id || "new-initiative"}
          item={editInitiative}
          open={true}
          onSave={() => { setEditInitiative(undefined); load("initiatives"); }}
          onClose={() => setEditInitiative(undefined)}
        />
      )}
      {editContest !== undefined && (
        <ContestEditor
          key={editContest?.id || "new-contest"}
          item={editContest}
          open={true}
          onSave={() => { setEditContest(undefined); load("contests"); }}
          onClose={() => setEditContest(undefined)}
        />
      )}
      {editMedia !== undefined && (
        <CultureMediaEditor
          key={editMedia?.id || "new-media"}
          item={editMedia}
          open={true}
          onSave={() => { setEditMedia(undefined); load("media"); }}
          onClose={() => setEditMedia(undefined)}
        />
      )}

      {editArtCategory !== undefined && (
        <ArtCategoryEditor
          key={editArtCategory?.id || "new-artcat"}
          item={editArtCategory}
          open={true}
          onSave={() => { setEditArtCategory(undefined); load("art_categories"); }}
          onClose={() => setEditArtCategory(undefined)}
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

// ── ArtCategoriesTab ────────────────────────────────────────────────────────
function ArtCategoriesTab({ rows, onEdit, onDelete }: {
  rows: ArtCategory[];
  onEdit: (r: ArtCategory) => void;
  onDelete: (id: string) => void;
}) {
  if (!rows.length) return (
    <div className="inv-empty">
      <span style={{ fontSize: "2rem" }}>🎭</span>
      <p>لا توجد مجالات فنية بعد</p>
    </div>
  );
  return (
    <div className="inv-card-grid">
      {rows.map((row) => (
        <article key={row.id} className="inv-card">
          {row.image_url && <img src={row.image_url} alt={row.title} className="inv-card-img" />}
          {!row.image_url && <div style={{ height: 100, background: "linear-gradient(135deg,#134e4a,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>{row.icon || "🎨"}</div>}
          <div className="inv-card-body">
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              {row.icon && <span style={{ fontSize: "1.2rem" }}>{row.icon}</span>}
              {!row.published && <span className="inv-badge inv-badge--warn">مسودة</span>}
              {row.slug && <a href={`/culture/${row.slug}`} target="_blank" rel="noopener noreferrer" style={{ background: "#ecfeff", color: "#0e7490", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, textDecoration: "none", border: "1px solid #a5f3fc" }}>↗ معاينة</a>}
            </div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>{row.title}</h4>
            {row.description && <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4, marginBottom: "0.625rem", WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{row.description.slice(0, 80)}...</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
              <button type="button" className="inv-icon-btn" onClick={() => onEdit(row)} title="تعديل"><Pencil size={14} /></button>
              <button type="button" className="inv-icon-btn inv-icon-btn--danger" onClick={() => onDelete(row.id)} title="حذف"><Trash2 size={14} /></button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
