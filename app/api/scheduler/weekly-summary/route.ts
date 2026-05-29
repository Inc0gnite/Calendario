import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, formatWeeklySummary } from "@/lib/twilio/whatsapp";
import type { Event } from "@/types";

// ─────────────────────────────────────────────
// POST /api/scheduler/weekly-summary
// Llamado cada viernes a las 09:00 Santiago
// ─────────────────────────────────────────────

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Calcular rango de la próxima semana (lunes → domingo)
  const now = new Date();
  const monday = getNextMonday(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = toDateStr(monday);
  const weekEnd = toDateStr(sunday);

  // ── 1. Obtener todos los grupos ──
  const { data: groups } = await supabase
    .from("groups")
    .select("id, name");

  if (!groups || groups.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sentCount = 0;

  for (const group of groups) {
    // Anti-spam: verificar si ya se envió esta semana
    const { data: existing } = await supabase
      .from("weekly_summaries")
      .select("id")
      .eq("group_id", group.id)
      .eq("week_start", weekStart)
      .single();

    if (existing) continue; // Ya enviado

    // ── 2. Obtener eventos de la próxima semana ──
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("group_id", group.id)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    // Si no hay eventos esta semana → no enviar
    if (!events || events.length === 0) continue;

    // ── 3. Agrupar eventos por día (solo días con eventos) ──
    const eventsByDay = groupByDate(events as Event[]);

    // ── 4. Obtener usuarios del grupo con WhatsApp ──
    const { data: users } = await supabase
      .from("users")
      .select("id, username, whatsapp_number, slot")
      .eq("group_id", group.id)
      .not("whatsapp_number", "is", null);

    if (!users || users.length === 0) continue;

    // ── 5. Enviar a cada usuario ──
    for (const user of users) {
      if (!user.whatsapp_number) continue;

      // Filtrar solo eventos relevantes para este usuario
      const userSlot = user.slot === 1 ? "user1" : "user2";
      const userEventsByDay: Record<string, Event[]> = {};

      for (const [date, dayEvents] of Object.entries(eventsByDay)) {
        const filtered = dayEvents.filter(
          (e) => e.assigned_to === "both" || e.assigned_to === userSlot
        );
        if (filtered.length > 0) {
          userEventsByDay[date] = filtered;
        }
      }

      if (Object.keys(userEventsByDay).length === 0) continue;

      const body = formatWeeklySummary(userEventsByDay, group.name);
      if (!body) continue;

      const ok = await sendWhatsAppMessage({
        to: user.whatsapp_number,
        body,
      });

      if (ok) sentCount++;
    }

    // ── 6. Registrar resumen enviado (anti-spam) ──
    await supabase.from("weekly_summaries").insert({
      group_id: group.id,
      week_start: weekStart,
    });
  }

  return NextResponse.json({
    sent: sentCount,
    week: `${weekStart} → ${weekEnd}`,
  });
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getNextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0=Dom
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function groupByDate(events: Event[]): Record<string, Event[]> {
  return events.reduce((acc, e) => {
    acc[e.date] = acc[e.date] ? [...acc[e.date], e] : [e];
    return acc;
  }, {} as Record<string, Event[]>);
}
