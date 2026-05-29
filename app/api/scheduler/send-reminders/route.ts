import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, formatReminderMessage, formatDailyDigest } from "@/lib/twilio/whatsapp";
import type { Event } from "@/types";

interface ReminderRow {
  id: string;
  event_id: string;
  offset_type: string;
  scheduled_for: string;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const { data: remindersRaw, error } = await supabase
    .from("reminders")
    .select("id, event_id, offset_type, scheduled_for")
    .eq("sent", false)
    .gte("scheduled_for", now.toISOString())
    .lte("scheduled_for", oneHourLater.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reminders = (remindersRaw ?? []) as ReminderRow[];

  if (reminders.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const eventIds = [...new Set(reminders.map((r) => r.event_id))];

  const { data: eventsRaw } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds);

  const events = (eventsRaw ?? []) as Event[];

  if (events.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const groupDayMap: Record<string, {
    groupId: string;
    reminderIds: string[];
    events: Event[];
  }> = {};

  for (const reminder of reminders) {
    const event = events.find((e) => e.id === reminder.event_id);
    if (!event) continue;

    const key = `${event.group_id}__${event.date}`;
    if (!groupDayMap[key]) {
      groupDayMap[key] = { groupId: event.group_id, reminderIds: [], events: [] };
    }
    groupDayMap[key].reminderIds.push(reminder.id);
    groupDayMap[key].events.push(event);
  }

  let sentCount = 0;

  for (const entry of Object.values(groupDayMap)) {
    const { groupId, events: dayEvents, reminderIds } = entry;

    const { data: usersRaw } = await supabase
      .from("users")
      .select("id, username, whatsapp_number, slot")
      .eq("group_id", groupId)
      .not("whatsapp_number", "is", null);

    const users = (usersRaw ?? []) as {
      id: string;
      username: string;
      whatsapp_number: string | null;
      slot: number;
    }[];

    for (const user of users) {
      if (!user.whatsapp_number) continue;

      const userSlot = user.slot === 1 ? "user1" : "user2";
      const applicable = dayEvents.filter(
        (e) => e.assigned_to === "both" || e.assigned_to === userSlot
      );

      if (applicable.length === 0) continue;

      const messageBody =
        applicable.length > 1
          ? formatDailyDigest(applicable, user.username)
          : formatReminderMessage(applicable[0], user.username);

      const ok = await sendWhatsAppMessage({ to: user.whatsapp_number, body: messageBody });
      if (ok) sentCount++;
    }

    await (supabase as any)
      .from("reminders")
      .update({ sent: true, sent_at: new Date().toISOString() })
      .in("id", reminderIds);
  }

  return NextResponse.json({ sent: sentCount });
}
