// ─────────────────────────────────────────────────────────────
// Tipos generados que reflejan el schema de Supabase
// Sincronizados manualmente con las migraciones SQL
// ─────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ── groups ──────────────────────────────
      groups: {
        Row: {
          id: string;
          name: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          created_at?: string;
        };
      };

      // ── users ───────────────────────────────
      users: {
        Row: {
          id: string;
          group_id: string;
          username: string;
          whatsapp_number: string | null;
          slot: 1 | 2;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          username: string;
          whatsapp_number?: string | null;
          slot?: 1 | 2;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          username?: string;
          whatsapp_number?: string | null;
          slot?: 1 | 2;
          created_at?: string;
        };
      };

      // ── events ──────────────────────────────
      events: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          title: string;
          date: string;
          priority: "low" | "medium" | "high";
          assigned_to: "user1" | "user2" | "both";
          description: string | null;
          time: string | null;
          recurrence: "none" | "monthly" | "yearly";
          category:
            | "appointment"
            | "payment"
            | "travel"
            | "birthday"
            | "task"
            | "outing"
            | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          title: string;
          date: string;
          priority?: "low" | "medium" | "high";
          assigned_to?: "user1" | "user2" | "both";
          description?: string | null;
          time?: string | null;
          recurrence?: "none" | "monthly" | "yearly";
          category?:
            | "appointment"
            | "payment"
            | "travel"
            | "birthday"
            | "task"
            | "outing"
            | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          title?: string;
          date?: string;
          priority?: "low" | "medium" | "high";
          assigned_to?: "user1" | "user2" | "both";
          description?: string | null;
          time?: string | null;
          recurrence?: "none" | "monthly" | "yearly";
          category?:
            | "appointment"
            | "payment"
            | "travel"
            | "birthday"
            | "task"
            | "outing"
            | null;
          updated_at?: string;
        };
      };

      // ── reminders ───────────────────────────
      reminders: {
        Row: {
          id: string;
          event_id: string;
          offset_type:
            | "same_day"
            | "1_day_before"
            | "1_week_before"
            | "1_month_before";
          scheduled_for: string;
          sent: boolean;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          offset_type:
            | "same_day"
            | "1_day_before"
            | "1_week_before"
            | "1_month_before";
          scheduled_for: string;
          sent?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          sent?: boolean;
          sent_at?: string | null;
        };
      };

      // ── weekly_summaries ────────────────────
      weekly_summaries: {
        Row: {
          id: string;
          group_id: string;
          week_start: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          week_start: string;
          sent_at?: string;
        };
        Update: never;
      };
    };

    // ── Funciones RPC ──────────────────────────
    Functions: {
      login_with_code: {
        Args: { p_code: string; p_username: string };
        Returns: Json;
      };
      create_group: {
        Args: { p_group_name: string; p_username: string; p_code?: string };
        Returns: Json;
      };
      set_session_user: {
        Args: { user_id: string };
        Returns: void;
      };
      get_partner: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      generate_group_code: {
        Args: Record<never, never>;
        Returns: string;
      };
    };

    Enums: {
      priority_level: "low" | "medium" | "high";
      recurrence_type: "none" | "monthly" | "yearly";
      assigned_to_type: "user1" | "user2" | "both";
      event_category:
        | "appointment"
        | "payment"
        | "travel"
        | "birthday"
        | "task"
        | "outing";
      reminder_offset:
        | "same_day"
        | "1_day_before"
        | "1_week_before"
        | "1_month_before";
    };
  };
}
