import { useEffect, useRef, useState } from "react";
import { supabase, visitorToken } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisitorConv {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  status: "bot" | "waiting" | "human" | "closed";
  visitor_unread: number;
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
  keywords: string;
  answer: string;
  is_default: boolean;
  published: boolean;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_CONV  = "vchat_conv_id";
const STORAGE_NAME  = "vchat_name";
const STORAGE_PHONE = "vchat_phone";

// ─── Bot engine ───────────────────────────────────────────────────────────────
function matchFaq(text: string, faqs: BotFaq[]): string | null {
  const lower = text.toLowerCase();
  const active = faqs.filter(f => f.published && !f.is_default);
  for (const faq of active) {
    const kws = faq.keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (kws.some(kw => lower.includes(kw.toLowerCase()))) return faq.answer;
  }
  return null;
}

function getDefault(faqs: BotFaq[]): string {
  const def = faqs.find(f => f.is_default && f.published);
  return def?.answer ?? "شكراً لتواصلك معنا! يمكنك التحدث مع أحد موظفي الدعم للمساعدة.";
}

function formatTime(d: string) {
  const date = new Date(d);
  const diff  = Date.now() - date.getTime();
  if (diff < 60000)    return "الآن";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} د`;
  return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

// ─── Main widget ──────────────────────────────────────────────────────────────
export default function SiteChatWidget() {
  const [open, setOpen]         = useState(false);
  const [screen, setScreen]     = useState<"welcome" | "chat">("welcome");

  // welcome form
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [nameErr, setNameErr]   = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [starting, setStarting] = useState(false);

  // chat
  const [conv, setConv]         = useState<VisitorConv | null>(null);
  const [messages, setMessages] = useState<VisitorMsg[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [faqs, setFaqs]         = useState<BotFaq[]>([]);
  const [unread, setUnread]     = useState(0);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const channelRef  = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const pollRef     = useRef<number | null>(null);

  // ── load FAQs once ─────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from("chatbot_faqs").select("*").eq("published", true).then(({ data }) => {
      setFaqs((data ?? []) as BotFaq[]);
    });
  }, []);

  // ── restore session ────────────────────────────────────────────────────────
  useEffect(() => {
    const convId  = localStorage.getItem(STORAGE_CONV);
    const savName = localStorage.getItem(STORAGE_NAME);
    const savPhone = localStorage.getItem(STORAGE_PHONE);
    if (!convId) return;

    supabase.from("visitor_conversations").select("*").eq("id", convId).maybeSingle()
      .then(({ data }) => {
        if (!data) { localStorage.removeItem(STORAGE_CONV); return; }
        setConv(data as VisitorConv);
        setName(savName ?? "");
        setPhone(savPhone ?? "");
        setScreen("chat");
        loadMessages(convId);
        subscribeRealtime(convId);
        setUnread(data.visitor_unread ?? 0);
      });
  }, []);

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("visitor_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as VisitorMsg[]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const subscribeRealtime = (convId: string) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    // Live updates arrive over a socket that cannot carry the visitor token, so the
    // transcript is also refreshed on a short timer as a fallback.
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => { void loadMessages(convId); }, 8000);
    const ch = supabase.channel(`vchat-${convId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "visitor_messages",
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        const msg = payload.new as VisitorMsg;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        if (msg.sender_type !== "visitor") {
          setUnread(n => n + 1);
          supabase.from("visitor_conversations").update({ visitor_unread: 0 }).eq("id", convId);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "visitor_conversations",
        filter: `id=eq.${convId}`,
      }, (payload) => {
        setConv(prev => prev ? { ...prev, ...payload.new } as VisitorConv : prev);
      })
      .subscribe();
    channelRef.current = ch;
  };

  useEffect(() => () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (pollRef.current) window.clearInterval(pollRef.current);
  }, []);

  // ── open/close ─────────────────────────────────────────────────────────────
  const openWidget = () => {
    setOpen(true);
    setUnread(0);
    if (conv) {
      supabase.from("visitor_conversations").update({ visitor_unread: 0 }).eq("id", conv.id);
    }
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }, 120);
  };

  // ── start conversation ─────────────────────────────────────────────────────
  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!name.trim()) { setNameErr("الاسم مطلوب"); valid = false; } else setNameErr("");
    if (!phone.trim()) { setPhoneErr("رقم الهاتف مطلوب"); valid = false; }
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(phone.trim())) { setPhoneErr("رقم غير صحيح"); valid = false; }
    else setPhoneErr("");
    if (!valid) return;

    setStarting(true);

    const { data: convData, error } = await supabase
      .from("visitor_conversations")
      .insert({ visitor_name: name.trim(), visitor_phone: phone.trim(), status: "bot", visitor_token: visitorToken() })
      .select()
      .maybeSingle();

    if (error || !convData) { setStarting(false); return; }

    localStorage.setItem(STORAGE_CONV, convData.id);
    localStorage.setItem(STORAGE_NAME, name.trim());
    localStorage.setItem(STORAGE_PHONE, phone.trim());

    setConv(convData as VisitorConv);
    setScreen("chat");
    subscribeRealtime(convData.id);

    // send welcome message from bot
    const welcome = `مرحباً ${name.trim()}! أنا المساعد الذكي لرابطة ولاية نهر النيل. كيف يمكنني مساعدتك اليوم؟`;
    await supabase.from("visitor_messages").insert({
      conversation_id: convData.id,
      sender_type: "bot",
      sender_name: "المساعد الذكي",
      body: welcome,
    });

    await loadMessages(convData.id);
    setStarting(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── send message ───────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conv || sending || conv.status === "closed") return;

    setSending(true);
    setInput("");

    // insert visitor message
    await supabase.from("visitor_messages").insert({
      conversation_id: conv.id,
      sender_type: "visitor",
      sender_name: name,
      body: text,
    });

    await supabase.from("visitor_conversations").update({
      last_message_at: new Date().toISOString(),
      admin_unread: (conv as unknown as { admin_unread: number }).admin_unread + 1,
    }).eq("id", conv.id);

    setSending(false);

    // bot responds only in bot mode
    if (conv.status === "bot") {
      setBotTyping(true);
      setTimeout(async () => {
        setBotTyping(false);
        const answer = matchFaq(text, faqs);
        const botBody = answer ?? getDefault(faqs);
        const hasAnswer = !!answer;

        await supabase.from("visitor_messages").insert({
          conversation_id: conv.id,
          sender_type: "bot",
          sender_name: "المساعد الذكي",
          body: botBody,
        });

        if (!hasAnswer) {
          // also insert a "transfer" suggestion message
          await supabase.from("visitor_messages").insert({
            conversation_id: conv.id,
            sender_type: "bot",
            sender_name: "المساعد الذكي",
            body: "__TRANSFER_PROMPT__",
          });
        }
      }, 900 + Math.random() * 600);
    }
  };

  // ── request human ──────────────────────────────────────────────────────────
  const requestHuman = async () => {
    if (!conv) return;
    await supabase.from("visitor_conversations").update({ status: "waiting" }).eq("id", conv.id);
    setConv(c => c ? { ...c, status: "waiting" } : c);
    await supabase.from("visitor_messages").insert({
      conversation_id: conv.id,
      sender_type: "bot",
      sender_name: "المساعد الذكي",
      body: "تم تحويل محادثتك إلى فريق الدعم البشري. سيرد عليك أحد موظفينا في أقرب وقت ممكن. شكراً لصبرك.",
    });
    await supabase.from("visitor_conversations").update({
      admin_unread: (conv as unknown as { admin_unread: number }).admin_unread + 1,
    }).eq("id", conv.id);
  };

  // ── status badge ───────────────────────────────────────────────────────────
  const statusInfo = () => {
    if (!conv) return { label: "", dot: "#94a3b8" };
    switch (conv.status) {
      case "bot":     return { label: "مساعد ذكي",    dot: "#2563eb" };
      case "waiting": return { label: "في انتظار الدعم", dot: "#f59e0b" };
      case "human":   return { label: "دعم بشري",     dot: "#16a34a" };
      case "closed":  return { label: "محادثة مغلقة", dot: "#94a3b8" };
    }
  };

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="vchat-root" dir="rtl">
      {/* floating button */}
      <button
        className={`vchat-fab ${open ? "open" : ""}`}
        onClick={() => open ? setOpen(false) : openWidget()}
        aria-label="فتح الدردشة"
      >
        {open
          ? <span className="vchat-fab-close">✕</span>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {!open && unread > 0 && (
          <span className="vchat-fab-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* chat window */}
      {open && (
        <div className="vchat-window">
          {/* header */}
          <div className="vchat-header">
            <div className="vchat-header-avatar">
              <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="logo" />
            </div>
            <div className="vchat-header-info">
              <span className="vchat-header-title">رابطة ولاية نهر النيل</span>
              {conv && (
                <span className="vchat-header-status">
                  <span className="vchat-status-dot" style={{ background: statusInfo().dot }} />
                  {statusInfo().label}
                </span>
              )}
              {!conv && <span className="vchat-header-status">خدمة العملاء</span>}
            </div>
            <button className="vchat-header-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* ── welcome screen ── */}
          {screen === "welcome" && (
            <div className="vchat-welcome">
              <div className="vchat-welcome-hero">
                <div className="vchat-welcome-icon">💬</div>
                <h3>مرحباً بك!</h3>
                <p>أدخل بياناتك لبدء المحادثة مع مساعدنا الذكي</p>
              </div>
              <form className="vchat-welcome-form" onSubmit={startChat} noValidate>
                <div className="vchat-field">
                  <label>الاسم</label>
                  <input
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={name}
                    onChange={e => { setName(e.target.value); setNameErr(""); }}
                    disabled={starting}
                  />
                  {nameErr && <span className="vchat-field-err">{nameErr}</span>}
                </div>
                <div className="vchat-field">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="مثال: 249912345678+"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPhoneErr(""); }}
                    disabled={starting}
                    dir="ltr"
                  />
                  {phoneErr && <span className="vchat-field-err">{phoneErr}</span>}
                </div>
                <button type="submit" className="vchat-start-btn" disabled={starting}>
                  {starting ? "جاري البدء..." : "ابدأ المحادثة"}
                </button>
              </form>
            </div>
          )}

          {/* ── chat screen ── */}
          {screen === "chat" && (
            <>
              <div className="vchat-messages">
                {messages.map(msg => {
                  if (msg.body === "__TRANSFER_PROMPT__") {
                    return (
                      <div key={msg.id} className="vchat-transfer-prompt">
                        <p>هل تريد التحدث مع موظف دعم بشري؟</p>
                        {conv?.status === "bot" && (
                          <button className="vchat-transfer-btn" onClick={requestHuman}>
                            تحدث مع موظف الدعم
                          </button>
                        )}
                      </div>
                    );
                  }
                  const isVisitor = msg.sender_type === "visitor";
                  const isBot     = msg.sender_type === "bot";
                  return (
                    <div key={msg.id} className={`vchat-msg ${isVisitor ? "visitor" : "agent"}`}>
                      {!isVisitor && (
                        <div className="vchat-msg-avatar">
                          {isBot ? "🤖" : "👤"}
                        </div>
                      )}
                      <div className="vchat-msg-wrap">
                        {!isVisitor && (
                          <span className="vchat-msg-sender">
                            {isBot ? "المساعد الذكي" : "فريق الدعم"}
                          </span>
                        )}
                        <div className={`vchat-msg-bubble ${isVisitor ? "visitor" : isBot ? "bot" : "admin"}`}>
                          {msg.body.split("\n").map((line, i) => (
                            <span key={i}>{line}{i < msg.body.split("\n").length - 1 && <br />}</span>
                          ))}
                        </div>
                        <span className="vchat-msg-time">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })}

                {botTyping && (
                  <div className="vchat-msg agent">
                    <div className="vchat-msg-avatar">🤖</div>
                    <div className="vchat-msg-wrap">
                      <span className="vchat-msg-sender">المساعد الذكي</span>
                      <div className="vchat-typing-indicator">
                        <span /><span /><span />
                      </div>
                    </div>
                  </div>
                )}

                {conv?.status === "waiting" && (
                  <div className="vchat-waiting-notice">
                    <span>⏳</span> في انتظار موظف الدعم...
                  </div>
                )}

                {conv?.status === "human" && messages.filter(m => m.sender_type === "admin").length === 0 && (
                  <div className="vchat-waiting-notice" style={{ background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }}>
                    <span>✅</span> موظف الدعم جاهز للرد
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* input */}
              {conv?.status !== "closed" ? (
                <form className="vchat-input-row" onSubmit={sendMessage}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={conv?.status === "waiting" ? "في انتظار موظف الدعم..." : "اكتب رسالتك..."}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={sending || conv?.status === "waiting"}
                  />
                  <button
                    type="submit"
                    className="vchat-send-btn"
                    disabled={sending || !input.trim() || conv?.status === "waiting"}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </form>
              ) : (
                <div className="vchat-closed-notice">هذه المحادثة مغلقة</div>
              )}

              {/* request human link — only in bot mode */}
              {conv?.status === "bot" && (
                <div className="vchat-human-link">
                  <button onClick={requestHuman}>تحدث مع موظف دعم بشري</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
