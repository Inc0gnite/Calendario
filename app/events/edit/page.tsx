"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppHeader } from "@/components/layout/Header";
import { EventForm } from "@/components/events/EventForm";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/EmptyState";
import { ReminderSelector } from "@/components/events/ReminderSelector";
import { useSession } from "@/hooks/useSession";
import { useEvents } from "@/hooks/useEvents";
import type { EventFormValues } from "@/lib/utils/eventSchema";
import type { Event } from "@/types";

export default function EditEventPage() {
  return (
    <ProtectedRoute>
      <EditEventContent />
    </ProtectedRoute>
  );
}

function EditEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const { user, group, username, partnerUsername } = useSession();
  const { events, isLoading, updateEvent, deleteEvent } = useEvents(
    group?.id ?? null,
    user?.id ?? null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const event = events.find((e) => e.id === eventId) as Event | undefined;

  // Si no encontró el evento y ya cargó → volver
  useEffect(() => {
    if (!isLoading && !event && eventId) {
      router.back();
    }
  }, [isLoading, event, eventId, router]);

  if (isLoading || !event) return <PageLoader />;

  async function handleSubmit(values: EventFormValues) {
    if (!eventId) return;
    setIsSaving(true);
    const ok = await updateEvent({
      id: eventId,
      title: values.title,
      date: values.date,
      priority: values.priority,
      assigned_to: values.assigned_to,
      description: values.description || undefined,
      time: values.time || undefined,
      recurrence: values.recurrence,
      category: values.category ?? null,
    });
    setIsSaving(false);
    if (ok) router.back();
  }

  async function handleDelete() {
    if (!eventId) return;
    setIsDeleting(true);
    const ok = await deleteEvent(eventId);
    setIsDeleting(false);
    if (ok) router.push("/home");
  }

  return (
    <div className="min-h-screen bg-app">
      <AppHeader
        title="Editar evento"
        showBack
        right={
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--red)] hover:bg-[var(--red)]/10 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        }
      />

      <main className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <EventForm
          initialValues={{
            title: event.title,
            date: event.date,
            priority: event.priority,
            assigned_to: event.assigned_to,
            description: event.description ?? "",
            time: event.time ?? "",
            recurrence: event.recurrence,
            category: event.category,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isSaving}
          username={username ?? "Tú"}
          partnerUsername={partnerUsername ?? "Tu pareja"}
          submitLabel="Guardar cambios"
        />

        {/* Recordatorios personalizados */}
        <ReminderSelector
          eventId={event.id}
          eventDate={event.date}
          eventTime={event.time}
        />
      </main>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar evento?"
        description={`"${event.title}" se eliminará permanentemente.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
