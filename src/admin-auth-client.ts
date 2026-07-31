// Shared client for the admin-auth Edge Function

export interface AdminSession {
  token: string;
  id: string;
  username: string;
  fullName: string;
  role: "superadmin" | "staff";
  permissions: string[];
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`;

export async function callAdminAuth(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "خطأ في الخادم");
  return data;
}

const SESSION_KEY = "admin_session_v2";

export function saveSession(s: AdminSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function loadSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
