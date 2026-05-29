// supabase/functions/send-reminders/index.ts
// Deploy con: supabase functions deploy send-reminders

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

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Obtener recordatorios pendientes
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select(`*, events(*, groups(id,name))`)
    .eq("sent", false)
    .gte("scheduled_for", now.toISOString())
    .lte("scheduled_for", oneHourLater.toISOString());

  if (error || !reminders?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  // Agrupar por grupo+día
  const grouped: Record<string, { ids: string[]; events: any[] }> = {};
  for (const r of reminders) {
    const e = r.events as any;
    const key = `${e.group_id}__${e.date}`;
    if (!grouped[key]) grouped[key] = { ids: [], events: [] };
    grouped[key].ids.push(r.id);
    grouped[key].events.push(e);
  }

  let sent = 0;

  for (const entry of Object.values(grouped)) {
    const groupId = entry.events[0].group_id;

    const { data: users } = await supabase
      .from("users")
      .select("id, username, whatsapp_number, slot")
      .eq("group_id", groupId)
      .not("whatsapp_number", "is", null);

    if (!users?.length) continue;

    for (const user of users) {
      if (!user.whatsapp_number) continue;

      const slot = user.slot === 1 ? "user1" : "user2";
      const applicable = entry.events.filter(
        (e: any) => e.assigned_to === "both" || e.assigned_to === slot
      );
      if (!applicable.length) continue;

      const body = applicable.length > 1
        ? buildDigest(applicable, user.username)
        : buildReminder(applicable[0], user.username);

      const ok = await sendWA(user.whatsapp_number, body);
      if (ok) sent++;
    }

    // Marcar como enviados
    await supabase
      .from("reminders")
      .update({ sent: true, sent_at: now.toISOString() })
      .in("id", entry.ids);
  }

  return new Response(JSON.stringify({ sent }), { status: 200 });
});

// ─────────────────────────────────────────────

function buildReminder(event: any, username: string): string {
  const d = new Date(event.date + "T12:00");
  const emoji = event.category ? CATEGORY_EMOJIS[event.category] : "📌";
  let msg = `🔔 *Recordatorio*\n\nHola ${username} 👋\n\n`;
  msg += `${emoji} *${event.title}*\n`;
  msg += `📅 ${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  if (event.time) msg += ` a las ${event.time}`;
  if (event.description) msg += `\n\n_${event.description}_`;
  return msg;
}

function buildDigest(events: any[], username: string): string {
  let msg = `📍 *Hoy tienen:*\n\n`;
  for (const e of events) {
    const emoji = e.category ? CATEGORY_EMOJIS[e.category] : "•";
    msg += `${emoji} ${e.title}${e.time ? ` ${e.time}` : ""}\n`;
  }
  msg += `\n_Que tengan un buen día, ${username} 😊_`;
  return msg;
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
