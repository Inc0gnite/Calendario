"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Event, CreateEventInput, UpdateEventInput } from "@/types";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────

export function useEvents(groupId: string | null, userId: string | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Cargar eventos ──────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("group_id", groupId)
      .order("date", { ascending: true })
      .order("time", { ascending: true, nullsFirst: false });

    if (!error && data) {
      setEvents(data as Event[]);
    }
    setIsLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Realtime subscription ───────────────────
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`events:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => {
              const newEvent = payload.new as Event;
              const updated = [...prev, newEvent].sort((a, b) =>
                a.date.localeCompare(b.date)
              );
              return updated;
            });
          } else if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((e) =>
                e.id === (payload.new as Event).id
                  ? (payload.new as Event)
                  : e
              )
            );
          } else if (payload.eventType === "DELETE") {
            setEvents((prev) =>
              prev.filter((e) => e.id !== (payload.old as Event).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  // ── Crear evento ────────────────────────────
  const createEvent = useCallback(
    async (input: CreateEventInput): Promise<Event | null> => {
      if (!groupId || !userId) return null;

      const { data, error } = await supabase
        .from("events")
        .insert({
          group_id: groupId,
          created_by: userId,
          title: input.title,
          date: input.date,
          priority: input.priority,
          assigned_to: input.assigned_to,
          description: input.description || null,
          time: input.time || null,
          recurrence: input.recurrence ?? "none",
          category: input.category ?? null,
        })
        .select()
        .single();

      if (error) {
        toast.error("Error al crear el evento");
        return null;
      }

      toast.success("Evento creado ✓");
      return data as Event;
    },
    [groupId, userId]
  );

  // ── Actualizar evento ───────────────────────
  const updateEvent = useCallback(
    async (input: UpdateEventInput): Promise<boolean> => {
      const { id, ...updates } = input;

      const { error } = await supabase
        .from("events")
        .update({
          ...updates,
          description: updates.description || null,
          time: updates.time || null,
        })
        .eq("id", id);

      if (error) {
        toast.error("Error al actualizar el evento");
        return false;
      }

      toast.success("Evento actualizado ✓");
      return true;
    },
    []
  );

  // ── Eliminar evento ─────────────────────────
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      toast.error("Error al eliminar el evento");
      return false;
    }

    toast.success("Evento eliminado");
    return true;
  }, []);

  // ── Helpers de vista ────────────────────────

  // Eventos del mes actual
  function getEventsForMonth(year: number, month: number): Event[] {
    const pad = (n: number) => String(n).padStart(2, "0");
    const prefix = `${year}-${pad(month + 1)}`;
    return events.filter((e) => e.date.startsWith(prefix));
  }

  // Eventos de un día específico
  function getEventsForDate(dateStr: string): Event[] {
    return events.filter((e) => e.date === dateStr);
  }

  // Próximos N eventos desde hoy
  function getUpcomingEvents(limit = 5): Event[] {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.date >= today)
      .slice(0, limit);
  }

  return {
    events,
    isLoading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForMonth,
    getEventsForDate,
    getUpcomingEvents,
  };
}
