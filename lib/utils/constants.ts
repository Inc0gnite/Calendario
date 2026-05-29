import type {
  Priority,
  RecurrenceType,
  AssignedTo,
  EventCategory,
  ReminderOffset,
  SelectOption,
} from "@/types";

// ─────────────────────────────────────────────
// DISEÑO
// ─────────────────────────────────────────────

export const COLORS = {
  bgLight: "#F7F8FA",
  bgDark: "#111315",
  blue: "#5B8DEF",
  green: "#5EC7A1",
  purple: "#A78BFA",
  red: "#F97373",
  grayMuted: "#9CA3AF",
} as const;

// ─────────────────────────────────────────────
// PRIORIDADES
// ─────────────────────────────────────────────

export const PRIORITY_OPTIONS: SelectOption<Priority>[] = [
  { label: "Baja", value: "low" },
  { label: "Media", value: "medium" },
  { label: "Alta", value: "high" },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#5EC7A1",
  medium: "#5B8DEF",
  high: "#F97373",
};

// ─────────────────────────────────────────────
// RECURRENCIA
// ─────────────────────────────────────────────

export const RECURRENCE_OPTIONS: SelectOption<RecurrenceType>[] = [
  { label: "Sin repetición", value: "none" },
  { label: "Mensual", value: "monthly" },
  { label: "Anual", value: "yearly" },
];

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: "Sin repetición",
  monthly: "Mensual",
  yearly: "Anual",
};

// ─────────────────────────────────────────────
// ASIGNADO A
// ─────────────────────────────────────────────

export const ASSIGNED_TO_LABELS: Record<AssignedTo, string> = {
  user1: "Tú",
  user2: "Tu pareja",
  both: "Ambos",
};

// ─────────────────────────────────────────────
// CATEGORÍAS
// ─────────────────────────────────────────────

export const CATEGORY_OPTIONS: SelectOption<EventCategory>[] = [
  { label: "Cita", value: "appointment" },
  { label: "Pago", value: "payment" },
  { label: "Viaje", value: "travel" },
  { label: "Cumpleaños", value: "birthday" },
  { label: "Tarea", value: "task" },
  { label: "Salida", value: "outing" },
];

export const CATEGORY_LABELS: Record<NonNullable<EventCategory>, string> = {
  appointment: "Cita",
  payment: "Pago",
  travel: "Viaje",
  birthday: "Cumpleaños",
  task: "Tarea",
  outing: "Salida",
};

export const CATEGORY_EMOJIS: Record<NonNullable<EventCategory>, string> = {
  appointment: "🏥",
  payment: "💳",
  travel: "✈️",
  birthday: "🎂",
  task: "✅",
  outing: "🍽️",
};

// ─────────────────────────────────────────────
// RECORDATORIOS
// ─────────────────────────────────────────────

export const REMINDER_OPTIONS: SelectOption<ReminderOffset>[] = [
  { label: "El mismo día", value: "same_day" },
  { label: "1 día antes", value: "1_day_before" },
  { label: "1 semana antes", value: "1_week_before" },
  { label: "1 mes antes", value: "1_month_before" },
];

export const REMINDER_LABELS: Record<ReminderOffset, string> = {
  same_day: "El mismo día",
  "1_day_before": "1 día antes",
  "1_week_before": "1 semana antes",
  "1_month_before": "1 mes antes",
};

// ─────────────────────────────────────────────
// CALENDARIO
// ─────────────────────────────────────────────

export const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DAYS_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ─────────────────────────────────────────────
// FERIADOS CHILE
// ─────────────────────────────────────────────

export const HOLIDAYS_API_URL =
  "https://api.boostr.cl/holidays.json"; // API feriados Chile

// ─────────────────────────────────────────────
// APP CONFIG
// ─────────────────────────────────────────────

export const APP_NAME = "Agenda";
export const MAX_GROUP_MEMBERS = 2;
export const SESSION_KEY = "agenda_session"; // localStorage key
export const WEEKLY_SUMMARY_DAY = 5; // Viernes (0=Dom, 5=Vie)
