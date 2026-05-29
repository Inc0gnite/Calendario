import { supabase } from "@/lib/supabase/client";
import type { Reminder, ReminderOffset } from "@/types";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// OBTENER RECORDATORIOS DE UN EVENTO
// ─────────────────────────────────────────────

export async function getEventReminders(eventId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("event_id", eventId)
    .order("scheduled_for", { ascending: true });

  if (error) return [];
  return data as Reminder[];
}

// ─────────────────────────────────────────────
// ACTUALIZAR RECORDATORIOS
// Reemplaza todos los recordatorios del evento
// ─────────────────────────────────────────────

export async function updateEventReminders(
  eventId: string,
  eventDate: string,
  eventTime: string | null,
  offsets: ReminderOffset[]
): Promise<boolean> {
  // 1. Eliminar recordatorios existentes no enviados
  const { error: delError } = await supabase
    .from("reminders")
    .delete()
    .eq("event_id", eventId)
    .eq("sent", false);

  if (delError) {
    toast.error("Error al actualizar recordatorios");
    return false;
  }

  if (offsets.length === 0) return true;

  // 2. Calcular fechas de envío via función SQL
  const insertData = await Promise.all(
    offsets.map(async (offset) => {
      const { data } = await supabase.rpc("calculate_reminder_date", {
        event_date: eventDate,
        event_time: eventTime,
        offset_val: offset,
      });
      return {
        event_id: eventId,
        offset_type: offset,
        scheduled_for: data as string,
        sent: false,
      };
    })
  );

  const { error: insError } = await supabase
    .from("reminders")
    .insert(insertData);

  if (insError) {
    toast.error("Error al guardar recordatorios");
    return false;
  }

  return true;
}
