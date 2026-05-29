-- ─────────────────────────────────────────────────────────────
-- MIGRACIÓN 003: Tabla de recordatorios
-- ─────────────────────────────────────────────────────────────

CREATE TYPE reminder_offset AS ENUM (
  'same_day',
  '1_day_before',
  '1_week_before',
  '1_month_before'
);

-- ─────────────────────────────────────────────
-- TABLA: reminders
-- Recordatorios personalizados por evento.
-- Si no existen → se usan reglas por defecto.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reminders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  offset_type    reminder_offset NOT NULL,
  scheduled_for  TIMESTAMPTZ NOT NULL,  -- fecha/hora exacta de envío
  sent           BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- No duplicar el mismo offset para el mismo evento
  CONSTRAINT unique_offset_per_event UNIQUE (event_id, offset_type)
);

-- Índices
CREATE INDEX idx_reminders_event_id      ON reminders(event_id);
CREATE INDEX idx_reminders_scheduled     ON reminders(scheduled_for) WHERE sent = FALSE;
CREATE INDEX idx_reminders_pending       ON reminders(sent, scheduled_for);

-- ─────────────────────────────────────────────
-- TABLA: weekly_summaries
-- Registro de resúmenes semanales enviados (anti-spam)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_summaries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,   -- lunes de esa semana
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_summary_per_week UNIQUE (group_id, week_start)
);

CREATE INDEX idx_weekly_summaries_group ON weekly_summaries(group_id);

-- ─────────────────────────────────────────────
-- FUNCIÓN: calcular fecha de recordatorio
-- según offset y fecha del evento
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_reminder_date(
  event_date DATE,
  event_time TIME,
  offset_val reminder_offset
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  base_datetime TIMESTAMPTZ;
  send_time     TIME := COALESCE(event_time, '09:00:00'::TIME);
BEGIN
  base_datetime := (event_date + send_time) AT TIME ZONE 'America/Santiago';

  RETURN CASE offset_val
    WHEN 'same_day'      THEN base_datetime
    WHEN '1_day_before'  THEN base_datetime - INTERVAL '1 day'
    WHEN '1_week_before' THEN base_datetime - INTERVAL '7 days'
    WHEN '1_month_before'THEN base_datetime - INTERVAL '30 days'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─────────────────────────────────────────────
-- FUNCIÓN: crear recordatorios por defecto
-- Se llama automáticamente al crear un evento
-- sin recordatorios personalizados.
-- Regla: día anterior a las 09:00 Santiago
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_default_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si el evento no tiene recordatorios
  IF NOT EXISTS (
    SELECT 1 FROM reminders WHERE event_id = NEW.id
  ) THEN
    INSERT INTO reminders (event_id, offset_type, scheduled_for)
    VALUES (
      NEW.id,
      '1_day_before',
      calculate_reminder_date(NEW.date, NEW.time, '1_day_before')
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_default_reminder
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_default_reminder();
