"use client";

import { motion } from "framer-motion";
import { Clock, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityDot, CategoryBadge, AssignedBadge } from "@/components/ui/Badge";
import { PRIORITY_COLORS, RECURRENCE_LABELS, CATEGORY_EMOJIS } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/helpers";
import type { Event } from "@/types";

// ─────────────────────────────────────────────
// EVENT CARD
// ─────────────────────────────────────────────

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  username?: string;
  partnerUsername?: string;
  showDate?: boolean;
  animate?: boolean;
  index?: number;
}

export function EventCard({
  event,
  onClick,
  username,
  partnerUsername,
  showDate = false,
  animate = true,
  index = 0,
}: EventCardProps) {
  const priorityColor = PRIORITY_COLORS[event.priority];
  const categoryEmoji = event.category ? CATEGORY_EMOJIS[event.category] : null;

  const card = (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface rounded-2xl border border-default p-4 space-y-2.5",
        "relative overflow-hidden",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform"
      )}
    >
      {/* Barra de color por prioridad */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: priorityColor }}
      />

      {/* Contenido con padding izquierdo por la barra */}
      <div className="pl-3 space-y-2">
        {/* Fila principal: título + emoji categoría */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {categoryEmoji && (
              <span className="text-base flex-shrink-0">{categoryEmoji}</span>
            )}
            <h3 className="text-sm font-semibold text-primary truncate">
              {event.title}
            </h3>
          </div>
          <AssignedBadge
            assignedTo={event.assigned_to}
            username={username}
            partnerUsername={partnerUsername}
          />
        </div>

        {/* Fila meta: hora + recurrencia */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Hora — solo si existe */}
          {event.time && (
            <span className="flex items-center gap-1 text-xs text-secondary">
              <Clock size={11} />
              {formatTime(event.time)}
            </span>
          )}

          {/* Recurrencia — solo si no es "none" */}
          {event.recurrence !== "none" && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Repeat size={11} />
              {RECURRENCE_LABELS[event.recurrence]}
            </span>
          )}

          {/* Punto de prioridad */}
          <PriorityDot priority={event.priority} />
        </div>

        {/* Descripción — solo si existe */}
        {event.description && (
          <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );

  if (!animate) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      {card}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// EVENT LIST — lista de eventos de un día
// ─────────────────────────────────────────────

interface EventListProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  username?: string;
  partnerUsername?: string;
  emptyMessage?: string;
}

export function EventList({
  events,
  onEventClick,
  username,
  partnerUsername,
  emptyMessage,
}: EventListProps) {
  if (events.length === 0 && emptyMessage) {
    return (
      <p className="text-xs text-center text-muted py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={onEventClick ? () => onEventClick(event) : undefined}
          username={username}
          partnerUsername={partnerUsername}
          index={i}
        />
      ))}
    </div>
  );
}
