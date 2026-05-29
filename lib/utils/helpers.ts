import { DAYS_FULL, MONTHS } from "./constants";
import type { Event, CalendarDay, CalendarMonth, Holiday } from "@/types";

// ─────────────────────────────────────────────
// FECHAS
// ─────────────────────────────────────────────

/** Retorna fecha de hoy como string YYYY-MM-DD */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/** Convierte Date a string YYYY-MM-DD */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parsea string YYYY-MM-DD a Date (sin timezone issues) */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Formatea fecha para mostrar al usuario */
export function formatDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  return year === currentYear ? `${day} de ${month}` : `${day} de ${month} ${year}`;
}

/** Formatea fecha corta */
export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr);
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

/** Formatea hora HH:MM a formato legible */
export function formatTime(time: string): string {
  return time; // Ya viene en HH:MM
}

/** Retorna nombre del día */
export function getDayName(dateStr: string): string {
  const date = parseDate(dateStr);
  return DAYS_FULL[date.getDay()];
}

/** Verifica si una fecha es hoy */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/** Verifica si una fecha es fin de semana */
export function isWeekend(dateStr: string): boolean {
  const date = parseDate(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Retorna el lunes de la semana actual */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

/** Retorna el próximo viernes */
export function getNextFriday(): Date {
  const today = new Date();
  const day = today.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  const friday = new Date(today);
  friday.setDate(today.getDate() + daysUntilFriday);
  return friday;
}

// ─────────────────────────────────────────────
// CALENDARIO
// ─────────────────────────────────────────────

/** Genera los días de un mes para el calendario */
export function buildCalendarMonth(
  year: number,
  month: number, // 0-indexed
  events: Event[],
  holidays: Holiday[]
): CalendarMonth {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = getTodayString();

  // Día de la semana del primer día (0=Dom)
  const startDayOfWeek = firstDay.getDay();

  const days: CalendarDay[] = [];

  // Días del mes anterior para completar la primera semana
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const dateStr = toDateString(date);
    days.push({
      date: dateStr,
      isToday: dateStr === today,
      isCurrentMonth: false,
      isWeekend: isWeekend(dateStr),
      events: getEventsForDate(dateStr, events),
      holiday: getHolidayForDate(dateStr, holidays),
    });
  }

  // Días del mes actual
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateStr = toDateString(date);
    days.push({
      date: dateStr,
      isToday: dateStr === today,
      isCurrentMonth: true,
      isWeekend: isWeekend(dateStr),
      events: getEventsForDate(dateStr, events),
      holiday: getHolidayForDate(dateStr, holidays),
    });
  }

  // Días del mes siguiente para completar la última semana
  const remaining = 42 - days.length; // 6 semanas × 7 días
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const dateStr = toDateString(date);
    days.push({
      date: dateStr,
      isToday: dateStr === today,
      isCurrentMonth: false,
      isWeekend: isWeekend(dateStr),
      events: getEventsForDate(dateStr, events),
      holiday: getHolidayForDate(dateStr, holidays),
    });
  }

  return { year, month, days };
}

function getEventsForDate(dateStr: string, events: Event[]): Event[] {
  return events.filter((e) => e.date === dateStr);
}

function getHolidayForDate(
  dateStr: string,
  holidays: Holiday[]
): Holiday | undefined {
  return holidays.find((h) => h.date === dateStr);
}

// ─────────────────────────────────────────────
// CÓDIGO DE GRUPO
// ─────────────────────────────────────────────

/** Genera un código único de 6 caracteres alfanumérico */
export function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres confusos
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────

/** Ordena eventos por hora (los sin hora al final) */
export function sortEventsByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
}

/** Agrupa eventos por fecha */
export function groupEventsByDate(
  events: Event[]
): Record<string, Event[]> {
  return events.reduce(
    (acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    },
    {} as Record<string, Event[]>
  );
}

/** Filtra eventos próximos (desde hoy) */
export function getUpcomingEvents(events: Event[], limit = 5): Event[] {
  const today = getTodayString();
  return events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

// ─────────────────────────────────────────────
// NÚMERO WHATSAPP
// ─────────────────────────────────────────────

/** Formatea número para Twilio (añade + si no tiene) */
export function formatWhatsAppNumber(number: string): string {
  const cleaned = number.replace(/\D/g, "");
  return `+${cleaned}`;
}

/** Valida si un número tiene formato válido */
export function isValidPhoneNumber(number: string): boolean {
  const cleaned = number.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// ─────────────────────────────────────────────
// STRINGS
// ─────────────────────────────────────────────

/** Capitaliza primera letra */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Trunca texto con ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
