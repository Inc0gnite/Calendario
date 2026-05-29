-- ─────────────────────────────────────────────────────────────
-- MIGRACIÓN 004: Row Level Security (RLS)
-- Solo los miembros del grupo ven sus datos.
-- Usamos una función custom de sesión (sin Supabase Auth complejo).
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- FUNCIÓN: obtener user_id de la sesión actual
-- Se setea desde el frontend via:
--   supabase.rpc('set_session_user', { user_id: '...' })
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_session_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.user_id', TRUE), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────
-- FUNCIÓN: obtener group_id del usuario en sesión
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_session_group_id()
RETURNS UUID AS $$
DECLARE
  gid UUID;
BEGIN
  SELECT group_id INTO gid
  FROM users
  WHERE id = get_session_user_id();
  RETURN gid;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────
-- RLS: groups
-- ─────────────────────────────────────────────

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Ver grupo: solo si sos miembro
CREATE POLICY "groups_select_own"
  ON groups FOR SELECT
  USING (
    id = get_session_group_id()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.group_id = groups.id
        AND users.id = get_session_user_id()
    )
  );

-- Crear grupo: cualquiera puede crear (login)
CREATE POLICY "groups_insert_public"
  ON groups FOR INSERT
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────
-- RLS: users
-- ─────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ver usuarios: solo los de tu grupo
CREATE POLICY "users_select_own_group"
  ON users FOR SELECT
  USING (
    group_id = get_session_group_id()
  );

-- Crear usuario: libre (login flow)
CREATE POLICY "users_insert_public"
  ON users FOR INSERT
  WITH CHECK (TRUE);

-- Actualizar: solo tu propio perfil
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = get_session_user_id())
  WITH CHECK (id = get_session_user_id());

-- ─────────────────────────────────────────────
-- RLS: events
-- ─────────────────────────────────────────────

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Ver eventos: solo los de tu grupo
CREATE POLICY "events_select_own_group"
  ON events FOR SELECT
  USING (group_id = get_session_group_id());

-- Crear: solo si sos del grupo
CREATE POLICY "events_insert_own_group"
  ON events FOR INSERT
  WITH CHECK (group_id = get_session_group_id());

-- Editar: cualquiera del grupo puede editar
CREATE POLICY "events_update_own_group"
  ON events FOR UPDATE
  USING (group_id = get_session_group_id())
  WITH CHECK (group_id = get_session_group_id());

-- Eliminar: cualquiera del grupo puede eliminar
CREATE POLICY "events_delete_own_group"
  ON events FOR DELETE
  USING (group_id = get_session_group_id());

-- ─────────────────────────────────────────────
-- RLS: reminders
-- ─────────────────────────────────────────────

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Ver recordatorios: solo si el evento es de tu grupo
CREATE POLICY "reminders_select_own_group"
  ON reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = reminders.event_id
        AND events.group_id = get_session_group_id()
    )
  );

-- Crear/editar recordatorios: solo si el evento es de tu grupo
CREATE POLICY "reminders_insert_own_group"
  ON reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = reminders.event_id
        AND events.group_id = get_session_group_id()
    )
  );

CREATE POLICY "reminders_update_own_group"
  ON reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = reminders.event_id
        AND events.group_id = get_session_group_id()
    )
  );

CREATE POLICY "reminders_delete_own_group"
  ON reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = reminders.event_id
        AND events.group_id = get_session_group_id()
    )
  );

-- ─────────────────────────────────────────────
-- RLS: weekly_summaries
-- Solo lectura del propio grupo
-- ─────────────────────────────────────────────

ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "summaries_select_own_group"
  ON weekly_summaries FOR SELECT
  USING (group_id = get_session_group_id());
