import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, formatReminderMessage, formatDailyDigest } from "@/lib/twilio/whatsapp";
import type { Event } from "@/types";

// ─────────────────────────────────────────────
// POST /api/scheduler/send-reminders
// Llamado por Supabase cron cada hora
// ─────────────────────────────────────────────

export async function POST(request: Request) {
  // Verificar authorization
  const authHeader = request.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // ── 1. Obtener recordatorios pendientes de la próxima hora ──
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select(`
      *,
      events (
        *,
        groups (id, name),
        users!events_created_by_fkey (id, username, whatsapp_number, slot)
      )
    `)
    .eq("sent", false)
    .gte("scheduled_for", now.toISOString())
    .lte("scheduled_for", oneHourLater.toISOString());

  if (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // ── 2. Agrupar por grupo + día para detectar múltiples eventos ──
  const groupDayMap: Record<string, {
    groupId: string;
    dateStr: string;
    reminderIds: string[];
    events: Event[];
  }> = {};

  for (const reminder of reminders) {
    const event = reminder.events as any;
    if (!event) continue;

    const key = `${event.group_id}__${event.date}`;
    if (!groupDayMap[key]) {
      groupDayMap[key] = {
        groupId: event.group_id,
        dateStr: event.date,
        reminderIds: [],
        events: [],
      };
    }
    groupDayMap[key].reminderIds.push(reminder.id);
    groupDayMap[key].events.push(event as Event);
  }

  let sentCount = 0;

  // ── 3. Procesar cada grupo/día ──
  for (const [, entry] of Object.entries(groupDayMap)) {
    const { groupId, events, reminderIds } = entry;

    // Obtener usuarios del grupo con WhatsApp
    const { data: users } = await supabase
      .from("users")
      .select("id, username, whatsapp_number, slot")
      .eq("group_id", groupId)
      .not("whatsapp_number", "is", null);

    if (!users || users.length === 0) continue;

    for (const user of users) {
      if (!user.whatsapp_number) continue;

      // Filtrar eventos que aplican a este usuario
      const userSlot = user.slot === 1 ? "user1" : "user2";
      const applicableEvents = events.filter(
        (e) =>
          e.assigned_to === "both" || e.assigned_to === userSlot
      );

      if (applicableEvents.length === 0) continue;

      // Si son múltiples eventos en el día → digest agrupado
      // Si es uno solo → mensaje individual
      let messageBody: string;
      if (applicableEvents.length > 1) {
        messageBody = formatDailyDigest(applicableEvents, user.username);
      } else {
        messageBody = formatReminderMessage(applicableEvents[0], user.username);
      }

      const ok = await sendWhatsAppMessage({
        to: user.whatsapp_number,
        body: messageBody,
      });

      if (ok) sentCount++;
    }

    // ── 4. Marcar recordatorios como enviados ──
    await supabase
      .from("reminders")
      .update({ sent: true, sent_at: new Date().toISOString() })
      .in("id", reminderIds);
  }

  return NextResponse.json({ sent: sentCount });
}
