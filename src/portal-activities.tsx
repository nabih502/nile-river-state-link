import { useEffect, useState } from "react";
import { supabase } from "./supabase";

interface Member {
  id: string;
  full_name: string;
  member_number: string;
}

interface EventItem {
  id: string;
  title: string;
  event_date: string;
  location: string;
  excerpt: string;
  image_url: string;
  published: boolean;
}

interface CultureEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description: string;
  tag: string;
  image_url: string;
  published: boolean;
}

interface Registration {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_type: "event" | "culture";
  created_at: string;
}

interface InvestmentInquiry {
  id: string;
  reference_title: string;
  type: string;
  name: string;
  status: string;
  message: string;
  created_at: string;
}

interface InvestmentOpportunity {
  id: string;
  title: string;
  slug: string;
  location: string;
  min_investment: string;
  expected_return: string;
  duration: string;
  published: boolean;
}

const INQ_STATUS = {
  new:           { label: "جديد",             color: "#1d4ed8", bg: "#dbeafe" },
  under_review:  { label: "قيد الدراسة",      color: "#92400e", bg: "#fef3c7" },
  replied:       { label: "تم الرد",          color: "#065f46", bg: "#d1fae5" },
  closed:        { label: "مغلق",             color: "#374151", bg: "#f3f4f6" },
};

interface Props {
  member: Member;
}

export default function PortalActivities({ member }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cultureEvents, setCultureEvents] = useState<CultureEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [inquiries, setInquiries] = useState<InvestmentInquiry[]>([]);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [showInqForm, setShowInqForm] = useState(false);
  const [inqOpp, setInqOpp] = useState<InvestmentOpportunity | null>(null);
  const [inqMessage, setInqMessage] = useState("");
  const [sendingInq, setSendingInq] = useState(false);
  const [inqSent, setInqSent] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "investment">("events");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase.from("events").select("id,title,event_date,location,excerpt,image_url,published").eq("published", true).gte("event_date", today).order("event_date").limit(12),
      supabase.from("culture_events").select("id,title,event_date,location,description,tag,image_url,published").eq("published", true).gte("event_date", today).order("event_date").limit(8),
      supabase.from("member_event_registrations").select("id,event_id,event_title,event_date,event_type,created_at").eq("member_id", member.id).order("created_at", { ascending: false }),
      supabase.from("investment_inquiries").select("id,reference_title,type,name,status,message,created_at").eq("email", member.id).order("created_at", { ascending: false }),
      supabase.from("investment_opportunities").select("id,title,slug,location,min_investment,expected_return,duration,published").eq("published", true).limit(8),
    ]).then(([ev, ce, reg, inq, opp]) => {
      setEvents((ev.data ?? []) as EventItem[]);
      setCultureEvents((ce.data ?? []) as CultureEvent[]);
      const regs = (reg.data ?? []) as Registration[];
      setRegistrations(regs);
      setRegisteredIds(new Set(regs.map(r => r.event_id)));
      setInquiries((inq.data ?? []) as InvestmentInquiry[]);
      setOpportunities((opp.data ?? []) as InvestmentOpportunity[]);
    });
  }, [member.id]);

  const register = async (event: EventItem | CultureEvent, type: "event" | "culture") => {
    if (registering || registeredIds.has(event.id)) return;
    setRegistering(event.id);

    const date = (event as EventItem).event_date || "";
    await supabase.from("member_event_registrations").insert({
      member_id: member.id,
      event_id: event.id,
      event_type: type,
      event_title: event.title,
      event_date: date,
    });

    setRegisteredIds(prev => new Set([...prev, event.id]));
    setRegistrations(prev => [{
      id: crypto.randomUUID(),
      event_id: event.id,
      event_title: event.title,
      event_date: date,
      event_type: type,
      created_at: new Date().toISOString(),
    }, ...prev]);
    setRegistering(null);
  };

  const unregister = async (eventId: string) => {
    await supabase.from("member_event_registrations").delete()
      .eq("member_id", member.id).eq("event_id", eventId);
    setRegisteredIds(prev => { const s = new Set(prev); s.delete(eventId); return s; });
    setRegistrations(prev => prev.filter(r => r.event_id !== eventId));
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqOpp || !inqMessage.trim() || sendingInq) return;
    setSendingInq(true);

    await supabase.from("investment_inquiries").insert({
      type: "opportunity",
      reference_slug: inqOpp.slug,
      reference_title: inqOpp.title,
      name: member.full_name,
      email: member.id,
      phone: "",
      message: inqMessage.trim(),
    });

    // Reload inquiries
    const { data } = await supabase.from("investment_inquiries")
      .select("id,reference_title,type,name,status,message,created_at")
      .eq("email", member.id).order("created_at", { ascending: false });
    setInquiries((data ?? []) as InvestmentInquiry[]);

    setSendingInq(false);
    setInqSent(true);
    setInqMessage("");
    setShowInqForm(false);
    setTimeout(() => setInqSent(false), 4000);
  };

  const allEvents = [
    ...events.map(e => ({ ...e, _type: "event" as const })),
    ...cultureEvents.map(e => ({ ...e, _type: "culture" as const })),
  ].sort((a, b) => (a.event_date || "").localeCompare(b.event_date || ""));

  return (
    <div className="portal-tab-content">
      <div className="pact-tabs">
        <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>
          الفعاليات والأنشطة
        </button>
        <button className={activeTab === "investment" ? "active" : ""} onClick={() => setActiveTab("investment")}>
          الاستثمار
        </button>
      </div>

      {activeTab === "events" && (
        <>
          {inqSent && <div className="portal-success-banner">تم إرسال الاستفسار بنجاح</div>}

          <h3 className="portal-section-title">الفعاليات القادمة</h3>
          {allEvents.length === 0 ? (
            <p className="portal-empty">لا توجد فعاليات قادمة حالياً</p>
          ) : (
            <div className="pact-events-grid">
              {allEvents.map(ev => {
                const isReg = registeredIds.has(ev.id);
                return (
                  <div key={ev.id} className={`pact-event-card ${isReg ? "registered" : ""}`}>
                    {ev.image_url && <img src={ev.image_url} alt={ev.title} className="pact-event-img" />}
                    <div className="pact-event-body">
                      {ev._type === "culture" && (ev as CultureEvent).tag && (
                        <span className="pact-event-tag">{(ev as CultureEvent).tag}</span>
                      )}
                      <h4>{ev.title}</h4>
                      {ev.event_date && (
                        <p className="pact-event-date">
                          📅 {new Date(ev.event_date).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                      {ev.location && <p className="pact-event-loc">📍 {ev.location}</p>}
                      {isReg ? (
                        <button className="pact-unreg-btn" onClick={() => unregister(ev.id)}>إلغاء التسجيل</button>
                      ) : (
                        <button
                          className="pact-reg-btn"
                          onClick={() => register(ev, ev._type)}
                          disabled={registering === ev.id}
                        >
                          {registering === ev.id ? "جاري التسجيل..." : "تسجيل الحضور"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {registrations.length > 0 && (
            <>
              <h3 className="portal-section-title" style={{ marginTop: "2rem" }}>فعالياتي المسجلة ({registrations.length})</h3>
              <div className="pact-reg-list">
                {registrations.map(reg => (
                  <div key={reg.id} className="pact-reg-item">
                    <div>
                      <strong>{reg.event_title}</strong>
                      {reg.event_date && <span className="pact-reg-date">{new Date(reg.event_date).toLocaleDateString("ar-SA")}</span>}
                    </div>
                    <button className="pact-unreg-btn-sm" onClick={() => unregister(reg.event_id)}>إلغاء</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "investment" && (
        <>
          {inqSent && <div className="portal-success-banner">تم إرسال الاستفسار بنجاح</div>}

          <h3 className="portal-section-title">فرص الاستثمار</h3>
          {opportunities.length === 0 ? (
            <p className="portal-empty">لا توجد فرص استثمارية منشورة حالياً</p>
          ) : (
            <div className="pact-opp-grid">
              {opportunities.map(opp => (
                <div key={opp.id} className="pact-opp-card">
                  <h4>{opp.title}</h4>
                  <div className="pact-opp-meta">
                    {opp.location && <span>📍 {opp.location}</span>}
                    {opp.min_investment && <span>💰 {opp.min_investment}</span>}
                    {opp.expected_return && <span>📈 {opp.expected_return}</span>}
                    {opp.duration && <span>⏱ {opp.duration}</span>}
                  </div>
                  <button className="psvc-request-btn" onClick={() => { setInqOpp(opp); setShowInqForm(true); }}>
                    إرسال استفسار
                  </button>
                </div>
              ))}
            </div>
          )}

          {inquiries.length > 0 && (
            <>
              <h3 className="portal-section-title" style={{ marginTop: "2rem" }}>استفساراتي ({inquiries.length})</h3>
              <div className="psvc-requests">
                {inquiries.map(inq => {
                  const st = INQ_STATUS[inq.status as keyof typeof INQ_STATUS] ?? INQ_STATUS.new;
                  return (
                    <div key={inq.id} className="psvc-req-item">
                      <div className="psvc-req-head">
                        <strong>{inq.reference_title}</strong>
                        <span className="psvc-req-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                      </div>
                      <p className="psvc-req-msg">{inq.message}</p>
                      <span className="psvc-req-date">
                        {new Date(inq.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Investment inquiry modal */}
      {showInqForm && inqOpp && (
        <div className="portal-overlay">
          <div className="portal-modal">
            <div className="portal-modal-head">
              <h3>استفسار: {inqOpp.title}</h3>
              <button onClick={() => setShowInqForm(false)}>✕</button>
            </div>
            <form onSubmit={submitInquiry} className="portal-modal-form">
              <label className="portal-field">
                <span>رسالتك أو استفسارك</span>
                <textarea
                  value={inqMessage}
                  onChange={e => setInqMessage(e.target.value)}
                  placeholder="اكتب استفسارك أو تفاصيل اهتمامك..."
                  rows={5}
                  required
                />
              </label>
              <div className="portal-modal-foot">
                <button type="submit" className="portal-btn-primary" disabled={sendingInq || !inqMessage.trim()}>
                  {sendingInq ? "جاري الإرسال..." : "إرسال الاستفسار"}
                </button>
                <button type="button" onClick={() => setShowInqForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
