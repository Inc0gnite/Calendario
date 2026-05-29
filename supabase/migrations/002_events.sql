-- ─────────────────────────────────────────────────────────────
-- MIGRACIÓN 002: Tabla de eventos
-- ─────────────────────────────────────────────────────────────

-- Tipos enum
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE recurrence_type AS ENUM ('none', 'monthly', 'yearly');
CREATE TYPE assigned_to_type AS ENUM ('user1', 'user2', 'both');
CREATE TYPE event_category AS ENUM (
  'appointment',
  'payment',
  'travel',
  'birthday',
  'task',
  'outing'
);

-- ─────────────────────────────────────────────
-- TABLA: events
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id     UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by   UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- Campos obligatorios
  title        TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  date         DATE NOT NULL,
  priority     priority_level NOT NULL DEFAULT 'medium',
  assigned_to  assigned_to_type NOT NULL DEFAULT 'both',

  -- Campos opcionales (null = no mostrar en UI)
  description  TEXT CHECK (char_length(description) <= 500),
  time         TIME,
  recurrence   recurrence_type NOT NULL DEFAULT 'none',
  category     event_category,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ÍNDICES para rendimiento
-- ─────────────────────────────────────────────

-- Consultas más frecuentes: eventos por grupo y fecha
CREATE INDEX idx_events_group_id       ON events(group_id);
CREATE INDEX idx_events_date           ON events(date);
CREATE INDEX idx_events_group_date     ON events(group_id, date);
CREATE INDEX idx_events_assigned_to    ON events(assigned_to);
CREATE INDEX idx_events_recurrence     ON events(recurrence) WHERE recurrence != 'none';

-- ─────────────────────────────────────────────
-- TRIGGER: actualizar updated_at automáticamente
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
