// supabase/functions/weekly-summary/index.ts
// Deploy con: supabase functions deploy weekly-summary

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const CATEGORY_EMOJIS: Record<string, string> = {
  appointment:"🏥", payment:"💳", travel:"✈️",
  birthday:"🎂", task:"✅", outing:"🍽️",
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Próxima semana: lunes → domingo
  const monday = getNextMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = toStr(monday);
  const weekEnd = toStr(sunday);

  const { data: groups } = await supabase.from("groups").select("id, name");
  if (!groups?.length) return new Response(JSON.stringify({ sent: 0 }));

  let sent = 0;

  for (const group of groups) {
    // Anti-spam
    const { data: already } = await supabase
      .from("weekly_summaries")
      .select("id")
      .eq("group_id", group.id)
      .eq("week_start", weekStart)
      .single();

    if (already) continue;

    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("group_id", group.id)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("date").order("time");

    if (!events?.length) continue;

    const { data: users } = await supabase
      .from("users")
      .select("id, username, whatsapp_number, slot")
      .eq("group_id", group.id)
      .not("whatsapp_number", "is", null);

    if (!users?.length) continue;

    for (const user of users) {
      if (!user.whatsapp_number) continue;

      const slot = user.slot === 1 ? "user1" : "user2";

      // Solo días con eventos para este usuario
      const byDay: Record<string, any[]> = {};
      for (const e of events) {
        if (e.assigned_to !== "both" && e.assigned_to !== slot) continue;
        byDay[e.date] = byDay[e.date] ? [...byDay[e.date], e] : [e];
      }

      if (!Object.keys(byDay).length) continue;

      const body = buildWeeklySummary(byDay, group.name);
      const ok = await sendWA(user.whatsapp_number, body);
      if (ok) sent++;
    }

    await supabase.from("weekly_summaries").insert({
      group_id: group.id,
      week_start: weekStart,
    });
  }

  return new Response(JSON.stringify({ sent, week: `${weekStart} → ${weekEnd}` }));
});

// ─────────────────────────────────────────────

function buildWeeklySummary(
  byDay: Record<string, any[]>,
  groupName: string
): string {
  let msg = `📅 *Agenda de la próxima semana*\n_${groupName}_\n\n`;

  for (const dateStr of Object.keys(byDay).sort()) {
    const events = byDay[dateStr].sort((a: any, b: any) =>
      (a.time ?? "99:99").localeCompare(b.time ?? "99:99")
    );
    const d = new Date(dateStr + "T12:00");
    msg += `*${DAYS[d.getDay()]} ${d.getDate()}*\n`;
    for (const e of events) {
      const em = e.category ? CATEGORY_EMOJIS[e.category] : "•";
      msg += `${em} ${e.title}${e.time ? ` ${e.time}` : ""}\n`;
    }
    msg += "\n";
  }

  return msg.trim();
}

function getNextMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function toStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

async function sendWA(to: string, body: string): Promise<boolean> {
  const creds = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: TWILIO_FROM,
        To: `whatsapp:${to}`,
        Body: body,
      }),
    }
  );
  return res.ok;
}
