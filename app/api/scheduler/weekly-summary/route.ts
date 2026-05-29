import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, formatWeeklySummary } from "@/lib/twilio/whatsapp";
import type { Event } from "@/types";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const sb = supabase as any;

  const monday = getNextMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = toDateStr(monday);
  const weekEnd = toDateStr(sunday);

  const { data: groupsRaw } = await sb.from("groups").select("id, name");
  const groups = (groupsRaw ?? []) as { id: string; name: string }[];

  if (groups.length === 0) return NextResponse.json({ sent: 0 });

  let sentCount = 0;

  for (const group of groups) {
    // Anti-spam
    const { data: existing } = await sb
      .from("weekly_summaries")
      .select("id")
      .eq("group_id", group.id)
      .eq("week_start", weekStart)
      .single();

    if (existing) continue;

    const { data: eventsRaw } = await sb
      .from("events")
      .select("*")
      .eq("group_id", group.id)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("date")
      .order("time");

    const events = (eventsRaw ?? []) as Event[];
    if (events.length === 0) continue;

    const { data: usersRaw } = await sb
      .from("users")
      .select("id, username, whatsapp_number, slot")
      .eq("group_id", group.id)
      .not("whatsapp_number", "is", null);

    const users = (usersRaw ?? []) as {
      id: string;
      username: string;
      whatsapp_number: string | null;
      slot: number;
    }[];

    if (users.length === 0) continue;

    for (const user of users) {
      if (!user.whatsapp_number) continue;

      const slot = user.slot === 1 ? "user1" : "user2";
      const byDay: Record<string, Event[]> = {};

      for (const e of events) {
        if (e.assigned_to !== "both" && e.assigned_to !== slot) continue;
        byDay[e.date] = byDay[e.date] ? [...byDay[e.date], e] : [e];
      }

      if (Object.keys(byDay).length === 0) continue;

      const body = formatWeeklySummary(byDay, group.name);
      if (!body) continue;

      const ok = await sendWhatsAppMessage({ to: user.whatsapp_number, body });
      if (ok) sentCount++;
    }

    await sb.from("weekly_summaries").insert({
      group_id: group.id,
      week_start: weekStart,
    });
  }

  return NextResponse.json({ sent: sentCount, week: `${weekStart} → ${weekEnd}` });
}

function getNextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}
