import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisitorConv {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  status: "bot" | "waiting" | "human" | "closed";
  last_message_at: string;
  admin_unread: number;
  visitor_unread: number;
  created_at: string;
}

interface VisitorMsg {
  id: string;
  conversation_id: string;
  sender_type: "visitor" | "bot" | "admin";
  sender_name: string;
  body: string;
  created_at: string;
}

interface BotFaq {
  id: string;
  question: string;
  keywords: string;
  answer: string;
  is_default: boolean;
  published: boolean;
  sort_order: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_INFO: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  bot:     { label: "بوت",              color: "#1d4ed8", bg: "#dbeafe", dot: "#2563eb" },
  waiting: { label: "تنتظر رد",        color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  human:   { label: "دعم بشري",         color: "#065f46", bg: "#d1fae5", dot: "#16a34a" },
  closed:  { label: "مغلقة",            color: "#374151", bg: "#f3f4f6", dot: "#94a3b8" },
};

function formatTime(d: string) {
  const date = new Date(d);
  const diff  = Date.now() - date.getTime();
  if (diff < 60000)    return "الآن";
  if (diff < 3600000)  return `منذ ${Math.floor(diff / 60000)} د`;
  if (diff < 86400000) return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

// ─────────────────────────────────────────────────────────────────────────────
// BOT FAQ EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function BotFaqEditor() {
  const [faqs, setFaqs]         = useState<BotFaq[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<BotFaq | null>(null);
  const [adding, setAdding]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const blank = (): Partial<BotFaq> => ({
    question: "", keywords: "", answer: "", is_default: false, published: true, sort_order: 0,
  });
  const [form, setForm] = useState<Partial<BotFaq>>(blank());

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("chatbot_faqs").select("*").order("is_default").order("sort_order");
    setFaqs((data ?? []) as BotFaq[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(blank()); setAdding(true); setEditing(null); };
  const openEdit = (faq: BotFaq) => { setForm({ ...faq }); setEditing(faq); setAdding(false); };
  const closeForm = () => { setAdding(false); setEditing(null); };

  const save = async () => {
    if (!form.answer?.trim()) return;
    setSaving(true);
    if (editing) {
      await supabase.from("chatbot_faqs").update({
        question: form.question ?? "",
        keywords: form.keywords ?? "",
        answer: form.answer,
        published: form.published ?? true,
        sort_order: form.sort_order ?? 0,
      }).eq("id", editing.id);
    } else {
      await supabase.from("chatbot_faqs").insert({
        question: form.question ?? "",
        keywords: form.keywords ?? "",
        answer: form.answer,
        is_default: false,
        published: form.published ?? true,
        sort_order: form.sort_order ?? 0,
      });
    }
    setSaving(false);
    closeForm();
    load();
  };

  const togglePublish = async (faq: BotFaq) => {
    await supabase.from("chatbot_faqs").update({ published: !faq.published }).eq("id", faq.id);
    load();
  };

  const deleteFaq = async (id: string) => {
    await supabase.from("chatbot_faqs").delete().eq("id", id);
    setConfirmId(null);
    load();
  };

  const regular = faqs.filter(f => !f.is_default);
  const fallback = faqs.find(f => f.is_default);

  return (
    <div className="vbot-editor">
      <div className="vbot-editor-head">
        <h3>إجابات المساعد الذكي</h3>
        <button className="adm-btn-primary" onClick={openAdd}>+ إضافة إجابة</button>
      </div>

      {/* Fallback message section */}
      {fallback && (
        <div className="vbot-fallback-card">
          <div className="vbot-fallback-label">رسالة العجز الافتراضية <small>(تُرسل عند عدم فهم السؤال)</small></div>
          {editing?.id === fallback.id ? (
            <div className="vbot-form">
              <textarea
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                rows={3}
                className="vbot-textarea"
                placeholder="رسالة العجز..."
              />
              <div className="vbot-form-actions">
                <button className="adm-btn-primary" onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
                <button onClick={closeForm}>إلغاء</button>
              </div>
            </div>
          ) : (
            <div className="vbot-fallback-body">
              <p>{fallback.answer}</p>
              <button className="vbot-edit-btn" onClick={() => openEdit(fallback)}>تعديل</button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit form */}
      {(adding || (editing && !editing.is_default)) && (
        <div className="vbot-form-card">
          <h4>{adding ? "إضافة إجابة جديدة" : "تعديل الإجابة"}</h4>
          <div className="vbot-form">
            <div className="vbot-form-row">
              <div className="vbot-form-field">
                <label>السؤال النموذجي <small>(للمرجع فقط)</small></label>
                <input
                  type="text"
                  placeholder="مثال: كيف أشترك في الرابطة؟"
                  value={form.question ?? ""}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                />
              </div>
              <div className="vbot-form-field">
                <label>الترتيب</label>
                <input
                  type="number"
                  min={0}
                  value={form.sort_order ?? 0}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  style={{ width: "80px" }}
                />
              </div>
            </div>
            <div className="vbot-form-field">
              <label>الكلمات المفتاحية <small>(مفصولة بفاصلة)</small></label>
              <input
                type="text"
                placeholder="عضوية,اشتراك,تسجيل,انضمام"
                value={form.keywords ?? ""}
                onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                dir="rtl"
              />
              <small className="vbot-hint">إذا وجد البوت أي كلمة من هذه في رسالة الزائر، سيرسل الجواب أدناه</small>
            </div>
            <div className="vbot-form-field">
              <label>الجواب <span style={{ color: "#dc2626" }}>*</span></label>
              <textarea
                value={form.answer ?? ""}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                rows={4}
                className="vbot-textarea"
                placeholder="اكتب الجواب الذي سيرسله البوت..."
              />
            </div>
            <div className="vbot-form-check">
              <label>
                <input type="checkbox" checked={form.published ?? true} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                منشور (مفعّل)
              </label>
            </div>
            <div className="vbot-form-actions">
              <button className="adm-btn-primary" onClick={save} disabled={saving || !form.answer?.trim()}>
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button onClick={closeForm}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQs table */}
      {loading ? (
        <div className="adm-empty">جاري التحميل...</div>
      ) : regular.length === 0 ? (
        <div className="adm-empty">لا توجد إجابات محفوظة — أضف إجابة جديدة</div>
      ) : (
        <div className="vbot-table-wrap">
          <table className="vbot-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الكلمات المفتاحية</th>
                <th>السؤال النموذجي</th>
                <th>مقتطف من الجواب</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {regular.map((faq, i) => (
                <tr key={faq.id} className={faq.published ? "" : "vbot-row-hidden"}>
                  <td className="vbot-td-num">{faq.sort_order || i + 1}</td>
                  <td>
                    <div className="vbot-keywords-wrap">
                      {faq.keywords.split(",").filter(Boolean).map(kw => (
                        <span key={kw} className="vbot-kw-tag">{kw.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td className="vbot-td-q">{faq.question || "—"}</td>
                  <td className="vbot-td-ans">{faq.answer.slice(0, 60)}{faq.answer.length > 60 ? "…" : ""}</td>
                  <td>
                    <button
                      className={`vbot-status-toggle ${faq.published ? "active" : "inactive"}`}
                      onClick={() => togglePublish(faq)}
                    >
                      {faq.published ? "مفعّل" : "مخفي"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <button className="adm-btn-sm" onClick={() => openEdit(faq)}>تعديل</button>
                      <button className="adm-btn-sm danger" onClick={() => setConfirmId(faq.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete */}
      {confirmId && (
        <div className="portal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmId(null); }}>
          <div className="portal-modal" style={{ maxWidth: 360 }}>
            <div className="portal-modal-head"><h3>تأكيد الحذف</h3></div>
            <div className="portal-modal-form">
              <p>هل أنت متأكد من حذف هذه الإجابة؟</p>
              <div className="portal-modal-foot">
                <button className="adm-btn-primary" style={{ background: "#dc2626" }} onClick={() => deleteFaq(confirmId)}>حذف</button>
                <button onClick={() => setConfirmId(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ConversationsPanel({ adminName }: { adminName: string }) {
  const [convs, setConvs]     = useState<VisitorConv[]>([]);
  const [active, setActive]   = useState<VisitorConv | null>(null);
  const [messages, setMessages] = useState<VisitorMsg[]>([]);
  const [reply, setReply]     = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter]   = useState<"all" | "waiting" | "human" | "bot" | "closed">("all");
  const [search, setSearch]   = useState("");

  const bottomRef  = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const listChanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadConvs = async () => {
    const { data } = await supabase
      .from("visitor_conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    setConvs((data ?? []) as VisitorConv[]);
  };

  useEffect(() => {
    loadConvs();
    // realtime for new conversations + updates
    const ch = supabase.channel("admin-vis-convs")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitor_conversations" }, () => {
        loadConvs();
      })
      .subscribe();
    listChanRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, []);

  const openConv = async (conv: VisitorConv) => {
    setActive(conv);
    setReply("");

    // mark admin unread as 0
    if (conv.admin_unread > 0) {
      await supabase.from("visitor_conversations").update({ admin_unread: 0 }).eq("id", conv.id);
    }

    const { data } = await supabase
      .from("visitor_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as VisitorMsg[]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

    // subscribe realtime
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`admin-vis-msgs-${conv.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "visitor_messages",
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        setMessages(prev => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new as VisitorMsg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();
    channelRef.current = ch;
  };

  useEffect(() => () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (listChanRef.current) supabase.removeChannel(listChanRef.current);
  }, []);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !active || sending) return;

    setSending(true);
    setReply("");

    await supabase.from("visitor_messages").insert({
      conversation_id: active.id,
      sender_type: "admin",
      sender_name: adminName,
      body: text,
    });

    // upgrade status to human if it was waiting/bot
    if (active.status === "waiting" || active.status === "bot") {
      await supabase.from("visitor_conversations").update({
        status: "human",
        last_message_at: new Date().toISOString(),
        visitor_unread: (active.visitor_unread ?? 0) + 1,
      }).eq("id", active.id);
      setActive(a => a ? { ...a, status: "human" } : a);
    } else {
      await supabase.from("visitor_conversations").update({
        last_message_at: new Date().toISOString(),
        visitor_unread: (active.visitor_unread ?? 0) + 1,
      }).eq("id", active.id);
    }

    setSending(false);
    loadConvs();
  };

  const changeStatus = async (status: VisitorConv["status"]) => {
    if (!active) return;
    await supabase.from("visitor_conversations").update({ status }).eq("id", active.id);
    setActive(a => a ? { ...a, status } : a);
    loadConvs();
  };

  const filtered = convs.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.visitor_name.includes(search) && !c.visitor_phone.includes(search)) return false;
    return true;
  });

  const waitingCount = convs.filter(c => c.status === "waiting").length;

  return (
    <div className="visconv-wrap">
      {/* ── left: conversations list ── */}
      <div className="visconv-list">
        <div className="visconv-list-head">
          <h3>
            محادثات الزوار
            {waitingCount > 0 && <span className="adm-chat-unread-badge">{waitingCount} تنتظر</span>}
          </h3>
          <input
            type="text"
            className="adm-chat-search"
            placeholder="بحث بالاسم أو الهاتف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="visconv-filters">
            {(["all", "waiting", "human", "bot", "closed"] as const).map(f => (
              <button key={f} className={`visconv-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "الكل" : STATUS_INFO[f]?.label}
                {f === "waiting" && waitingCount > 0 && ` (${waitingCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="visconv-items">
          {filtered.length === 0 && <div className="adm-empty">لا توجد محادثات</div>}
          {filtered.map(conv => {
            const si = STATUS_INFO[conv.status] ?? STATUS_INFO.bot;
            return (
              <button
                key={conv.id}
                className={`visconv-item ${active?.id === conv.id ? "active" : ""} ${conv.admin_unread > 0 ? "has-unread" : ""}`}
                onClick={() => openConv(conv)}
              >
                <div className="visconv-item-top">
                  <span className="visconv-item-name">{conv.visitor_name}</span>
                  <span className="visconv-item-time">{formatTime(conv.last_message_at)}</span>
                </div>
                <div className="visconv-item-bottom">
                  <span dir="ltr" className="visconv-item-phone">{conv.visitor_phone}</span>
                  <span className="visconv-item-status" style={{ color: si.color, background: si.bg }}>{si.label}</span>
                  {conv.admin_unread > 0 && <span className="adm-chat-unread-badge">{conv.admin_unread}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── right: chat window ── */}
      {active ? (
        <div className="visconv-window">
          <div className="visconv-window-head">
            <div className="visconv-window-info">
              <span className="visconv-window-name">{active.visitor_name}</span>
              <span dir="ltr" className="visconv-window-phone">{active.visitor_phone}</span>
            </div>
            <div className="visconv-window-actions">
              <span className="visconv-status-label" style={{ color: STATUS_INFO[active.status]?.color, background: STATUS_INFO[active.status]?.bg }}>
                <span className="vchat-status-dot" style={{ background: STATUS_INFO[active.status]?.dot }} />
                {STATUS_INFO[active.status]?.label}
              </span>
              <select
                className="visconv-status-select"
                value={active.status}
                onChange={e => changeStatus(e.target.value as VisitorConv["status"])}
              >
                <option value="bot">بوت</option>
                <option value="waiting">تنتظر رد</option>
                <option value="human">دعم بشري</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>
          </div>

          <div className="visconv-messages">
            {messages.map(msg => {
              if (msg.body === "__TRANSFER_PROMPT__") return null;
              const isVisitor = msg.sender_type === "visitor";
              const isBot     = msg.sender_type === "bot";
              return (
                <div key={msg.id} className={`visconv-msg ${isVisitor ? "visitor" : "agent"}`}>
                  {!isVisitor && (
                    <div className="visconv-msg-avatar">{isBot ? "🤖" : "👤"}</div>
                  )}
                  <div className="visconv-msg-wrap">
                    {!isVisitor && (
                      <span className="visconv-msg-sender">{isBot ? "البوت" : msg.sender_name}</span>
                    )}
                    <div className={`visconv-msg-bubble ${msg.sender_type}`}>
                      {msg.body.split("\n").map((line, i, arr) => (
                        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                      ))}
                    </div>
                    <span className="visconv-msg-time">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {active.status !== "closed" ? (
            <form className="visconv-reply-area" onSubmit={sendReply}>
              <input
                type="text"
                placeholder={`ردك على ${active.visitor_name}...`}
                value={reply}
                onChange={e => setReply(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="adm-btn-primary" disabled={sending || !reply.trim()}>
                {sending ? "..." : "إرسال"}
              </button>
            </form>
          ) : (
            <div className="pchat-closed-notice">المحادثة مغلقة</div>
          )}
        </div>
      ) : (
        <div className="adm-chat-placeholder">
          <div className="adm-chat-placeholder-icon">💬</div>
          <p>اختر محادثة لعرضها</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  adminName: string;
}

export default function AdminVisitorChat({ adminName }: Props) {
  const [tab, setTab] = useState<"convs" | "bot">("convs");
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from("visitor_conversations")
        .select("*", { count: "exact", head: true })
        .eq("status", "waiting");
      setWaitingCount(count ?? 0);
    };
    load();
    const ch = supabase.channel("admin-vis-waiting")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitor_conversations" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="visadm-wrap">
      <div className="visadm-tabs">
        <button className={`visadm-tab ${tab === "convs" ? "active" : ""}`} onClick={() => setTab("convs")}>
          المحادثات
          {waitingCount > 0 && <span className="adm-chat-unread-badge">{waitingCount}</span>}
        </button>
        <button className={`visadm-tab ${tab === "bot" ? "active" : ""}`} onClick={() => setTab("bot")}>
          إجابات البوت
        </button>
      </div>

      {tab === "convs" && <ConversationsPanel adminName={adminName} />}
      {tab === "bot"   && <BotFaqEditor />}
    </div>
  );
}
