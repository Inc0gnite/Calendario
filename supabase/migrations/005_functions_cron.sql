-- ─────────────────────────────────────────────────────────────
-- MIGRACIÓN 005: Funciones RPC y cron jobs
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- FUNCIÓN RPC: set_session_user
-- El frontend la llama después del login para
-- establecer el contexto de la sesión.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_session_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.user_id', user_id::TEXT, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- FUNCIÓN RPC: login_with_code
-- Busca o crea un usuario dado el código de grupo
-- y username. Retorna user + group data.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION login_with_code(
  p_code      TEXT,
  p_username  TEXT
)
RETURNS JSON AS $$
DECLARE
  v_group     groups%ROWTYPE;
  v_user      users%ROWTYPE;
  v_count     INT;
BEGIN
  -- Buscar grupo por código
  SELECT * INTO v_group FROM groups WHERE code = UPPER(p_code);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código de grupo inválido';
  END IF;

  -- Ver si ya existe el usuario con ese username en el grupo
  SELECT * INTO v_user
  FROM users
  WHERE group_id = v_group.id AND LOWER(username) = LOWER(p_username);

  IF FOUND THEN
    -- Usuario existente → login directo
    RETURN json_build_object(
      'user', row_to_json(v_user),
      'group', row_to_json(v_group),
      'action', 'login'
    );
  END IF;

  -- Verificar que el grupo no esté lleno
  SELECT COUNT(*) INTO v_count FROM users WHERE group_id = v_group.id;
  IF v_count >= 2 THEN
    RAISE EXCEPTION 'Este grupo ya está completo (2 miembros)';
  END IF;

  -- Crear nuevo usuario
  INSERT INTO users (group_id, username, slot)
  VALUES (v_group.id, p_username, v_count + 1)
  RETURNING * INTO v_user;

  RETURN json_build_object(
    'user', row_to_json(v_user),
    'group', row_to_json(v_group),
    'action', 'register'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- FUNCIÓN RPC: create_group
-- Crea un nuevo grupo y el primer usuario
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_group(
  p_group_name  TEXT,
  p_username    TEXT,
  p_code        TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_group   groups%ROWTYPE;
  v_user    users%ROWTYPE;
  v_code    TEXT;
BEGIN
  -- Usar código provisto o generar uno único
  v_code := COALESCE(UPPER(p_code), generate_group_code());

  -- Verificar que no exista
  WHILE EXISTS (SELECT 1 FROM groups WHERE code = v_code) LOOP
    v_code := generate_group_code();
  END LOOP;

  -- Crear grupo
  INSERT INTO groups (name, code)
  VALUES (p_group_name, v_code)
  RETURNING * INTO v_group;

  -- Crear usuario inicial (slot 1)
  INSERT INTO users (group_id, username, slot)
  VALUES (v_group.id, p_username, 1)
  RETURNING * INTO v_user;

  RETURN json_build_object(
    'user', row_to_json(v_user),
    'group', row_to_json(v_group),
    'action', 'created'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- FUNCIÓN: generar código de grupo
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- FUNCIÓN RPC: get_partner
-- Retorna el otro usuario del grupo
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_partner(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_partner users%ROWTYPE;
  v_group_id UUID;
BEGIN
  SELECT group_id INTO v_group_id FROM users WHERE id = p_user_id;

  SELECT * INTO v_partner
  FROM users
  WHERE group_id = v_group_id AND id != p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'id', v_partner.id,
    'username', v_partner.username,
    'slot', v_partner.slot
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- CRON JOBS (requiere pg_cron en Supabase)
-- ─────────────────────────────────────────────

-- Habilitar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Disparar recordatorios cada hora
-- (La Edge Function verifica qué recordatorios vencen en la próxima hora)
SELECT cron.schedule(
  'send-reminders',
  '0 * * * *',  -- cada hora en punto
  $$
    SELECT net.http_post(
      url := current_setting('app.edge_function_url') || '/send-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- Resumen semanal cada viernes a las 09:00 (Chile = UTC-4)
SELECT cron.schedule(
  'weekly-summary',
  '0 13 * * 5',  -- Viernes 09:00 Santiago (UTC-4 = 13:00 UTC)
  $$
    SELECT net.http_post(
      url := current_setting('app.edge_function_url') || '/weekly-summary',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
