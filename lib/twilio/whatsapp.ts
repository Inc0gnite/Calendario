import type { Event, WhatsAppMessage } from "@/types";
import {
  PRIORITY_COLORS,
  CATEGORY_EMOJIS,
  DAYS_FULL,
  MONTHS,
} from "@/lib/utils/constants";
import { parseDate, sortEventsByTime } from "@/lib/utils/helpers";

// ─────────────────────────────────────────────
// ENVIAR MENSAJE (server-side only)
// ─────────────────────────────────────────────

export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_WHATSAPP_FROM!;

  if (!accountSid || !authToken || !from) {
    console.error("Faltan variables de entorno de Twilio");
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: `whatsapp:${message.to}`,
        Body: message.body,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Twilio error:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error enviando WhatsApp:", err);
    return false;
  }
}

// ─────────────────────────────────────────────
// FORMATEAR MENSAJE DE RECORDATORIO
// ─────────────────────────────────────────────

export function formatReminderMessage(
  event: Event,
  recipientUsername: string
): string {
  const date = parseDate(event.date);
  const dayName = DAYS_FULL[date.getDay()];
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];

  const emoji = getPriorityEmoji(event.priority);
  const categoryEmoji = event.category
    ? CATEGORY_EMOJIS[event.category]
    : "📌";

  let msg = `${emoji} *Recordatorio*\n\n`;
  msg += `Hola ${recipientUsername} 👋\n\n`;
  msg += `${categoryEmoji} *${event.title}*\n`;
  msg += `📅 ${dayName} ${day} de ${month}`;

  if (event.time) {
    msg += ` a las ${event.time}`;
  }

  msg += "\n";

  if (event.description) {
    msg += `\n_${event.description}_\n`;
  }

  return msg;
}

// ─────────────────────────────────────────────
// FORMATEAR RESUMEN SEMANAL
// ─────────────────────────────────────────────

export function formatWeeklySummary(
  eventsByDay: Record<string, Event[]>,
  groupName: string
): string {
  const sortedDates = Object.keys(eventsByDay).sort();

  if (sortedDates.length === 0) return "";

  let msg = `📅 *Agenda de la próxima semana*\n`;
  msg += `_${groupName}_\n\n`;

  for (const dateStr of sortedDates) {
    const events = sortEventsByTime(eventsByDay[dateStr]);
    const date = parseDate(dateStr);
    const dayName = DAYS_FULL[date.getDay()];
    const day = date.getDate();

    msg += `*${dayName} ${day}*\n`;

    for (const event of events) {
      const categoryEmoji = event.category
        ? CATEGORY_EMOJIS[event.category]
        : "•";
      const timeStr = event.time ? ` ${event.time}` : "";
      msg += `${categoryEmoji} ${event.title}${timeStr}\n`;
    }

    msg += "\n";
  }

  return msg.trim();
}

// ─────────────────────────────────────────────
// FORMATEAR AGRUPACIÓN DIARIA
// ─────────────────────────────────────────────

export function formatDailyDigest(
  events: Event[],
  recipientUsername: string
): string {
  if (events.length === 0) return "";

  const sorted = sortEventsByTime(events);

  let msg = `📍 *Hoy tienen:*\n\n`;

  for (const event of sorted) {
    const categoryEmoji = event.category
      ? CATEGORY_EMOJIS[event.category]
      : "•";
    const timeStr = event.time ? ` ${event.time}` : "";
    msg += `${categoryEmoji} ${event.title}${timeStr}\n`;
  }

  msg += `\n_Que tengan un buen día, ${recipientUsername} 😊_`;

  return msg;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getPriorityEmoji(priority: Event["priority"]): string {
  return { low: "🟢", medium: "🔵", high: "🔴" }[priority];
}
