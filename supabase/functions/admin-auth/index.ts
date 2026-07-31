import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ok = (data: unknown) =>
  new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

const err = (msg: string, status = 400) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { action } = body;

    // ── LOGIN ────────────────────────────────────────────────────────────────
    if (action === "login") {
      const { username, password } = body;
      if (!username || !password) return err("بيانات ناقصة");

      // Fetch user by username
      const { data: user, error: uErr } = await supa
        .from("admin_users")
        .select("id, username, full_name, role, permissions, password_hash, is_active")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();

      if (uErr || !user) return err("اسم المستخدم أو كلمة المرور غير صحيحة", 401);
      if (!user.is_active) return err("هذا الحساب موقوف، يرجى التواصل مع المدير", 403);

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return err("اسم المستخدم أو كلمة المرور غير صحيحة", 401);

      // Create session token
      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

      await supa.from("admin_sessions").insert({ user_id: user.id, token, expires_at: expiresAt });
      await supa.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

      return ok({
        token,
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        permissions: user.permissions,
      });
    }

    // ── VERIFY SESSION ───────────────────────────────────────────────────────
    if (action === "verify-session") {
      const { token } = body;
      if (!token) return err("رمز الجلسة مفقود", 401);

      const { data: session } = await supa
        .from("admin_sessions")
        .select("user_id, expires_at")
        .eq("token", token)
        .maybeSingle();

      if (!session) return err("جلسة غير صالحة", 401);
      if (new Date(session.expires_at) < new Date()) {
        await supa.from("admin_sessions").delete().eq("token", token);
        return err("انتهت صلاحية الجلسة", 401);
      }

      const { data: user } = await supa
        .from("admin_users")
        .select("id, username, full_name, role, permissions, is_active")
        .eq("id", session.user_id)
        .maybeSingle();

      if (!user || !user.is_active) return err("الحساب غير نشط", 403);

      return ok({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        permissions: user.permissions,
      });
    }

    // ── LOGOUT ───────────────────────────────────────────────────────────────
    if (action === "logout") {
      const { token } = body;
      if (token) await supa.from("admin_sessions").delete().eq("token", token);
      return ok({ ok: true });
    }

    // ── All actions below require a valid superadmin session ─────────────────
    const { token } = body;
    if (!token) return err("غير مصرح", 401);

    const { data: sess } = await supa
      .from("admin_sessions")
      .select("user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!sess || new Date(sess.expires_at) < new Date()) return err("جلسة منتهية أو غير صالحة", 401);

    const { data: caller } = await supa
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", sess.user_id)
      .maybeSingle();

    if (!caller || !caller.is_active) return err("الحساب غير نشط", 403);
    const isSuperAdmin = caller.role === "superadmin";

    // ── LIST STAFF ───────────────────────────────────────────────────────────
    if (action === "list-staff") {
      if (!isSuperAdmin) return err("غير مصرح", 403);
      const { data: staff } = await supa
        .from("admin_users")
        .select("id, username, full_name, role, permissions, is_active, last_login_at, created_at")
        .order("created_at", { ascending: true });
      return ok(staff ?? []);
    }

    // ── CREATE STAFF ─────────────────────────────────────────────────────────
    if (action === "create-staff") {
      if (!isSuperAdmin) return err("غير مصرح", 403);
      const { username, fullName, password, role, permissions } = body;
      if (!username || !fullName || !password) return err("بيانات ناقصة");
      if (password.length < 6) return err("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

      const hash = await bcrypt.hash(password, 10);
      const { data: created, error: cErr } = await supa
        .from("admin_users")
        .insert({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim(),
          role: role || "staff",
          permissions: permissions || [],
          password_hash: hash,
        })
        .select("id, username, full_name, role, permissions, is_active, created_at")
        .single();

      if (cErr) {
        if (cErr.code === "23505") return err("اسم المستخدم موجود مسبقاً");
        return err(cErr.message);
      }
      return ok(created);
    }

    // ── UPDATE STAFF ─────────────────────────────────────────────────────────
    if (action === "update-staff") {
      if (!isSuperAdmin) return err("غير مصرح", 403);
      const { id, fullName, role, permissions, isActive } = body;
      if (!id) return err("معرف المستخدم مفقود");

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (fullName !== undefined) updates.full_name = fullName.trim();
      if (role !== undefined) updates.role = role;
      if (permissions !== undefined) updates.permissions = permissions;
      if (isActive !== undefined) updates.is_active = isActive;

      const { error: uErr } = await supa.from("admin_users").update(updates).eq("id", id);
      if (uErr) return err(uErr.message);
      return ok({ ok: true });
    }

    // ── CHANGE PASSWORD ──────────────────────────────────────────────────────
    if (action === "change-password") {
      const { id, newPassword } = body;
      if (!id || !newPassword) return err("بيانات ناقصة");
      if (newPassword.length < 6) return err("كلمة المرور يجب أن تكون 6 أحرف على الأقل");

      // Superadmin can change anyone's password; staff can only change their own
      if (!isSuperAdmin && caller.id !== id) return err("غير مصرح", 403);

      const hash = await bcrypt.hash(newPassword, 10);
      const { error: pErr } = await supa
        .from("admin_users")
        .update({ password_hash: hash, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (pErr) return err(pErr.message);
      return ok({ ok: true });
    }

    // ── DELETE STAFF ─────────────────────────────────────────────────────────
    if (action === "delete-staff") {
      if (!isSuperAdmin) return err("غير مصرح", 403);
      const { id } = body;
      if (!id) return err("معرف المستخدم مفقود");
      if (id === caller.id) return err("لا يمكنك حذف حسابك الخاص");

      await supa.from("admin_sessions").delete().eq("user_id", id);
      await supa.from("admin_users").delete().eq("id", id);
      return ok({ ok: true });
    }

    return err("إجراء غير معروف");
  } catch (e) {
    console.error(e);
    return err("خطأ في الخادم", 500);
  }
});
