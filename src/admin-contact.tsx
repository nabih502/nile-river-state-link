import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Settings2, Phone, Mail, MapPin, Clock3, MessageCircle, Send, Trash2, Plus, Save, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp, CircleCheck as CheckCircle, X } from "lucide-react";

type Settings = Record<string, string>;
type InfoItem = { id: string; title: string; lines: string[]; icon_name: string; link_url: string; color: string; sort_order: number; published: boolean };
type FaqItem  = { id: string; title: string; description: string; icon_name: string; link_url: string; sort_order: number; published: boolean };
type Message  = { id: string; name: string; email: string; phone: string; subject: string; message: string; read: boolean; created_at: string };

const ICON_OPTIONS = [
  "Phone","Mail","MapPin","Clock3","MessageCircle","Send","Headphones",
  "Info","CreditCard","FileText","CircleHelp","Handshake","UsersRound",
  "Globe2","ShieldCheck","Calendar","Building2","UserRound",
];
const COLOR_PRESETS = [
  "#2563eb","#16a34a","#dc2626","#d97706","#7c3aed",
  "#25d366","#0088cc","#0f172a","#1877f2","#ea580c",
];

function toast(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position:"fixed",bottom:"1.5rem",right:"1.5rem",zIndex:"9999",
    background:"#1e3a5f",color:"#fff",padding:"0.75rem 1.5rem",
    borderRadius:"0.75rem",fontWeight:700,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",
    fontSize:"0.88rem",animation:"fadeUp 0.3s ease",
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// ─── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ settings, onSave }: { settings: Settings; onSave: (s: Settings) => void }) {
  const [form, setForm] = useState<Settings>(settings);
  useEffect(() => setForm(settings), [settings]);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const save = async () => {
    const entries = Object.entries(form);
    for (const [key, value] of entries) {
      await supabase.from("contact_settings").upsert({ key, value }, { onConflict: "key" });
    }
    onSave(form);
    toast("تم حفظ الإعدادات ✓");
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <label key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>{label}</span>
      <input type={type} value={form[key] ?? ""} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        dir={type === "url" || key.includes("url") || key.includes("number") ? "ltr" : "rtl"}
        style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.6rem 0.85rem", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }}
        onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Hero */}
      <Section title="قسم الهيرو" icon={<Settings2 size={16} />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {field("عنوان الهيرو", "hero_title", "text", "تواصل معنا")}
          {field("رابط صورة الخلفية", "hero_image_url", "url", "/assets/contact-hero-hq.webp")}
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", gridColumn: "1/-1" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>وصف مختصر تحت العنوان</span>
            <textarea value={form["hero_subtitle"] ?? ""} rows={2} onChange={e => set("hero_subtitle", e.target.value)}
              style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.6rem 0.85rem", fontSize: "0.88rem", outline: "none", fontFamily: "inherit", resize: "vertical" }}
              onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
          </label>
        </div>
      </Section>

      {/* Form */}
      <Section title="عنوان نموذج التواصل" icon={<Send size={16} />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {field("عنوان النموذج", "form_title", "text", "أرسل لنا رسالة")}
          {field("وصف النموذج", "form_subtitle", "text", "نسعد بتواصلكم")}
        </div>
      </Section>

      {/* Quick contact */}
      <Section title="معلومات تواصل سريعة" icon={<Phone size={16} />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {field("رقم واتساب (بدون +)", "whatsapp_number", "text", "249912345678")}
          {field("رقم الهاتف", "phone_number", "text", "+249 123 456 789")}
          {field("البريد الإلكتروني", "email", "email", "info@nilelink.org")}
          {field("رابط تضمين الخريطة", "map_embed_url", "url", "https://maps.google.com/embed...")}
        </div>
      </Section>

      {/* Newsletter */}
      <Section title="قسم الاشتراك البريدي" icon={<Mail size={16} />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {field("عنوان القسم", "newsletter_title", "text", "كن على تواصل دائم")}
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>وصف القسم</span>
            <textarea value={form["newsletter_subtitle"] ?? ""} rows={2} onChange={e => set("newsletter_subtitle", e.target.value)}
              style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.6rem 0.85rem", fontSize: "0.88rem", outline: "none", fontFamily: "inherit", resize: "vertical" }}
              onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
          </label>
        </div>
      </Section>

      <button onClick={save} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.6rem", padding: "0.8rem 2rem", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", alignSelf: "flex-start", fontFamily: "inherit" }}>
        <Save size={16} /> حفظ الإعدادات
      </button>
    </div>
  );
}

// ─── Info Items Panel ──────────────────────────────────────────────────────────
function InfoPanel() {
  const [items, setItems] = useState<InfoItem[]>([]);
  const [editing, setEditing] = useState<Partial<InfoItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => supabase.from("contact_info_items").select("*").order("sort_order").then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  const blank: Partial<InfoItem> = { title: "", lines: ["", ""], icon_name: "Phone", link_url: "", color: "#2563eb", sort_order: (items.length + 1) * 10, published: true };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = { ...editing, lines: (editing.lines ?? []).filter(Boolean) };
    if (editing.id) {
      await supabase.from("contact_info_items").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("contact_info_items").insert(payload);
    }
    setSaving(false);
    setEditing(null);
    load();
    toast("تم الحفظ ✓");
  };

  const del = async (id: string) => {
    if (!confirm("حذف هذا العنصر؟")) return;
    await supabase.from("contact_info_items").delete().eq("id", id);
    load();
  };

  const togglePublish = async (item: InfoItem) => {
    await supabase.from("contact_info_items").update({ published: !item.published }).eq("id", item.id);
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>بطاقات وسائل التواصل التي تظهر في أعلى الصفحة وفي الشريط الجانبي</p>
        <button onClick={() => setEditing({ ...blank })} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "inherit", fontSize: "0.85rem" }}>
          <Plus size={15} /> إضافة وسيلة
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {items.map(item => (
          <div key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRight: `3px solid ${item.color}`, borderRadius: "0.75rem", padding: "0.85rem 1.1rem", display: "flex", alignItems: "center", gap: "0.85rem", opacity: item.published ? 1 : 0.6 }}>
            <GripVertical size={16} color="#cbd5e1" />
            <div style={{ width: 36, height: 36, borderRadius: "0.5rem", background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Phone size={16} color={item.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.lines.join(" · ")}</p>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button onClick={() => togglePublish(item)} title={item.published ? "إخفاء" : "إظهار"} style={{ background: item.published ? "#f0fdf4" : "#f1f5f9", color: item.published ? "#16a34a" : "#94a3b8", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.5rem", cursor: "pointer" }}>
                {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => setEditing({ ...item })} style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.7rem", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>تعديل</button>
              <button onClick={() => del(item.id)} style={{ background: "#fff0f0", color: "#dc2626", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.5rem", cursor: "pointer" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal title={editing.id ? "تعديل وسيلة التواصل" : "إضافة وسيلة تواصل"} onClose={() => setEditing(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="العنوان" value={editing.title ?? ""} onChange={v => setEditing(e => ({ ...e, title: v }))} />
              <Field label="رابط الضغط" value={editing.link_url ?? ""} onChange={v => setEditing(e => ({ ...e, link_url: v }))} dir="ltr" placeholder="tel:+249..." />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>الأسطر (سطر في كل مربع)</span>
              {[0, 1, 2].map(i => (
                <input key={i} value={(editing.lines ?? [])[i] ?? ""} onChange={e => {
                  const arr = [...(editing.lines ?? ["", "", ""])];
                  arr[i] = e.target.value;
                  setEditing(ed => ({ ...ed, lines: arr }));
                }} placeholder={i === 0 ? "السطر الأول (رقم / بريد...)" : `السطر ${i + 1} (اختياري)`}
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.55rem 0.85rem", fontSize: "0.85rem", outline: "none", fontFamily: "inherit" }}
                  onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>الأيقونة</span>
                <select value={editing.icon_name ?? "Phone"} onChange={e => setEditing(ed => ({ ...ed, icon_name: e.target.value }))}
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.55rem 0.85rem", fontSize: "0.85rem", outline: "none", fontFamily: "inherit", background: "#fff" }}>
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>اللون</span>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {COLOR_PRESETS.map(c => (
                    <button key={c} onClick={() => setEditing(ed => ({ ...ed, color: c }))} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: editing.color === c ? "3px solid #0f172a" : "2px solid transparent", cursor: "pointer", padding: 0 }} />
                  ))}
                  <input type="color" value={editing.color ?? "#2563eb"} onChange={e => setEditing(ed => ({ ...ed, color: e.target.value }))} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
              <input type="checkbox" checked={!!editing.published} onChange={e => setEditing(ed => ({ ...ed, published: e.target.checked }))} />
              ظاهر على الصفحة
            </label>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)} style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1.25rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>إلغاء</button>
              <button onClick={save} disabled={saving} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Save size={15} />{saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FAQ Panel ─────────────────────────────────────────────────────────────────
function FaqPanel() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [editing, setEditing] = useState<Partial<FaqItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => supabase.from("contact_faq_items").select("*").order("sort_order").then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  const blank: Partial<FaqItem> = { title: "", description: "", icon_name: "Info", link_url: "#contact-form", sort_order: (items.length + 1) * 10, published: true };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from("contact_faq_items").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("contact_faq_items").insert(editing);
    }
    setSaving(false);
    setEditing(null);
    load();
    toast("تم الحفظ ✓");
  };

  const del = async (id: string) => {
    if (!confirm("حذف هذا العنصر؟")) return;
    await supabase.from("contact_faq_items").delete().eq("id", id);
    load();
  };

  const togglePublish = async (item: FaqItem) => {
    await supabase.from("contact_faq_items").update({ published: !item.published }).eq("id", item.id);
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>روابط سريعة تظهر في قسم "كيف يمكننا مساعدتك؟"</p>
        <button onClick={() => setEditing({ ...blank })} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "inherit", fontSize: "0.85rem" }}>
          <Plus size={15} /> إضافة بطاقة
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "0.75rem" }}>
        {items.map(item => (
          <div key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.5rem", opacity: item.published ? 1 : 0.55 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin size={14} color="#2563eb" />
              </div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "0.88rem", color: "#0f172a", flex: 1 }}>{item.title}</p>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button onClick={() => togglePublish(item)} style={{ background: "none", border: "none", cursor: "pointer", color: item.published ? "#16a34a" : "#94a3b8" }}>{item.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => setEditing({ ...item })} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontWeight: 700, fontSize: "0.8rem", fontFamily: "inherit" }}>تعديل</button>
                <button onClick={() => del(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><Trash2 size={14} /></button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>{item.description}</p>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? "تعديل البطاقة" : "إضافة بطاقة"} onClose={() => setEditing(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="العنوان" value={editing.title ?? ""} onChange={v => setEditing(e => ({ ...e, title: v }))} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>الأيقونة</span>
                <select value={editing.icon_name ?? "Info"} onChange={e => setEditing(ed => ({ ...ed, icon_name: e.target.value }))}
                  style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.55rem 0.85rem", fontSize: "0.85rem", outline: "none", fontFamily: "inherit", background: "#fff" }}>
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <Field label="رابط الضغط" value={editing.link_url ?? ""} onChange={v => setEditing(e => ({ ...e, link_url: v }))} placeholder="#contact-form" />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", marginTop: "1.25rem" }}>
                <input type="checkbox" checked={!!editing.published} onChange={e => setEditing(ed => ({ ...ed, published: e.target.checked }))} />
                ظاهر على الصفحة
              </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>الوصف</span>
              <textarea value={editing.description ?? ""} rows={3} onChange={e => setEditing(ed => ({ ...ed, description: e.target.value }))}
                style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.6rem 0.85rem", fontSize: "0.85rem", outline: "none", fontFamily: "inherit", resize: "vertical" }}
                onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
            </label>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)} style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1.25rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>إلغاء</button>
              <button onClick={save} disabled={saving} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Save size={15} />{saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Messages Panel ────────────────────────────────────────────────────────────
function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = () => supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => setMessages(data ?? []));
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    setMessages(ms => ms.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const del = async (id: string) => {
    if (!confirm("حذف هذه الرسالة نهائياً؟")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    setSelected(null);
    load();
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const shown = filter === "unread" ? messages.filter(m => !m.read) : messages;
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {["all", "unread"].map(f => (
          <button key={f} onClick={() => setFilter(f as "all" | "unread")} style={{ background: filter === f ? "#2563eb" : "#f1f5f9", color: filter === f ? "#fff" : "#475569", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit" }}>
            {f === "all" ? `الكل (${messages.length})` : `غير مقروءة (${unreadCount})`}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: "3rem" }}>لا توجد رسائل</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {shown.map(msg => (
          <div key={msg.id} onClick={() => { setSelected(msg); if (!msg.read) markRead(msg.id); }}
            style={{ background: "#fff", border: `1px solid ${!msg.read ? "#bfdbfe" : "#e2e8f0"}`, borderRight: `3px solid ${!msg.read ? "#2563eb" : "#e2e8f0"}`, borderRadius: "0.75rem", padding: "0.9rem 1.1rem", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: !msg.read ? "#eff6ff" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MessageCircle size={18} color={!msg.read ? "#2563eb" : "#94a3b8"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  <p style={{ margin: 0, fontWeight: msg.read ? 600 : 800, fontSize: "0.9rem", color: "#0f172a" }}>{msg.name}</p>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(msg.created_at)}</span>
                </div>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.subject} — {msg.message}</p>
              </div>
              {!msg.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", flexShrink: 0, marginTop: 6 }} />}
            </div>
          </div>
        ))}
      </div>

      {/* Message modal */}
      {selected && (
        <Modal title="تفاصيل الرسالة" onClose={() => setSelected(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[["الاسم", selected.name], ["البريد الإلكتروني", selected.email], ["الجوال", selected.phone || "—"], ["الموضوع", selected.subject], ["التاريخ", fmtDate(selected.created_at)]].map(([label, val]) => (
                <div key={label} style={{ background: "#f8fafc", borderRadius: "0.5rem", padding: "0.65rem 0.85rem" }}>
                  <p style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700, margin: "0 0 0.2rem", textTransform: "uppercase" }}>{label}</p>
                  <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.88rem", margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem 1.1rem" }}>
              <p style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700, margin: "0 0 0.5rem", textTransform: "uppercase" }}>نص الرسالة</p>
              <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{selected.message}</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href={`mailto:${selected.email}?subject=رد: ${selected.subject}`} style={{ flex: 1, background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                <Mail size={14} /> الرد بالبريد
              </a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: "#25d366", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 1rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                  <MessageCircle size={14} /> واتساب
                </a>
              )}
              <button onClick={() => del(selected.id)} style={{ background: "#fff0f0", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "0.5rem", padding: "0.65rem 0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontFamily: "inherit" }}>
                <Trash2 size={14} /> حذف
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Helper components ─────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "#f8fafc", border: "none", padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontFamily: "inherit", textAlign: "right" }}>
        <span style={{ color: "#2563eb" }}>{icon}</span>
        <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem", flex: 1 }}>{title}</span>
        {open ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </button>
      {open && <div style={{ padding: "1.25rem" }}>{children}</div>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} dir="rtl">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "0.4rem", padding: "0.35rem", cursor: "pointer", display: "flex" }}><X size={16} /></button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir, placeholder }: { label: string; value: string; onChange: (v: string) => void; dir?: string; placeholder?: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} dir={dir} placeholder={placeholder}
        style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.6rem 0.85rem", fontSize: "0.85rem", outline: "none", fontFamily: "inherit" }}
        onFocus={e => (e.target.style.borderColor = "#2563eb")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
    </label>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function AdminContact() {
  const [tab, setTab] = useState<"settings" | "info" | "faq" | "messages">("settings");
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    supabase.from("contact_settings").select("key,value").then(({ data }) => {
      if (data) setSettings(Object.fromEntries(data.map(r => [r.key, r.value])));
    });
  }, []);

  const tabs: { id: typeof tab; label: string; icon: React.ReactNode }[] = [
    { id: "settings", label: "إعدادات الصفحة", icon: <Settings2 size={15} /> },
    { id: "info",     label: "وسائل التواصل",  icon: <Phone size={15} /> },
    { id: "faq",      label: "روابط سريعة",    icon: <MessageCircle size={15} /> },
    { id: "messages", label: "الرسائل الواردة", icon: <Mail size={15} /> },
  ];

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 4, height: 28, background: "#2563eb", borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>إدارة صفحة التواصل</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "#2563eb" : "#f1f5f9", color: tab === t.id ? "#fff" : "#475569", border: "none", borderRadius: "0.5rem", padding: "0.55rem 1.1rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontFamily: "inherit", transition: "all 0.2s" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div>
        {tab === "settings"  && <SettingsPanel settings={settings} onSave={setSettings} />}
        {tab === "info"      && <InfoPanel />}
        {tab === "faq"       && <FaqPanel />}
        {tab === "messages"  && <MessagesPanel />}
      </div>
    </div>
  );
}
