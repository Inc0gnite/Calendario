"use client";

import { BottomSheet } from "@/components/ui/Modal";
import { EventList } from "./EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDayName, formatDate, isToday, sortEventsByTime } from "@/lib/utils/helpers";
import type { Event } from "@/types";

// ─────────────────────────────────────────────
// DAY EVENTS SHEET
// ─────────────────────────────────────────────

interface DayEventsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  events: Event[];
  onEventClick?: (event: Event) => void;
  onCreateEvent?: () => void;
  username?: string;
  partnerUsername?: string;
  holiday?: { name: string } | null;
}

export function DayEventsSheet({
  isOpen,
  onClose,
  date,
  events,
  onEventClick,
  onCreateEvent,
  username,
  partnerUsername,
  holiday,
}: DayEventsSheetProps) {
  if (!date) return null;

  const sortedEvents = sortEventsByTime(events);
  const dayName = isToday(date) ? "Hoy" : getDayName(date);
  const dateLabel = formatDate(date);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`${dayName} · ${dateLabel}`}
    >
      <div className="space-y-4 pb-2">
        {/* Feriado */}
        {holiday && (
          <div className="flex items-center gap-2 bg-[var(--red)]/8 rounded-xl px-3 py-2">
            <span className="text-sm">🇨🇱</span>
            <span className="text-xs font-medium text-[var(--red)]">
              {holiday.name}
            </span>
          </div>
        )}

        {/* Lista de eventos */}
        {sortedEvents.length > 0 ? (
          <EventList
            events={sortedEvents}
            onEventClick={(event) => {
              onEventClick?.(event);
              onClose();
            }}
            username={username}
            partnerUsername={partnerUsername}
          />
        ) : (
          <EmptyState
            emoji="✨"
            title="Sin eventos este día"
            description="Toca el botón + para agregar uno"
          />
        )}

        {/* Botón crear */}
        {onCreateEvent && (
          <button
            onClick={() => {
              onCreateEvent();
              onClose();
            }}
            className="w-full py-3 rounded-xl border border-dashed border-default text-sm text-muted hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors"
          >
            + Agregar evento
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
