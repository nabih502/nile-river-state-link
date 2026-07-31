import { useEffect, useState } from "react";
import { callAdminAuth, type AdminSession } from "./admin-auth-client";

interface StaffUser {
  id: string;
  username: string;
  full_name: string;
  role: "superadmin" | "staff";
  permissions: string[];
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const ALL_PERMISSIONS: { key: string; label: string }[] = [
  { key: "news",       label: "الأخبار" },
  { key: "events",     label: "الفعاليات" },
  { key: "members",    label: "الأعضاء" },
  { key: "messages",   label: "الرسائل" },
  { key: "investment", label: "الاستثمار" },
  { key: "culture",    label: "الثقافة" },
  { key: "social",     label: "الخدمات الاجتماعية" },
  { key: "contact",    label: "تواصل معنا" },
  { key: "settings",   label: "الإعدادات" },
];

function formatDate(d: string | null) {
  if (!d) return "لم يسجل دخولاً بعد";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface StaffFormProps {
  session: AdminSession;
  user: StaffUser | null;
  onSave: () => void;
  onCancel: () => void;
}

function StaffForm({ session, user, onSave, onCancel }: StaffFormProps) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [role, setRole] = useState<"superadmin" | "staff">(user?.role ?? "staff");
  const [permissions, setPermissions] = useState<string[]>(user?.permissions ?? []);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const togglePerm = (key: string) =>
    setPermissions(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

  const selectAll = () => setPermissions(ALL_PERMISSIONS.map(p => p.key));
  const clearAll  = () => setPermissions([]);

  const handleRoleChange = (r: "superadmin" | "staff") => {
    setRole(r);
    if (r === "superadmin") setPermissions(ALL_PERMISSIONS.map(p => p.key));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("الاسم مطلوب"); return; }
    if (!user && !username.trim()) { setError("اسم المستخدم مطلوب"); return; }
    if (!user && !password) { setError("كلمة المرور مطلوبة للحساب الجديد"); return; }
    if (password && password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }

    setSaving(true);
    try {
      if (user) {
        // Update existing
        await callAdminAuth({ action: "update-staff", token: session.token, id: user.id, fullName, role, permissions });
        if (password) {
          await callAdminAuth({ action: "change-password", token: session.token, id: user.id, newPassword: password });
        }
      } else {
        // Create new
        await callAdminAuth({ action: "create-staff", token: session.token, username, fullName, password, role, permissions });
      }
      onSave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-overlay">
      <div className="adm-modal" style={{ maxWidth: 560 }}>
        <div className="adm-modal-head">
          <h2>{user ? "تعديل الموظف" : "إضافة موظف جديد"}</h2>
          <button className="adm-modal-close" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={save} className="adm-staff-form">
          {/* Username — only for new users */}
          {!user && (
            <label className="adm-field">
              <span>اسم المستخدم <em>(للدخول)</em></span>
              <input
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, ""))}
                placeholder="مثال: ahmed.ali"
                dir="ltr"
                autoFocus
              />
            </label>
          )}

          <label className="adm-field">
            <span>الاسم الكامل</span>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="الاسم الذي يظهر في لوحة التحكم" />
          </label>

          <label className="adm-field">
            <span>كلمة المرور {user && <em>(اتركها فارغة إن لم تريد تغييرها)</em>}</span>
            <div className="adm-pw-wrap">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={user ? "••••••••" : "6 أحرف على الأقل"}
                dir="ltr"
              />
              <button type="button" className="adm-pw-toggle" onClick={() => setShowPw(s => !s)}>
                {showPw ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </label>

          <div className="adm-field">
            <span>الدور</span>
            <div className="adm-role-btns">
              <button
                type="button"
                className={`adm-role-btn ${role === "staff" ? "active" : ""}`}
                onClick={() => handleRoleChange("staff")}
              >
                موظف
                <small>صلاحيات محددة</small>
              </button>
              <button
                type="button"
                className={`adm-role-btn ${role === "superadmin" ? "active" : ""}`}
                onClick={() => handleRoleChange("superadmin")}
              >
                مدير عام
                <small>كل الصلاحيات</small>
              </button>
            </div>
          </div>

          {role === "staff" && (
            <div className="adm-field">
              <div className="adm-perms-head">
                <span>الأقسام المسموح بها</span>
                <div>
                  <button type="button" className="adm-perms-all" onClick={selectAll}>تحديد الكل</button>
                  <button type="button" className="adm-perms-all" onClick={clearAll}>إلغاء الكل</button>
                </div>
              </div>
              <div className="adm-perms-grid">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p.key} className={`adm-perm-check ${permissions.includes(p.key) ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(p.key)}
                      onChange={() => togglePerm(p.key)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="adm-form-error">{error}</p>}

          <div className="adm-modal-foot">
            <button type="submit" className="adm-btn-primary" disabled={saving}>
              {saving ? "جاري الحفظ..." : user ? "حفظ التعديلات" : "إنشاء الحساب"}
            </button>
            <button type="button" onClick={onCancel}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Props {
  session: AdminSession;
}

export default function AdminStaffPanel({ session }: Props) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StaffUser | null | undefined>(undefined);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await callAdminAuth({ action: "list-staff", token: session.token });
      setStaff(data as StaffUser[]);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user: StaffUser) => {
    if (user.id === session.id) return;
    try {
      await callAdminAuth({ action: "update-staff", token: session.token, id: user.id, isActive: !user.is_active });
      load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  const deleteUser = async () => {
    if (!confirmId) return;
    try {
      await callAdminAuth({ action: "delete-staff", token: session.token, id: confirmId });
      setConfirmId(null);
      load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <h2>إدارة الموظفين ({staff.length})</h2>
        <button className="adm-btn-primary" onClick={() => setEditing(null)}>+ إضافة موظف</button>
      </div>

      {actionError && (
        <div className="adm-banner-err">
          {actionError}
          <button onClick={() => setActionError("")}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="adm-loading">جاري التحميل...</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>اليوزر نيم</th>
                <th>الدور</th>
                <th>الصلاحيات</th>
                <th>آخر دخول</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(u => (
                <tr key={u.id} className={!u.is_active ? "adm-row-inactive" : ""}>
                  <td>
                    <div className="adm-staff-name">
                      <div className="adm-staff-avatar">{u.full_name.charAt(0)}</div>
                      <span>{u.full_name}</span>
                    </div>
                  </td>
                  <td dir="ltr" style={{ fontFamily: "monospace", color: "#555" }}>{u.username}</td>
                  <td>
                    <span className={`adm-role-badge ${u.role}`}>
                      {u.role === "superadmin" ? "مدير عام" : "موظف"}
                    </span>
                  </td>
                  <td>
                    {u.role === "superadmin" ? (
                      <span className="adm-perms-all-label">كل الأقسام</span>
                    ) : u.permissions.length === 0 ? (
                      <span style={{ color: "#999", fontSize: 12 }}>لا صلاحيات</span>
                    ) : (
                      <div className="adm-perms-tags">
                        {u.permissions.slice(0, 3).map(p => (
                          <span key={p} className="adm-perm-tag">
                            {ALL_PERMISSIONS.find(x => x.key === p)?.label ?? p}
                          </span>
                        ))}
                        {u.permissions.length > 3 && (
                          <span className="adm-perm-tag adm-perm-more">+{u.permissions.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "#666" }}>{formatDate(u.last_login_at)}</td>
                  <td>
                    {u.id === session.id ? (
                      <span className="adm-status published">حسابك</span>
                    ) : (
                      <button
                        className={`adm-status-toggle ${u.is_active ? "active" : "inactive"}`}
                        onClick={() => toggleActive(u)}
                        title={u.is_active ? "إيقاف الحساب" : "تفعيل الحساب"}
                      >
                        {u.is_active ? "نشط" : "موقوف"}
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="adm-btn-edit" onClick={() => setEditing(u)}>تعديل</button>
                    {u.id !== session.id && (
                      <button className="adm-btn-danger" onClick={() => setConfirmId(u.id)}>حذف</button>
                    )}
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">لا يوجد موظفون</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <StaffForm
          session={session}
          user={editing}
          onSave={() => { setEditing(undefined); load(); }}
          onCancel={() => setEditing(undefined)}
        />
      )}

      {confirmId && (
        <div className="adm-overlay">
          <div className="adm-confirm">
            <p>هل أنت متأكد من حذف هذا الموظف؟ سيتم إنهاء جلساته الحالية.</p>
            <div>
              <button className="adm-btn-danger" onClick={deleteUser}>تأكيد الحذف</button>
              <button onClick={() => setConfirmId(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
