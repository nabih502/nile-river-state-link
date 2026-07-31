import { useEffect, useRef, useState } from "react";
import { supabase, signedChatAttachmentUrl } from "./supabase";

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
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read: boolean;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  open:    { label: "مفتوحة",       color: "#065f46", bg: "#d1fae5" },
  pending: { label: "قيد الانتظار", color: "#92400e", bg: "#fef3c7" },
  closed:  { label: "مغلقة",        color: "#374151", bg: "#f3f4f6" },
};

const SUBJECTS = [
  "استفسار عام",
  "استفسار عن العضوية",
  "طلب خدمة اجتماعية",
  "استفسار استثماري",
  "مشكلة تقنية",
  "شكوى أو اقتراح",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function isImage(type: string | null) {
  return !!type && type.startsWith("image/");
}

function formatTime(d: string) {
  const date = new Date(d);
  const diff  = Date.now() - date.getTime();
  if (diff < 60000)    return "الآن";
  if (diff < 3600000)  return `منذ ${Math.floor(diff / 60000)} د`;
  if (diff < 86400000) return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

// ─── Attachment renderer ──────────────────────────────────────────────────────
function useSignedAttachment(stored: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    signedChatAttachmentUrl(stored).then(u => { if (alive) setUrl(u); }, () => {});
    return () => { alive = false; };
  }, [stored]);
  return url;
}

function Attachment({ url: stored, name, type, mine }: { url: string; name: string | null; type: string | null; mine: boolean }) {
  const url = useSignedAttachment(stored);
  if (!url) return <span className="pchat-attach-file">جارٍ تحميل المرفق...</span>;
  if (isImage(type)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={`pchat-attach-img-wrap ${mine ? "mine" : ""}`}>
        <img src={url} alt={name ?? "صورة"} className="pchat-attach-img" loading="lazy" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={`pchat-attach-file ${mine ? "mine" : ""}`}>
      <span className="pchat-attach-file-icon">📎</span>
      <span className="pchat-attach-file-name">{name ?? "ملف"}</span>
      <span className="pchat-attach-file-dl">⬇</span>
    </a>
  );
}

interface Props { member: Member; }

export default function PortalChat({ member }: Props) {
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [activeConv, setActiveConv]         = useState<Conversation | null>(null);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage]         = useState("");
  const [sending, setSending]               = useState(false);
  const [showNew, setShowNew]               = useState(false);
  const [newSubject, setNewSubject]         = useState(SUBJECTS[0]);

  // attachment state
  const [attachFile, setAttachFile]         = useState<File | null>(null);
  const [attachPreview, setAttachPreview]   = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [attachError, setAttachError]       = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const channelRef   = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const msgPollRef   = useRef<number | null>(null);

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
    // Conversations are readable only with a verified session token, which the
    // realtime socket cannot present, so refresh on a timer as well.
    const iv = window.setInterval(() => { void loadConversations(); }, 8000);
    return () => window.clearInterval(iv);
  }, [member.id]);

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    clearAttachment();

    if (conv.member_unread > 0) {
      await supabase.from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conv.id)
        .eq("sender_type", "admin")
        .eq("read", false);
      await supabase.from("chat_conversations")
        .update({ member_unread: 0 })
        .eq("id", conv.id);
    }

    const reloadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as ChatMessage[]);
    };
    await reloadMessages();
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    if (msgPollRef.current) window.clearInterval(msgPollRef.current);
    msgPollRef.current = window.setInterval(() => { void reloadMessages(); }, 8000);

    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`member-chat-${conv.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        if (payload.new.sender_type === "admin") {
          supabase.from("chat_conversations").update({ member_unread: 0 }).eq("id", conv.id);
        }
      })
      .subscribe();
    channelRef.current = ch;
  };

  useEffect(() => () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (msgPollRef.current) window.clearInterval(msgPollRef.current);
  }, []);

  // ─── file picking ─────────────────────────────────────────────────────────
  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAttachError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAttachError("نوع الملف غير مدعوم. مسموح: صور (JPG/PNG/GIF/WEBP) أو PDF");
      return;
    }
    if (file.size > MAX_SIZE) {
      setAttachError("حجم الملف أكبر من 10 ميغابايت");
      return;
    }
    setAttachFile(file);
    if (isImage(file.type)) {
      const reader = new FileReader();
      reader.onload = e => setAttachPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAttachPreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachFile(null);
    setAttachPreview(null);
    setUploadProgress("idle");
    setAttachError("");
  };

  // ─── send message ─────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachFile) || !activeConv || sending) return;
    if (activeConv.status === "closed") return;

    setSending(true);
    setAttachError("");

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;
    let attachmentType: string | null = null;

    if (attachFile) {
      setUploadProgress("uploading");
      const ext  = attachFile.name.split(".").pop();
      const path = `${activeConv.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("chat-attachments")
        .upload(path, attachFile, { contentType: attachFile.type, upsert: false });
      if (upErr) {
        console.error(upErr);
        setAttachError("فشل رفع الملف، تأكد من نوع الملف وحجمه");
        setUploadProgress("error");
        setSending(false);
        return;
      }
      attachmentUrl  = path;
      attachmentName = attachFile.name;
      attachmentType = attachFile.type;
      setUploadProgress("done");
    }

    const body = newMessage.trim();
    setNewMessage("");
    clearAttachment();

    await supabase.from("chat_messages").insert({
      conversation_id: activeConv.id,
      sender_type: "member",
      sender_name: member.full_name,
      body,
      attachment_url:  attachmentUrl,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
    });

    await supabase.from("chat_conversations").update({
      last_message_at: new Date().toISOString(),
      admin_unread: (activeConv as unknown as { admin_unread: number }).admin_unread + 1,
      status: activeConv.status === "closed" ? "open" : activeConv.status,
    }).eq("id", activeConv.id);

    setSending(false);
    loadConversations();
  };

  // ─── new conversation ─────────────────────────────────────────────────────
  const createConversation = async () => {
    if (!newSubject.trim()) return;
    const { data, error } = await supabase.from("chat_conversations").insert({
      member_id:    member.id,
      member_name:  member.full_name,
      member_number: member.member_number,
      subject:      newSubject,
    }).select().maybeSingle();
    if (!error && data) {
      setShowNew(false);
      await loadConversations();
      openConversation(data as Conversation);
    }
  };

  const totalUnread = conversations.reduce((s, c) => s + c.member_unread, 0);

  return (
    <div className="pchat-wrap">
      {/* ── conversations list ── */}
      <div className={`pchat-list ${activeConv ? "pchat-list-hidden" : ""}`}>
        <div className="pchat-list-head">
          <h3>
            محادثاتي
            {totalUnread > 0 && <span className="pchat-unread-badge">{totalUnread}</span>}
          </h3>
          <button className="pchat-new-btn" onClick={() => setShowNew(true)}>+ جديدة</button>
        </div>

        <div className="pchat-convs">
          {conversations.length === 0 && (
            <div className="pchat-empty">
              <span className="pchat-empty-icon">💬</span>
              <p>لا توجد محادثات</p>
              <button className="portal-btn-primary" style={{ fontSize: ".82rem", padding: ".5rem 1rem" }} onClick={() => setShowNew(true)}>
                ابدأ محادثة جديدة
              </button>
            </div>
          )}
          {conversations.map(conv => {
            const st = STATUS_LABEL[conv.status] ?? STATUS_LABEL.open;
            return (
              <button key={conv.id} className={`pchat-conv-item ${activeConv?.id === conv.id ? "active" : ""} ${conv.member_unread > 0 ? "has-unread" : ""}`}
                onClick={() => openConversation(conv)}>
                <div className="pchat-conv-top">
                  <span className="pchat-conv-subject">{conv.subject}</span>
                  <span className="pchat-conv-time">{formatTime(conv.last_message_at)}</span>
                </div>
                <div className="pchat-conv-bottom">
                  <span className="pchat-conv-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                  {conv.member_unread > 0 && <span className="pchat-conv-unread">{conv.member_unread}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── chat window ── */}
      {activeConv ? (
        <div className="pchat-window">
          <div className="pchat-window-head">
            <button className="pchat-back-btn" onClick={() => { setActiveConv(null); clearAttachment(); if (channelRef.current) supabase.removeChannel(channelRef.current); }}>
              ← رجوع
            </button>
            <div className="pchat-window-title">
              <span>{activeConv.subject}</span>
              <span className="pchat-window-status" style={{ color: STATUS_LABEL[activeConv.status]?.color, background: STATUS_LABEL[activeConv.status]?.bg }}>
                {STATUS_LABEL[activeConv.status]?.label}
              </span>
            </div>
          </div>

          <div className="pchat-messages">
            {messages.length === 0 && (
              <div className="pchat-loading">لا توجد رسائل بعد — أرسل رسالتك الأولى</div>
            )}
            {messages.map(msg => {
              const mine = msg.sender_type === "member";
              return (
                <div key={msg.id} className={`pchat-msg ${mine ? "mine" : "theirs"}`}>
                  {!mine && (
                    <div className="pchat-msg-sender">
                      <div className="pchat-admin-avatar">إ</div>
                      <span>فريق الدعم</span>
                      <span className="pchat-msg-time">{formatTime(msg.created_at)}</span>
                    </div>
                  )}
                  {/* attachment first, then text */}
                  {msg.attachment_url && (
                    <Attachment url={msg.attachment_url} name={msg.attachment_name} type={msg.attachment_type} mine={mine} />
                  )}
                  {msg.body && (
                    <div className={`pchat-msg-bubble ${mine ? "mine" : "theirs"}`}>{msg.body}</div>
                  )}
                  {mine && (
                    <span className="pchat-msg-time" style={{ alignSelf: "flex-end" }}>{formatTime(msg.created_at)}</span>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {activeConv.status !== "closed" ? (
            <form className="pchat-input-area" onSubmit={sendMessage}>
              {/* attachment preview */}
              {attachFile && (
                <div className="pchat-attach-preview">
                  {attachPreview ? (
                    <img src={attachPreview} alt="معاينة" className="pchat-preview-img" />
                  ) : (
                    <div className="pchat-preview-file">
                      <span>📎</span>
                      <span className="pchat-preview-filename">{attachFile.name}</span>
                    </div>
                  )}
                  <button type="button" className="pchat-preview-remove" onClick={clearAttachment} title="حذف المرفق">✕</button>
                  {uploadProgress === "uploading" && <span className="pchat-upload-status">جاري الرفع...</span>}
                </div>
              )}
              {attachError && <p className="pchat-attach-error">{attachError}</p>}

              <div className="pchat-input-row">
                {/* file pick button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  style={{ display: "none" }}
                  onChange={pickFile}
                />
                <button
                  type="button"
                  className="pchat-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="إرفاق صورة أو ملف"
                  disabled={sending}
                >
                  📎
                </button>
                <input
                  type="text"
                  placeholder={attachFile ? "أضف تعليقاً (اختياري)..." : "اكتب رسالتك..."}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as unknown as React.FormEvent); } }}
                  disabled={sending}
                />
                <button type="submit" className="pchat-send-btn" disabled={sending || (!newMessage.trim() && !attachFile)}>
                  {sending ? "..." : "إرسال"}
                </button>
              </div>
            </form>
          ) : (
            <div className="pchat-closed-notice">هذه المحادثة مغلقة — تواصل معنا لفتح محادثة جديدة</div>
          )}
        </div>
      ) : (
        <div className="pchat-placeholder">
          <div className="pchat-placeholder-icon">💬</div>
          <p>اختر محادثة أو ابدأ واحدة جديدة</p>
        </div>
      )}

      {/* ── new conversation modal ── */}
      {showNew && (
        <div className="portal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="portal-modal">
            <div className="portal-modal-head">
              <h3>محادثة جديدة</h3>
              <button onClick={() => setShowNew(false)}>✕</button>
            </div>
            <div className="portal-modal-form">
              <div className="portal-field">
                <label>موضوع المحادثة</label>
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="portal-modal-foot">
                <button className="portal-btn-primary" onClick={createConversation}>بدء المحادثة</button>
                <button onClick={() => setShowNew(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
