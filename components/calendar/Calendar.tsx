"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildCalendarMonth, toDateString, isToday } from "@/lib/utils/helpers";
import { DAYS_SHORT, MONTHS, PRIORITY_COLORS } from "@/lib/utils/constants";
import type { Event, Holiday } from "@/types";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface CalendarProps {
  events: Event[];
  holidays: Holiday[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export function Calendar({
  events,
  holidays,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [direction, setDirection] = useState(0); // -1 prev, 1 next

  const calendarMonth = useMemo(
    () => buildCalendarMonth(year, month, events, holidays),
    [year, month, events, holidays]
  );

  function goToPrevMonth() {
    setDirection(-1);
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    setDirection(1);
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setDirection(0);
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    onSelectDate(toDateString(today));
  }

  const todayStr = toDateString(today);
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="bg-surface rounded-2xl border border-default shadow-soft overflow-hidden">
      {/* Header del calendario */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={goToPrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-surface-2 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={goToToday}
          className="flex items-center gap-1.5"
        >
          <span className="text-sm font-semibold text-primary capitalize">
            {MONTHS[month]} {year}
          </span>
          {!isCurrentMonth && (
            <span className="text-[10px] bg-[var(--blue)]/10 text-[var(--blue)] px-1.5 py-0.5 rounded-full font-medium">
              Hoy
            </span>
          )}
        </button>

        <button
          onClick={goToNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-surface-2 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 px-2 pb-1">
        {DAYS_SHORT.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 px-2 pb-3 gap-y-1"
        >
          {calendarMonth.days.map((day) => {
            const isSelected = day.date === selectedDate;
            const isCurrentDay = day.date === todayStr;
            const hasEvents = day.events.length > 0;
            const isHoliday = !!day.holiday;
            const highestPriority = getHighestPriority(day.events);

            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "w-full aspect-square rounded-xl transition-colors",
                  "focus:outline-none",
                  !day.isCurrentMonth && "opacity-25",
                  isSelected
                    ? "bg-[var(--blue)] text-white"
                    : isCurrentDay
                    ? "bg-[var(--blue)]/10 text-[var(--blue)]"
                    : day.isWeekend
                    ? "text-secondary"
                    : isHoliday
                    ? "text-[var(--red)]"
                    : "text-primary hover:bg-surface-2"
                )}
              >
                {/* Número del día */}
                <span
                  className={cn(
                    "text-xs font-medium leading-none",
                    isCurrentDay && !isSelected && "font-bold"
                  )}
                >
                  {new Date(day.date + "T12:00").getDate()}
                </span>

                {/* Indicador de eventos */}
                {hasEvents && (
                  <span
                    className={cn(
                      "absolute bottom-1 w-1 h-1 rounded-full",
                      isSelected ? "bg-white" : ""
                    )}
                    style={
                      !isSelected && highestPriority
                        ? { backgroundColor: PRIORITY_COLORS[highestPriority] }
                        : undefined
                    }
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getHighestPriority(
  events: Event[]
): "high" | "medium" | "low" | null {
  if (events.some((e) => e.priority === "high")) return "high";
  if (events.some((e) => e.priority === "medium")) return "medium";
  if (events.some((e) => e.priority === "low")) return "low";
  return null;
}
