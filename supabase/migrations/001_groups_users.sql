-- ─────────────────────────────────────────────────────────────
-- MIGRACIÓN 001: Tablas base — grupos y usuarios
-- ─────────────────────────────────────────────────────────────

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- TABLA: groups
-- Un "grupo" = la pareja. Máximo 2 usuarios.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,   -- código único de 6 chars (ej: "AB3K9Z")
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda por código (login)
CREATE UNIQUE INDEX idx_groups_code ON groups(code);

-- ─────────────────────────────────────────────
-- TABLA: users
-- Solo 2 por grupo. Sin passwords.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id         UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  username         TEXT NOT NULL,
  whatsapp_number  TEXT,              -- formato: +56912345678
  slot             SMALLINT NOT NULL CHECK (slot IN (1, 2)), -- user1 o user2
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un username único por grupo
  CONSTRAINT unique_username_per_group UNIQUE (group_id, username),
  -- Máximo 2 usuarios por grupo (slot 1 y 2)
  CONSTRAINT unique_slot_per_group UNIQUE (group_id, slot)
);

-- Índices
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_users_username ON users(username);

-- ─────────────────────────────────────────────
-- FUNCIÓN: verificar máximo 2 usuarios por grupo
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_group_member_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM users WHERE group_id = NEW.group_id
  ) >= 2 THEN
    RAISE EXCEPTION 'El grupo ya tiene 2 miembros. No se pueden agregar más.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_group_member_limit
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_group_member_limit();

-- ─────────────────────────────────────────────
-- FUNCIÓN: asignar slot automáticamente
-- Asigna slot=1 al primer usuario, slot=2 al segundo
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION assign_user_slot()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INT;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM users WHERE group_id = NEW.group_id;

  IF existing_count = 0 THEN
    NEW.slot := 1;
  ELSE
    NEW.slot := 2;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_slot
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.slot IS NULL)
  EXECUTE FUNCTION assign_user_slot();
