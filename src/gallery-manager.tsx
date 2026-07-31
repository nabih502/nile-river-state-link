import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import {
  Upload, Plus, Trash2, GripVertical, Play,
  Image as ImageIcon, X, Check, Link as LinkIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  content_type: string;
  content_id: string | null;
  media_type: "image" | "video";
  image_url: string;
  video_url: string | null;
  thumbnail_url: string | null;
  caption: string;
  sort_order: number;
  published: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseVideoId(url: string): { platform: "youtube" | "vimeo" | "other"; id: string } | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return { platform: "youtube", id: ytMatch[1] };
  const viMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
  if (viMatch) return { platform: "vimeo", id: viMatch[1] };
  return { platform: "other", id: url };
}

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function autoThumb(url: string): string {
  const parsed = parseVideoId(url);
  if (!parsed) return "";
  if (parsed.platform === "youtube") return ytThumb(parsed.id);
  return "";
}

// ─── Add Video Modal ──────────────────────────────────────────────────────────
function AddVideoModal({
  onAdd,
  onClose,
}: {
  onAdd: (item: { video_url: string; thumbnail_url: string; caption: string }) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");

  const handleUrl = (v: string) => {
    setUrl(v);
    const t = autoThumb(v);
    setThumb(t);
    setPreview(t);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "1rem", padding: "1.75rem",
          width: "min(480px,95vw)", display: "flex", flexDirection: "column", gap: "1rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>إضافة فيديو</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "0.25rem" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>رابط الفيديو *</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={url}
              onChange={(e) => handleUrl(e.target.value)}
              placeholder="يوتيوب، فيميو، أي رابط فيديو..."
              dir="ltr"
              style={{
                flex: 1, padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
                border: "1px solid #e2e8f0", fontSize: "0.83rem", fontFamily: "inherit",
              }}
            />
            <LinkIcon size={16} style={{ alignSelf: "center", color: "#94a3b8", flexShrink: 0 }} />
          </div>
          {url && !autoThumb(url) && (
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#d97706" }}>رابط مباشر — يُعرض مباشرةً في المتصفح</p>
          )}
        </div>

        {preview && (
          <div style={{ position: "relative", borderRadius: "0.6rem", overflow: "hidden", aspectRatio: "16/9", background: "#0f172a" }}>
            <img src={preview} alt="معاينة" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Play size={22} color="#0f172a" fill="#0f172a" style={{ marginRight: -2 }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>صورة مصغّرة مخصصة (اختياري)</label>
          <input
            value={thumb}
            onChange={(e) => { setThumb(e.target.value); setPreview(e.target.value); }}
            placeholder="رابط صورة بديلة إن أردت..."
            dir="ltr"
            style={{ padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.83rem", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>وصف / عنوان (اختياري)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="عنوان الفيديو أو وصف مختصر"
            style={{ padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.83rem", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.25rem" }}>
          <button onClick={onClose} style={{ padding: "0.6rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>إلغاء</button>
          <button
            disabled={!url.trim()}
            onClick={() => { if (url.trim()) { onAdd({ video_url: url.trim(), thumbnail_url: thumb || autoThumb(url.trim()), caption }); onClose(); } }}
            style={{ padding: "0.6rem 1.4rem", borderRadius: "0.5rem", border: "none", background: url.trim() ? "#2563eb" : "#e2e8f0", color: url.trim() ? "#fff" : "#94a3b8", cursor: url.trim() ? "pointer" : "not-allowed", fontSize: "0.85rem", fontWeight: 700, fontFamily: "inherit", transition: "all 0.15s" }}
          >
            إضافة الفيديو
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({
  item,
  index,
  total,
  dragHandlers,
  onDelete,
  onTogglePublished,
  onCaptionChange,
  onSortChange,
}: {
  item: GalleryItem;
  index: number;
  total: number;
  dragHandlers: ReturnType<typeof useDragSort>;
  onDelete: () => void;
  onTogglePublished: () => void;
  onCaptionChange: (v: string) => void;
  onSortChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption);
  const thumbSrc = item.media_type === "video"
    ? (item.thumbnail_url || autoThumb(item.video_url || "") || "")
    : item.image_url;

  return (
    <div
      draggable
      onDragStart={() => dragHandlers.onDragStart(index)}
      onDragOver={(e) => dragHandlers.onDragOver(e, index)}
      onDrop={dragHandlers.onDrop}
      style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem",
        padding: "0.6rem 0.75rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.15s",
        cursor: "grab",
      }}
    >
      {/* Drag handle */}
      <GripVertical size={16} color="#cbd5e1" style={{ flexShrink: 0, cursor: "grab" }} />

      {/* Thumbnail */}
      <div style={{ width: 72, height: 54, borderRadius: "0.45rem", overflow: "hidden", flexShrink: 0, background: "#f1f5f9", position: "relative" }}>
        {thumbSrc ? (
          <img src={thumbSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {item.media_type === "video" ? <Play size={20} color="#94a3b8" /> : <ImageIcon size={20} color="#94a3b8" />}
          </div>
        )}
        {item.media_type === "video" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
            <Play size={14} color="#fff" fill="#fff" />
          </div>
        )}
      </div>

      {/* Caption / type */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input
              autoFocus
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { onCaptionChange(caption); setEditing(false); } if (e.key === "Escape") { setCaption(item.caption); setEditing(false); } }}
              style={{ flex: 1, padding: "0.3rem 0.5rem", borderRadius: "0.35rem", border: "1px solid #93c5fd", fontSize: "0.8rem", fontFamily: "inherit" }}
            />
            <button onClick={() => { onCaptionChange(caption); setEditing(false); }} style={{ background: "#2563eb", border: "none", borderRadius: "0.35rem", color: "#fff", cursor: "pointer", padding: "0 0.5rem" }}><Check size={13} /></button>
          </div>
        ) : (
          <p
            onClick={() => setEditing(true)}
            style={{ margin: 0, fontSize: "0.8rem", color: caption ? "#0f172a" : "#94a3b8", cursor: "text", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {caption || "انقر لإضافة وصف..."}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
          <span style={{
            fontSize: "0.66rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "9999px",
            background: item.media_type === "video" ? "#fef3c7" : "#f0f9ff",
            color: item.media_type === "video" ? "#b45309" : "#0369a1",
          }}>
            {item.media_type === "video" ? "فيديو" : "صورة"}
          </span>
          <span style={{ fontSize: "0.66rem", color: "#94a3b8" }}>{index + 1} / {total}</span>
        </div>
      </div>

      {/* Sort order input */}
      <input
        type="number"
        min={0}
        value={item.sort_order}
        onChange={(e) => onSortChange(Number(e.target.value))}
        style={{ width: 44, padding: "0.3rem", borderRadius: "0.35rem", border: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.8rem", fontFamily: "inherit" }}
        title="ترتيب"
      />

      {/* Publish toggle */}
      <button
        onClick={onTogglePublished}
        title={item.published ? "مرئي — انقر للإخفاء" : "مخفي — انقر للنشر"}
        style={{
          background: item.published ? "#dcfce7" : "#f1f5f9",
          color: item.published ? "#16a34a" : "#94a3b8",
          border: "none", borderRadius: "0.35rem",
          width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        {item.published ? <Check size={13} /> : <X size={13} />}
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "0.35rem", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Drag sort hook ───────────────────────────────────────────────────────────
function useDragSort(
  items: GalleryItem[],
  setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>,
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
      supabase.from("content_gallery").update({ sort_order: i }).eq("id", item.id)
    );
    dragIdx.current = null;
  };
  return { onDragStart, onDragOver, onDrop };
}

// ─── Main GalleryManager ──────────────────────────────────────────────────────
export function GalleryManager({
  contentType,
  contentId,
  accentColor = "#2563eb",
}: {
  contentType: string;
  contentId: string | null;
  accentColor?: string;
}) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useDragSort(items, setItems);

  const load = async () => {
    setLoading(true);
    const q = supabase
      .from("content_gallery")
      .select("*")
      .eq("content_type", contentType)
      .order("sort_order");
    const result = contentId
      ? await q.eq("content_id", contentId)
      : await q.is("content_id", null);
    setItems((result.data ?? []) as GalleryItem[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [contentType, contentId]);

  // Upload image file
  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `gallery/${contentType}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("images").upload(path, file);
    if (upErr) { setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
    const url = urlData.publicUrl;
    await supabase.from("content_gallery").insert({
      content_type: contentType,
      content_id: contentId,
      media_type: "image",
      image_url: url,
      video_url: null,
      thumbnail_url: null,
      caption: "",
      sort_order: items.length,
      published: true,
    });
    setUploading(false);
    load();
  };

  // Add video
  const addVideo = async (v: { video_url: string; thumbnail_url: string; caption: string }) => {
    await supabase.from("content_gallery").insert({
      content_type: contentType,
      content_id: contentId,
      media_type: "video",
      image_url: v.thumbnail_url || "",
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url || null,
      caption: v.caption,
      sort_order: items.length,
      published: true,
    });
    load();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("content_gallery").delete().eq("id", id);
    setConfirmDeleteId(null);
    load();
  };

  const togglePublished = async (item: GalleryItem) => {
    await supabase.from("content_gallery").update({ published: !item.published }).eq("id", item.id);
    setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, published: !x.published } : x));
  };

  const updateCaption = async (item: GalleryItem, caption: string) => {
    await supabase.from("content_gallery").update({ caption }).eq("id", item.id);
    setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, caption } : x));
  };

  const updateSortOrder = async (item: GalleryItem, sort_order: number) => {
    await supabase.from("content_gallery").update({ sort_order }).eq("id", item.id);
    setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, sort_order } : x));
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 3, height: 22, background: accentColor, borderRadius: 2 }} />
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>معرض الوسائط</span>
          <span style={{ background: `${accentColor}18`, color: accentColor, fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: "9999px", border: `1px solid ${accentColor}33` }}>
            {items.length} عنصر
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", background: accentColor, color: "#fff", cursor: uploading ? "not-allowed" : "pointer", fontSize: "0.82rem", fontWeight: 700, fontFamily: "inherit", opacity: uploading ? 0.7 : 1, transition: "opacity 0.15s" }}
          >
            <Upload size={14} />{uploading ? "جاري الرفع..." : "رفع صورة"}
          </button>
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: `1px solid ${accentColor}`, background: "transparent", color: accentColor, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, fontFamily: "inherit" }}
          >
            <Plus size={14} />إضافة فيديو
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }}
            multiple
          />
        </div>
      </div>

      {/* Tips */}
      <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
        اسحب البطاقات لإعادة الترتيب، أو عدّل الرقم يمين كل بطاقة. الأيقونة الخضراء تعني مرئي للزوار.
      </p>

      {/* Items */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>جاري التحميل...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", border: "2px dashed #e2e8f0", borderRadius: "0.75rem", color: "#94a3b8" }}>
          <ImageIcon size={32} strokeWidth={1.2} style={{ marginBottom: "0.5rem" }} />
          <p style={{ margin: 0, fontSize: "0.85rem" }}>لا توجد وسائط بعد — ارفع صورة أو أضف رابط فيديو</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              total={items.length}
              dragHandlers={drag}
              onDelete={() => setConfirmDeleteId(item.id)}
              onTogglePublished={() => togglePublished(item)}
              onCaptionChange={(v) => updateCaption(item, v)}
              onSortChange={(v) => updateSortOrder(item, v)}
            />
          ))}
        </div>
      )}

      {/* Video modal */}
      {showVideoModal && (
        <AddVideoModal onAdd={addVideo} onClose={() => setShowVideoModal(false)} />
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setConfirmDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", width: "min(340px,90vw)", textAlign: "center" }}>
            <Trash2 size={28} color="#dc2626" style={{ marginBottom: "0.75rem" }} />
            <p style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>حذف هذا العنصر؟</p>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 1.25rem" }}>لا يمكن التراجع عن هذا الإجراء.</p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ padding: "0.55rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>إلغاء</button>
              <button onClick={() => deleteItem(confirmDeleteId)} style={{ padding: "0.55rem 1.25rem", borderRadius: "0.5rem", border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 700 }}>حذف نهائياً</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
