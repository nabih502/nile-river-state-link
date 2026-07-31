import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

interface Member {
  id: string;
  full_name: string;
  member_number: string;
}

interface Conversation {
  id: string;
  member_id: string;
  subject: string;
  status: "open" | "pending" | "closed";
  last_message_at: string;
  member_unread: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "member" | "admin";
  sender_name: string;
  body: string;
  read: boolean;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  open:    { label: "مفتوحة",         color: "#065f46", bg: "#d1fae5" },
  pending: { label: "قيد الانتظار",   color: "#92400e", bg: "#fef3c7" },
  closed:  { label: "تم الإغلاق",    color: "#374151", bg: "#f3f4f6" },
};

const SUBJECTS = [
  "استفسار عام",
  "استفسار عن العضوية",
  "طلب خدمة اجتماعية",
  "استفسار استثماري",
  "مشكلة تقنية",
  "شكوى أو اقتراح",
];

function formatTime(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "الآن";
  if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`;
  if (diff < 86400000) return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

interface Props {
  member: Member;
}

export default function PortalChat({ member }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState(SUBJECTS[0]);
  const [firstMsg, setFirstMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("member_id", member.id)
      .order("last_message_at", { ascending: false });
    setConversations((data ?? []) as Conversation[]);
  };

  useEffect(() => {
    loadConversations();
  }, [member.id]);

  // Subscribe to conversation-level changes (unread count, status)
  useEffect(() => {
    const ch = supabase
      .channel(`member-convs-${member.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_conversations",
        filter: `member_id=eq.${member.id}`,
      }, () => { loadConversations(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [member.id]);

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setLoadingMsgs(true);

    // Mark member messages as read
    if (conv.member_unread > 0) {
      await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conv.id)
        .eq("sender_type", "admin")
        .eq("read", false);
      await supabase
        .from("chat_conversations")
        .update({ member_unread: 0 })
        .eq("id", conv.id);
    }

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as ChatMessage[]);
    setLoadingMsgs(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Unsubscribe previous channel
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    // Subscribe to new messages in this conversation
    const ch = supabase
      .channel(`chat-${conv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        // Mark admin messages as read immediately
        if (payload.new.sender_type === "admin") {
          supabase.from("chat_messages").update({ read: true }).eq("id", payload.new.id);
          supabase.from("chat_conversations").update({ member_unread: 0 }).eq("id", conv.id);
        }
      })
      .subscribe();
    channelRef.current = ch;
  };

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || sending) return;
    const body = newMessage.trim();
    setNewMessage("");
    setSending(true);

    await supabase.from("chat_messages").insert({
      conversation_id: activeConv.id,
      sender_type: "member",
      sender_name: member.full_name,
      body,
    });
    await supabase.from("chat_conversations").update({
      last_message_at: new Date().toISOString(),
      admin_unread: activeConv.status === "closed" ? 1 : undefined,
      status: activeConv.status === "closed" ? "open" : activeConv.status,
    }).eq("id", activeConv.id);

    setSending(false);
  };

  const createConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstMsg.trim() || creating) return;
    setCreating(true);

    const { data: conv } = await supabase
      .from("chat_conversations")
      .insert({
        member_id: member.id,
        member_name: member.full_name,
        member_number: member.member_number || "",
        subject: newSubject,
        admin_unread: 1,
      })
      .select()
      .single();

    if (conv) {
      await supabase.from("chat_messages").insert({
        conversation_id: conv.id,
        sender_type: "member",
        sender_name: member.full_name,
        body: firstMsg.trim(),
      });
      setShowNew(false);
      setFirstMsg("");
      await loadConversations();
      await openConversation(conv as Conversation);
    }
    setCreating(false);
  };

  const totalUnread = conversations.reduce((s, c) => s + c.member_unread, 0);

  return (
    <div className="pchat-wrap">
      {/* ── Conversations list ── */}
      <div className={`pchat-list ${activeConv ? "pchat-list-hidden-mobile" : ""}`}>
        <div className="pchat-list-head">
          <h3>
            المحادثات
            {totalUnread > 0 && <span className="pchat-unread-badge">{totalUnread}</span>}
          </h3>
          <button className="pchat-new-btn" onClick={() => setShowNew(true)}>+ محادثة جديدة</button>
        </div>

        {conversations.length === 0 ? (
          <div className="pchat-empty">
            <div className="pchat-empty-icon">💬</div>
            <p>لا توجد محادثات بعد</p>
            <button className="portal-btn-primary" onClick={() => setShowNew(true)}>ابدأ محادثة</button>
          </div>
        ) : (
          <div className="pchat-convs">
            {conversations.map(conv => {
              const st = STATUS_LABEL[conv.status] ?? STATUS_LABEL.open;
              return (
                <button
                  key={conv.id}
                  className={`pchat-conv-item ${activeConv?.id === conv.id ? "active" : ""} ${conv.member_unread > 0 ? "has-unread" : ""}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className="pchat-conv-top">
                    <span className="pchat-conv-subject">{conv.subject}</span>
                    <span className="pchat-conv-time">{formatTime(conv.last_message_at)}</span>
                  </div>
                  <div className="pchat-conv-bottom">
                    <span className="pchat-conv-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    {conv.member_unread > 0 && (
                      <span className="pchat-conv-unread">{conv.member_unread}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Chat window ── */}
      {activeConv ? (
        <div className="pchat-window">
          <div className="pchat-window-head">
            <button className="pchat-back-btn" onClick={() => { setActiveConv(null); if (channelRef.current) supabase.removeChannel(channelRef.current); }}>
              ← رجوع
            </button>
            <div className="pchat-window-title">
              <span>{activeConv.subject}</span>
              <span
                className="pchat-window-status"
                style={{ color: STATUS_LABEL[activeConv.status]?.color, background: STATUS_LABEL[activeConv.status]?.bg }}
              >
                {STATUS_LABEL[activeConv.status]?.label}
              </span>
            </div>
          </div>

          <div className="pchat-messages">
            {loadingMsgs ? (
              <div className="pchat-loading">جاري تحميل الرسائل...</div>
            ) : messages.length === 0 ? (
              <div className="pchat-loading" style={{ color: "#94a3b8" }}>لا توجد رسائل بعد</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`pchat-msg ${msg.sender_type === "member" ? "mine" : "theirs"}`}>
                  {msg.sender_type === "admin" && (
                    <div className="pchat-msg-sender">
                      <div className="pchat-admin-avatar">إ</div>
                      <span>{msg.sender_name || "فريق الدعم"}</span>
                    </div>
                  )}
                  <div className="pchat-msg-bubble">
                    {msg.body}
                  </div>
                  <div className="pchat-msg-time">{formatTime(msg.created_at)}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {activeConv.status !== "closed" ? (
            <form className="pchat-input-row" onSubmit={sendMessage}>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                disabled={sending}
                autoFocus
              />
              <button type="submit" disabled={sending || !newMessage.trim()} className="pchat-send-btn">
                {sending ? "..." : "إرسال"}
              </button>
            </form>
          ) : (
            <div className="pchat-closed-notice">
              تم إغلاق هذه المحادثة — يمكنك فتح محادثة جديدة
            </div>
          )}
        </div>
      ) : (
        <div className="pchat-placeholder">
          <div className="pchat-placeholder-icon">💬</div>
          <p>اختر محادثة أو ابدأ واحدة جديدة</p>
        </div>
      )}

      {/* ── New conversation modal ── */}
      {showNew && (
        <div className="portal-overlay">
          <div className="portal-modal">
            <div className="portal-modal-head">
              <h3>محادثة جديدة</h3>
              <button onClick={() => setShowNew(false)}>✕</button>
            </div>
            <form onSubmit={createConversation} className="portal-modal-form">
              <label className="portal-field">
                <span>موضوع الاستفسار</span>
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="portal-field">
                <span>رسالتك الأولى</span>
                <textarea
                  value={firstMsg}
                  onChange={e => setFirstMsg(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  required
                />
              </label>
              <div className="portal-modal-foot">
                <button type="submit" className="portal-btn-primary" disabled={creating || !firstMsg.trim()}>
                  {creating ? "جاري الإنشاء..." : "إرسال"}
                </button>
                <button type="button" onClick={() => setShowNew(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
