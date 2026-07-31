/*
# Admin Users & Sessions — إدارة مستخدمي لوحة التحكم

## Summary
Creates a proper admin authentication system to replace the hardcoded password.

## New Tables

### admin_users
- id (uuid PK)
- username (text, unique) — login identifier
- full_name (text) — display name
- role (text) — 'superadmin' or 'staff'
- permissions (text[]) — list of allowed section keys
- password_hash (text) — bcrypt hash via pgcrypto
- is_active (boolean) — can be disabled without deletion
- last_login_at (timestamptz) — for audit
- created_at, updated_at

### admin_sessions
- id (uuid PK)
- user_id (uuid FK → admin_users)
- token (text, unique) — random session token
- expires_at (timestamptz) — 8-hour sessions
- created_at

## Security
- RLS enabled on both tables, no direct anon access
- Authenticated service-role only (via Edge Function)
- verify_admin_password() — SECURITY DEFINER function for safe password check
- Default superadmin 'admin' seeded with bcrypt-hashed 'admin2024'

## Notes
1. pgcrypto extension enabled for bcrypt hashing
2. Only the Edge Function (using service_role key) can read/write these tables
3. Client stores a session token in sessionStorage, not the password
*/

-- Enable pgcrypto for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── admin_users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('superadmin', 'staff')),
  permissions   TEXT[] NOT NULL DEFAULT '{}',
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- No direct client access — only the Edge Function (service_role) can access this table
DROP POLICY IF EXISTS "service_role_all_admin_users" ON admin_users;
CREATE POLICY "service_role_all_admin_users" ON admin_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── admin_sessions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '8 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_admin_sessions" ON admin_sessions;
CREATE POLICY "service_role_all_admin_sessions" ON admin_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Password verify function ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION verify_admin_password(p_username TEXT, p_password TEXT)
RETURNS TABLE(
  id            UUID,
  username      TEXT,
  full_name     TEXT,
  role          TEXT,
  permissions   TEXT[],
  is_active     BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, username, full_name, role, permissions, is_active
  FROM admin_users
  WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash)
    AND is_active = true;
$$;

-- ── Seed default superadmin (admin / admin2024) ────────────────────────────────
INSERT INTO admin_users (username, full_name, role, permissions, password_hash)
VALUES (
  'admin',
  'المدير العام',
  'superadmin',
  ARRAY['news','events','members','messages','investment','culture','social','contact','settings'],
  crypt('admin2024', gen_salt('bf'))
)
ON CONFLICT (username) DO NOTHING;
