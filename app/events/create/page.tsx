"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppHeader } from "@/components/layout/Header";
import { EventForm } from "@/components/events/EventForm";
import { useSession } from "@/hooks/useSession";
import { useEvents } from "@/hooks/useEvents";
import type { EventFormValues } from "@/lib/utils/eventSchema";

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  );
}

function CreateEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? undefined;

  const { user, group, username, partnerUsername } = useSession();
  const { createEvent } = useEvents(group?.id ?? null, user?.id ?? null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: EventFormValues) {
    setIsLoading(true);
    const event = await createEvent({
      title: values.title,
      date: values.date,
      priority: values.priority,
      assigned_to: values.assigned_to,
      description: values.description || undefined,
      time: values.time || undefined,
      recurrence: values.recurrence,
      category: values.category ?? null,
    });
    setIsLoading(false);
    if (event) router.back();
  }

  return (
    <div className="min-h-screen bg-app">
      <AppHeader title="Nuevo evento" showBack />
      <main className="px-4 py-5 max-w-lg mx-auto">
        <EventForm
          initialDate={initialDate}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          username={username ?? "Tú"}
          partnerUsername={partnerUsername ?? "Tu pareja"}
          submitLabel="Crear evento"
        />
      </main>
    </div>
  );
}
