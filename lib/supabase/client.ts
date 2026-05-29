import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Revisa tu .env.local"
  );
}

// Cliente para uso en el frontend (browser)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No usamos Supabase Auth
  },
  global: {
    headers: {
      "x-app-name": "agenda-compartida",
    },
  },
});

// ─────────────────────────────────────────────
// Helpers tipados para las tablas principales
// ─────────────────────────────────────────────

export const db = {
  groups: () => supabase.from("groups"),
  users: () => supabase.from("users"),
  events: () => supabase.from("events"),
  reminders: () => supabase.from("reminders"),
  weeklySummaries: () => supabase.from("weekly_summaries"),
};
