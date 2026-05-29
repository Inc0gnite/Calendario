import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),

  date: z
    .string()
    .min(1, "La fecha es obligatoria")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),

  priority: z.enum(["low", "medium", "high"], {
    required_error: "Selecciona una prioridad",
  }),

  assigned_to: z.enum(["user1", "user2", "both"], {
    required_error: "Selecciona a quién se asigna",
  }),

  // Opcionales — string vacío se convierte a null
  description: z.string().max(500, "Máximo 500 caracteres").optional(),

  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato HH:MM")
    .optional()
    .or(z.literal("")),

  recurrence: z.enum(["none", "monthly", "yearly"]).default("none"),

  category: z
    .enum(["appointment", "payment", "travel", "birthday", "task", "outing"])
    .nullable()
    .optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
