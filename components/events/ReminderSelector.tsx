"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { REMINDER_OPTIONS, REMINDER_LABELS } from "@/lib/utils/constants";
import { getEventReminders, updateEventReminders } from "@/lib/supabase/reminders";
import type { ReminderOffset } from "@/types";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// REMINDER SELECTOR
// ─────────────────────────────────────────────

interface ReminderSelectorProps {
  eventId: string;
  eventDate: string;
  eventTime?: string | null;
}

export function ReminderSelector({
  eventId,
  eventDate,
  eventTime,
}: ReminderSelectorProps) {
  const [selected, setSelected] = useState<ReminderOffset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Cargar recordatorios existentes
  useEffect(() => {
    getEventReminders(eventId).then((reminders) => {
      setSelected(reminders.map((r) => r.offset_type));
      setIsLoading(false);
    });
  }, [eventId]);

  function toggleOffset(offset: ReminderOffset) {
    setSelected((prev) =>
      prev.includes(offset)
        ? prev.filter((o) => o !== offset)
        : [...prev, offset]
    );
  }

  async function handleSave() {
    setIsSaving(true);
    const ok = await updateEventReminders(
      eventId,
      eventDate,
      eventTime ?? null,
      selected
    );
    setIsSaving(false);
    if (ok) {
      toast.success("Recordatorios guardados");
      setIsExpanded(false);
    }
  }

  if (isLoading) return null;

  const hasCustom = selected.length > 0;

  return (
    <div className="space-y-2">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl",
          "border transition-colors text-sm",
          isExpanded
            ? "border-[var(--blue)] bg-[var(--blue)]/5"
            : "border-default bg-surface-2",
        )}
      >
        <span className="flex items-center gap-2 text-secondary">
          <Bell size={15} />
          {hasCustom
            ? `${selected.length} recordatorio${selected.length > 1 ? "s" : ""}`
            : "Recordatorios personalizados"}
        </span>
        <span className="text-xs text-muted">
          {isExpanded ? "Cerrar" : "Editar"}
        </span>
      </button>

      {/* Panel expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-surface border border-default rounded-xl p-4 space-y-3">
              <p className="text-xs text-muted">
                Si no seleccionas ninguno, se enviará un recordatorio el día anterior por defecto.
              </p>

              {/* Opciones */}
              <div className="space-y-2">
                {REMINDER_OPTIONS.map((opt) => {
                  const isActive = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleOffset(opt.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl",
                        "text-sm transition-colors border",
                        isActive
                          ? "border-[var(--blue)] bg-[var(--blue)]/8 text-[var(--blue)]"
                          : "border-default text-secondary hover:bg-surface-2"
                      )}
                    >
                      {REMINDER_LABELS[opt.value]}
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="primary"
                fullWidth
                size="sm"
                isLoading={isSaving}
                onClick={handleSave}
              >
                Guardar recordatorios
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
