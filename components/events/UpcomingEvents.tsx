"use client";

import { motion } from "framer-motion";
import { formatDate, getDayName, isToday, sortEventsByTime } from "@/lib/utils/helpers";
import { groupEventsByDate } from "@/lib/utils/helpers";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

// ─────────────────────────────────────────────
// UPCOMING EVENTS
// ─────────────────────────────────────────────

interface UpcomingEventsProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  username?: string;
  partnerUsername?: string;
  limit?: number;
}

export function UpcomingEvents({
  events,
  onEventClick,
  username,
  partnerUsername,
  limit = 10,
}: UpcomingEventsProps) {
  const today = new Date().toISOString().split("T")[0];

  // Filtrar solo eventos desde hoy
  const upcoming = events
    .filter((e) => e.date >= today)
    .slice(0, limit);

  if (upcoming.length === 0) {
    return (
      <EmptyState
        emoji="🌿"
        title="Sin eventos próximos"
        description="Todo tranquilo por ahora"
      />
    );
  }

  // Agrupar por fecha
  const grouped = groupEventsByDate(upcoming);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-5">
      {sortedDates.map((dateStr, groupIndex) => {
        const dayEvents = sortEventsByTime(grouped[dateStr]);
        const dayName = isToday(dateStr) ? "Hoy" : getDayName(dateStr);
        const dateLabel = isToday(dateStr) ? "" : formatDate(dateStr);

        return (
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: groupIndex * 0.06 }}
            className="space-y-2"
          >
            {/* Etiqueta de fecha */}
            <div className="flex items-baseline gap-2 px-1">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isToday(dateStr) ? "text-[var(--blue)]" : "text-primary"
                )}
              >
                {dayName}
              </span>
              {dateLabel && (
                <span className="text-xs text-muted">{dateLabel}</span>
              )}
            </div>

            {/* Eventos del día */}
            <div className="space-y-2">
              {dayEvents.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick ? () => onEventClick(event) : undefined}
                  username={username}
                  partnerUsername={partnerUsername}
                  index={i}
                  animate={false}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
