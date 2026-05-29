"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { HomeHeader, BottomNav } from "@/components/layout";
import { Calendar } from "@/components/calendar/Calendar";
import { UpcomingEvents } from "@/components/events/UpcomingEvents";
import { DayEventsSheet } from "@/components/events/DayEventsSheet";
import { Section } from "@/components/ui/Card";
import { EventSkeleton } from "@/components/ui/EmptyState";
import { useSession } from "@/hooks/useSession";
import { useEvents } from "@/hooks/useEvents";
import { useHolidays } from "@/hooks/useHolidays";
import { toDateString } from "@/lib/utils/helpers";

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const { user, group, username, partnerUsername } = useSession();
  const router = useRouter();

  const { events, isLoading, getEventsForDate, getUpcomingEvents } = useEvents(
    group?.id ?? null,
    user?.id ?? null
  );

  const [currentYear] = useState(new Date().getFullYear());
  const { holidays, isHoliday } = useHolidays(currentYear);

  // Estado del calendario
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);

  // Eventos del día seleccionado
  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate)
    : [];
  const selectedHoliday = selectedDate ? isHoliday(selectedDate) : null;

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setIsDaySheetOpen(true);
  }

  function handleCreateEvent() {
    if (selectedDate) {
      router.push(`/events/create?date=${selectedDate}`);
    } else {
      router.push("/events/create");
    }
  }

  const upcomingEvents = getUpcomingEvents(15);

  return (
    <div className="min-h-screen bg-app pb-28">
      {/* Header */}
      <HomeHeader
        username={username ?? ""}
        groupName={group?.name ?? ""}
        partnerUsername={partnerUsername}
      />

      {/* Contenido */}
      <main className="px-4 space-y-6 pt-4">
        {/* Calendario */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Calendar
            events={events}
            holidays={holidays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </motion.div>

        {/* Código del grupo — solo si no hay pareja */}
        {!partnerUsername && group?.code && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[var(--purple)]/8 border border-[var(--purple)]/20 rounded-2xl p-4"
          >
            <p className="text-xs text-[var(--purple)] font-medium mb-1">
              Invita a tu pareja
            </p>
            <p className="text-xs text-secondary mb-2">
              Comparte este código para que se una:
            </p>
            <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-2.5">
              <span className="font-mono font-bold text-lg tracking-widest text-[var(--purple)]">
                {group.code}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(group.code);
                }}
                className="text-xs text-[var(--blue)] font-medium"
              >
                Copiar
              </button>
            </div>
          </motion.div>
        )}

        {/* Próximos eventos */}
        <Section title="Próximos eventos">
          {isLoading ? (
            <div className="space-y-2">
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </div>
          ) : (
            <UpcomingEvents
              events={upcomingEvents}
              onEventClick={(event) => {
                router.push(`/events/edit?id=${event.id}`);
              }}
              username={username ?? undefined}
              partnerUsername={partnerUsername ?? undefined}
            />
          )}
        </Section>
      </main>

      {/* Bottom Nav con FAB */}
      <BottomNav onCreateEvent={handleCreateEvent} />

      {/* Sheet de día seleccionado */}
      <DayEventsSheet
        isOpen={isDaySheetOpen}
        onClose={() => setIsDaySheetOpen(false)}
        date={selectedDate}
        events={selectedDateEvents}
        onEventClick={(event) => {
          router.push(`/events/edit?id=${event.id}`);
        }}
        onCreateEvent={handleCreateEvent}
        username={username ?? undefined}
        partnerUsername={partnerUsername ?? undefined}
        holiday={selectedHoliday}
      />
    </div>
  );
}
