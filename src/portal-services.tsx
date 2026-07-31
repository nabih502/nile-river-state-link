import { useEffect, useState } from "react";
import { supabase } from "./supabase";

interface Member {
  id: string;
  full_name: string;
  member_number: string;
}

interface SocialService {
  id: string;
  title: string;
  lead: string;
  icon: string;
  slug: string;
  bullet_1: string;
  bullet_2: string;
  bullet_3: string;
  action_label: string;
  published: boolean;
}

interface ServiceRequest {
  id: string;
  service_title: string;
  message: string;
  status: "new" | "in_progress" | "completed" | "rejected";
  admin_notes: string;
  created_at: string;
}

const STATUS_MAP = {
  new:         { label: "جديد",           color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "قيد المعالجة",   color: "#92400e", bg: "#fef3c7" },
  completed:   { label: "تم",             color: "#065f46", bg: "#d1fae5" },
  rejected:    { label: "مرفوض",          color: "#991b1b", bg: "#fee2e2" },
};

interface Props {
  member: Member;
}

export default function PortalServices({ member }: Props) {
  const [services, setServices] = useState<SocialService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeService, setActiveService] = useState<SocialService | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from("social_services")
      .select("id,title,lead,icon,slug,bullet_1,bullet_2,bullet_3,action_label,published")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setServices((data ?? []) as SocialService[]));

    supabase
      .from("member_service_requests")
      .select("id,service_title,message,status,admin_notes,created_at")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRequests((data ?? []) as ServiceRequest[]));
  }, [member.id]);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !message.trim() || submitting) return;
    setSubmitting(true);

    await supabase.from("member_service_requests").insert({
      member_id: member.id,
      member_name: member.full_name,
      member_number: member.member_number || "",
      service_id: activeService.id,
      service_title: activeService.title,
      message: message.trim(),
    });

    // Reload requests
    const { data } = await supabase
      .from("member_service_requests")
      .select("id,service_title,message,status,admin_notes,created_at")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false });
    setRequests((data ?? []) as ServiceRequest[]);

    setSubmitting(false);
    setSubmitted(true);
    setMessage("");
    setActiveService(null);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="portal-tab-content">
      {submitted && (
        <div className="portal-success-banner">
          تم إرسال طلبك بنجاح — سيتواصل معك فريق الدعم قريباً
        </div>
      )}

      {/* Services grid */}
      <h3 className="portal-section-title">الخدمات المتاحة</h3>
      {services.length === 0 ? (
        <p className="portal-empty">لا توجد خدمات متاحة حالياً</p>
      ) : (
        <div className="psvc-grid">
          {services.map(svc => (
            <div key={svc.id} className="psvc-card">
              <div className="psvc-icon">{svc.icon || "🤝"}</div>
              <div className="psvc-body">
                <h4>{svc.title}</h4>
                <p>{svc.lead}</p>
                {[svc.bullet_1, svc.bullet_2, svc.bullet_3].filter(Boolean).length > 0 && (
                  <ul>
                    {[svc.bullet_1, svc.bullet_2, svc.bullet_3].filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className="psvc-request-btn"
                onClick={() => { setActiveService(svc); setMessage(""); }}
              >
                {svc.action_label || "طلب الخدمة"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My requests */}
      {requests.length > 0 && (
        <>
          <h3 className="portal-section-title" style={{ marginTop: "2rem" }}>طلباتي ({requests.length})</h3>
          <div className="psvc-requests">
            {requests.map(req => {
              const st = STATUS_MAP[req.status] ?? STATUS_MAP.new;
              return (
                <div key={req.id} className="psvc-req-item">
                  <div className="psvc-req-head">
                    <strong>{req.service_title}</strong>
                    <span className="psvc-req-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                  </div>
                  <p className="psvc-req-msg">{req.message}</p>
                  {req.admin_notes && (
                    <div className="psvc-req-notes">
                      <strong>ملاحظة من الإدارة:</strong> {req.admin_notes}
                    </div>
                  )}
                  <span className="psvc-req-date">
                    {new Date(req.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Request modal */}
      {activeService && (
        <div className="portal-overlay">
          <div className="portal-modal">
            <div className="portal-modal-head">
              <h3>طلب خدمة: {activeService.title}</h3>
              <button onClick={() => setActiveService(null)}>✕</button>
            </div>
            <form onSubmit={submitRequest} className="portal-modal-form">
              <label className="portal-field">
                <span>وصف احتياجك أو طلبك بالتفصيل</span>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="اشرح طلبك هنا..."
                  rows={5}
                  required
                />
              </label>
              <div className="portal-modal-foot">
                <button type="submit" className="portal-btn-primary" disabled={submitting || !message.trim()}>
                  {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
                </button>
                <button type="button" onClick={() => setActiveService(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
