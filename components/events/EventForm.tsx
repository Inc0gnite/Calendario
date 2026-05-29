"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SegmentedControl } from "@/components/ui/Select";
import { eventSchema, type EventFormValues } from "@/lib/utils/eventSchema";
import {
  PRIORITY_OPTIONS,
  RECURRENCE_OPTIONS,
  CATEGORY_OPTIONS,
  CATEGORY_EMOJIS,
} from "@/lib/utils/constants";
import type { Event, Priority, RecurrenceType, EventCategory } from "@/types";
import { getTodayString } from "@/lib/utils/helpers";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  initialDate?: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  username?: string;
  partnerUsername?: string;
  submitLabel?: string;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export function EventForm({
  initialValues,
  initialDate,
  onSubmit,
  onCancel,
  isLoading = false,
  username = "Tú",
  partnerUsername = "Tu pareja",
  submitLabel = "Guardar",
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      date: initialValues?.date ?? initialDate ?? getTodayString(),
      priority: initialValues?.priority ?? "medium",
      assigned_to: initialValues?.assigned_to ?? "both",
      description: initialValues?.description ?? "",
      time: initialValues?.time ?? "",
      recurrence: initialValues?.recurrence ?? "none",
      category: initialValues?.category ?? null,
    },
  });

  // Opciones de asignado con nombres reales
  const assignedOptions = [
    { label: username, value: "user1" },
    { label: "Ambos", value: "both" },
    { label: partnerUsername, value: "user2" },
  ];

  const categoryOptions = [
    { label: "Ninguna", value: null },
    ...CATEGORY_OPTIONS.map((o) => ({
      label: `${CATEGORY_EMOJIS[o.value as NonNullable<EventCategory>]} ${o.label}`,
      value: o.value,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Input
          label="Nombre del evento"
          placeholder="ej: Dentista, Pagar cuenta de luz..."
          error={errors.title?.message}
          autoFocus
          {...register("title")}
        />
      </motion.div>

      {/* Fecha y Hora */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="grid grid-cols-2 gap-3"
      >
        <Input
          label="Fecha"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />
        <Input
          label="Hora (opcional)"
          type="time"
          error={errors.time?.message}
          {...register("time")}
        />
      </motion.div>

      {/* Prioridad */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.08 }}
      >
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              label="Prioridad"
              value={field.value}
              onChange={(v) => field.onChange(v)}
              options={[
                {
                  label: "Baja",
                  value: "low",
                  color: "#5EC7A1",
                },
                {
                  label: "Media",
                  value: "medium",
                  color: "#5B8DEF",
                },
                {
                  label: "Alta",
                  value: "high",
                  color: "#F97373",
                },
              ]}
            />
          )}
        />
      </motion.div>

      {/* Asignado a */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.11 }}
      >
        <Controller
          name="assigned_to"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              label="Asignado a"
              value={field.value}
              onChange={(v) => field.onChange(v)}
              options={assignedOptions}
            />
          )}
        />
      </motion.div>

      {/* Categoría */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.14 }}
      >
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              label="Categoría (opcional)"
              options={categoryOptions as any}
              value={field.value as string}
              onChange={(v) => field.onChange(v === "null" ? null : v)}
              placeholder="Sin categoría"
            />
          )}
        />
      </motion.div>

      {/* Recurrencia */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.17 }}
      >
        <Controller
          name="recurrence"
          control={control}
          render={({ field }) => (
            <Select
              label="Repetición"
              options={RECURRENCE_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
      </motion.div>

      {/* Descripción */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <Textarea
          label="Descripción (opcional)"
          placeholder="Detalles adicionales..."
          error={errors.description?.message}
          rows={3}
          {...register("description")}
        />
      </motion.div>

      {/* Botones */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.23 }}
        className="flex gap-3 pt-2"
      >
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </motion.div>
    </form>
  );
}
