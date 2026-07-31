import { useEffect, useRef, useState } from "react";
import { supabase, signedChatAttachmentUrl } from "./supabase";
import type { AdminSession } from "./admin-auth-client";

interface Conversation {
  id: string;
  member_id: string;
  member_name: string;
  member_number: string;
  subject: string;
  status: "open" | "pending" | "closed";
  last_message_at: string;
  admin_unread: number;
  member_unread: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "member" | "admin";
  sender_name: string;
  body: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read: boolean;
  created_at: string;
}

function isImage(type: string | null) {
  return !!type && type.startsWith("image/");
}

function AdminAttachment({ url: stored, name, type }: { url: string; name: string | null; type: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    signedChatAttachmentUrl(stored).then(u => { if (alive) setUrl(u); }, () => {});
    return () => { alive = false; };
  }, [stored]);
  if (!url) return <span className="adm-attach-file">جارٍ تحميل المرفق...</span>;
  if (isImage(type)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="adm-attach-img-wrap">
        <img src={url} alt={name ?? "صورة"} className="adm-attach-img" loading="lazy" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="adm-attach-file">
      <span>📎</span>
      <span className="adm-attach-file-name">{name ?? "ملف"}</span>
      <span>⬇</span>
    </a>
  );
}

const STATUS_OPTS = [
  { value: "open",    label: "مفتوحة",       color: "#065f46", bg: "#d1fae5" },
  { value: "pending", label: "قيد الانتظار", color: "#92400e", bg: "#fef3c7" },
  { value: "closed",  label: "مغلقة",        color: "#374151", bg: "#f3f4f6" },
];

function statusInfo(s: string) {
  return STATUS_OPTS.find(o => o.value === s) ?? STATUS_OPTS[0];
}

function formatTime(d: string) {
  const date = new Date(d);
  const diff  = Date.now() - date.getTime();
  if (diff < 60000)    return "الآن";
  if (diff < 3600000)  return `منذ ${Math.floor(diff / 60000)} د`;
  if (diff < 86400000) return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

interface Props { session: AdminSession; }

export default function AdminChatPanel({ session }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive]               = useState<Conversation | null>(null);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [reply, setReply]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [filter, setFilter]               = useState<"all" | "open" | "pending" | "closed">("all");
  const [search, setSearch]               = useState("");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const msgPollRef = useRef<number | null>(null);

  const loadConversations = async () => {
    const q = supabase.from("chat_conversations").select("*").order("last_message_at", { ascending: false });
    const { data } = await q;
    setConversations((data ?? []) as Conversation[]);
  };

  useEffect(() => {
    loadConversations();
    // Subscribe to any new message insertion — update conv list
    const ch = supabase.channel("admin-chat-conv-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, loadConversations)
      .subscribe();
    // Conversations are now readable only with a verified staff session, which the
    // realtime socket cannot present, so refresh on a timer as well.
    const iv = window.setInterval(loadConversations, 8000);
    return () => { supabase.removeChannel(ch); window.clearInterval(iv); };
  }, []);

  const openConversation = async (conv: Conversation) => {
    setActive(conv);
    setLoadingMsgs(true);

    // Mark all member messages in this conversation as read
    if (conv.admin_unread > 0) {
      await supabase.from("chat_messages").update({ read: true })
        .eq("conversation_id", conv.id).eq("sender_type", "member").eq("read", false);
      await supabase.from("chat_conversations").update({ admin_unread: 0 }).eq("id", conv.id);
    }

    const reloadMessages = async () => {
      const { data } = await supabase.from("chat_messages").select("*")
        .eq("conversation_id", conv.id).order("created_at", { ascending: true });
      setMessages((data ?? []) as ChatMessage[]);
    };
    await reloadMessages();
    setLoadingMsgs(false);
    if (msgPollRef.current) window.clearInterval(msgPollRef.current);
    msgPollRef.current = window.setInterval(() => { void reloadMessages(); }, 8000);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Realtime for this conversation
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const msgCh = supabase.channel(`admin-msg-${conv.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        // Auto-mark as read if it's from the member
        if (payload.new.sender_type === "member") {
          supabase.from("chat_messages").update({ read: true }).eq("id", payload.new.id);
          supabase.from("chat_conversations").update({ admin_unread: 0 }).eq("id", conv.id);
        }
      })
      .subscribe();
    channelRef.current = msgCh;
  };

  useEffect(() => () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (msgPollRef.current) window.clearInterval(msgPollRef.current);
  }, []);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !active || sending) return;
    const body = reply.trim();
    setReply("");
    setSending(true);
    await supabase.from("chat_messages").insert({
      conversation_id: active.id,
      sender_type: "admin",
      sender_name: session.fullName,
      body,
    });
    await supabase.from("chat_conversations").update({
      last_message_at: new Date().toISOString(),
      member_unread: active.member_unread + 1,
      status: active.status === "closed" ? "open" : active.status,
    }).eq("id", active.id);
    setSending(false);
  };

  const setStatus = async (status: string) => {
    if (!active) return;
    await supabase.from("chat_conversations").update({ status }).eq("id", active.id);
    setActive(prev => prev ? { ...prev, status: status as Conversation["status"] } : null);
    loadConversations();
  };

  const totalUnread = conversations.reduce((s, c) => s + c.admin_unread, 0);

  const filtered = conversations.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.member_name.includes(search) && !c.subject.includes(search)) return false;
    return true;
  });

  return (
    <div className="adm-chat-wrap">
      {/* Conversations Panel */}
      <div className={`adm-chat-list ${active ? "adm-chat-list-collapsed" : ""}`}>
        <div className="adm-chat-list-head">
          <h3>
            المحادثات
            {totalUnread > 0 && <span className="adm-chat-unread-badge">{totalUnread}</span>}
          </h3>
          <input
            className="adm-chat-search"
            placeholder="بحث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="adm-chat-filter-tabs">
          {([["all", "الكل"], ["open", "مفتوحة"], ["pending", "انتظار"], ["closed", "مغلقة"]] as const).map(([val, lbl]) => (
            <button key={val} className={filter === val ? "active" : ""} onClick={() => setFilter(val)}>{lbl}</button>
          ))}
        </div>

        <div className="adm-chat-convs">
          {filtered.length === 0 && (
            <p className="adm-empty">لا توجد محادثات</p>
          )}
          {filtered.map(conv => {
            const st = statusInfo(conv.status);
            return (
              <button
                key={conv.id}
                className={`adm-chat-conv-item ${active?.id === conv.id ? "active" : ""} ${conv.admin_unread > 0 ? "has-unread" : ""}`}
                onClick={() => openConversation(conv)}
              >
                <div className="adm-chat-conv-top">
                  <span className="adm-chat-conv-name">{conv.member_name}</span>
                  <span className="adm-chat-conv-time">{formatTime(conv.last_message_at)}</span>
                </div>
                <div className="adm-chat-conv-mid">{conv.subject}</div>
                <div className="adm-chat-conv-bot">
                  <span className="adm-chat-conv-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                  {conv.admin_unread > 0 && <span className="adm-chat-conv-unread-dot">{conv.admin_unread}</span>}
                  {conv.member_number && <span className="adm-chat-conv-num" dir="ltr">{conv.member_number}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      {active ? (
        <div className="adm-chat-window">
          <div className="adm-chat-window-head">
            <button className="adm-chat-back" onClick={() => { setActive(null); if (channelRef.current) supabase.removeChannel(channelRef.current); }}>
              ← رجوع
            </button>
            <div className="adm-chat-window-info">
              <div className="adm-chat-window-member">{active.member_name}</div>
              <div className="adm-chat-window-subject">{active.subject}</div>
            </div>
            <div className="adm-chat-window-actions">
              {STATUS_OPTS.map(opt => (
                <button
                  key={opt.value}
                  className={`adm-chat-status-btn ${active.status === opt.value ? "current" : ""}`}
                  style={active.status === opt.value ? { color: opt.color, background: opt.bg, borderColor: opt.color } : {}}
                  onClick={() => setStatus(opt.value)}
                  disabled={active.status === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="adm-chat-msgs">
            {loadingMsgs ? (
              <div className="adm-loading">جاري التحميل...</div>
            ) : messages.length === 0 ? (
              <div className="adm-loading" style={{ color: "#94a3b8" }}>لا توجد رسائل</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`adm-chat-msg ${msg.sender_type === "admin" ? "admin-msg" : "member-msg"}`}>
                  <div className="adm-chat-msg-sender">
                    <div className={`adm-chat-avatar ${msg.sender_type}`}>
                      {msg.sender_type === "admin" ? msg.sender_name.charAt(0) : msg.sender_name.charAt(0)}
                    </div>
                    <span>{msg.sender_name || (msg.sender_type === "admin" ? "فريق الدعم" : "العضو")}</span>
                    <span className="adm-chat-msg-time">{formatTime(msg.created_at)}</span>
                  </div>
                  {msg.attachment_url && (
                    <AdminAttachment url={msg.attachment_url} name={msg.attachment_name} type={msg.attachment_type} />
                  )}
                  {msg.body && (
                    <div className={`adm-chat-bubble ${msg.sender_type}`}>{msg.body}</div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {active.status !== "closed" ? (
            <form className="adm-chat-reply-row" onSubmit={sendReply}>
              <textarea
                className="adm-chat-reply-input"
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={`ردك على ${active.member_name}...`}
                rows={2}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(e as unknown as React.FormEvent); } }}
                disabled={sending}
              />
              <button type="submit" className="adm-chat-send-btn" disabled={sending || !reply.trim()}>
                {sending ? "..." : "إرسال"}
              </button>
            </form>
          ) : (
            <div className="adm-chat-closed-notice">
              هذه المحادثة مغلقة — اضغط "مفتوحة" لإعادة فتحها
            </div>
          )}
        </div>
      ) : (
        <div className="adm-chat-placeholder">
          <div className="adm-chat-placeholder-icon">💬</div>
          <p>اختر محادثة للرد عليها</p>
          {totalUnread > 0 && <p className="adm-chat-placeholder-unread">لديك {totalUnread} رسالة غير مقروءة</p>}
        </div>
      )}
    </div>
  );
}
