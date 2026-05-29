// ─────────────────────────────────────────────
// USUARIOS & GRUPO
// ─────────────────────────────────────────────

export type UserId = string;

export interface User {
  id: UserId;
  username: string;
  whatsapp_number: string | null;
  group_id: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  code: string; // código único de pareja
  user1_id: UserId | null;
  user2_id: UserId | null;
  created_at: string;
}

// ─────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";
export type RecurrenceType = "none" | "monthly" | "yearly";
export type AssignedTo = "user1" | "user2" | "both";
export type EventCategory =
  | "appointment"
  | "payment"
  | "travel"
  | "birthday"
  | "task"
  | "outing"
  | null;

export interface Event {
  id: string;
  group_id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  priority: Priority;
  assigned_to: AssignedTo;
  // Opcionales
  description?: string | null;
  time?: string | null; // HH:MM
  recurrence: RecurrenceType;
  category?: EventCategory;
  created_by: UserId;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  date: string;
  priority: Priority;
  assigned_to: AssignedTo;
  description?: string;
  time?: string;
  recurrence?: RecurrenceType;
  category?: EventCategory;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

// ─────────────────────────────────────────────
// RECORDATORIOS
// ─────────────────────────────────────────────

export type ReminderOffset =
  | "1_day_before"
  | "1_week_before"
  | "1_month_before"
  | "same_day";

export interface Reminder {
  id: string;
  event_id: string;
  offset: ReminderOffset;
  sent: boolean;
  scheduled_for: string; // ISO datetime
  created_at: string;
}

// ─────────────────────────────────────────────
// FERIADOS
// ─────────────────────────────────────────────

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: "national" | "regional" | "religious";
}

// ─────────────────────────────────────────────
// SESIÓN / AUTH
// ─────────────────────────────────────────────

export interface Session {
  user: User;
  group: Group;
  partnerUsername: string | null;
}

export interface LoginWithCodeInput {
  code: string;
  username: string;
}

export interface CreateGroupInput {
  groupName: string;
  username: string;
}

// ─────────────────────────────────────────────
// CALENDARIO
// ─────────────────────────────────────────────

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  events: Event[];
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
  days: CalendarDay[];
}

// ─────────────────────────────────────────────
// WHATSAPP / MENSAJES
// ─────────────────────────────────────────────

export interface WhatsAppMessage {
  to: string; // número con código de país
  body: string;
}

export interface WeeklySummaryPayload {
  group_id: string;
  week_start: string; // YYYY-MM-DD (lunes)
  week_end: string;   // YYYY-MM-DD (domingo)
}

// ─────────────────────────────────────────────
// UI / UTILIDADES
// ─────────────────────────────────────────────

export type ColorKey =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "gray";

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export type LoadingState = "idle" | "loading" | "success" | "error";
