import { supabase } from "@/lib/supabase/client";
import type { Session, CreateGroupInput, LoginWithCodeInput } from "@/types";
import { SESSION_KEY } from "@/lib/utils/constants";

// ─────────────────────────────────────────────
// TIPOS INTERNOS
// ─────────────────────────────────────────────

interface AuthResult {
  session: Session;
  action: "login" | "register" | "created";
}

// ─────────────────────────────────────────────
// CREAR GRUPO (primer usuario)
// ─────────────────────────────────────────────

export async function createGroup(
  input: CreateGroupInput
): Promise<AuthResult> {
  const { data, error } = await supabase.rpc("create_group", {
    p_group_name: input.groupName.trim(),
    p_username: input.username.trim(),
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No se pudo crear el grupo");

  const result = data as {
    user: {
      id: string;
      group_id: string;
      username: string;
      whatsapp_number: string | null;
      slot: 1 | 2;
      created_at: string;
    };
    group: {
      id: string;
      name: string;
      code: string;
      created_at: string;
    };
    action: "created";
  };

  // Establecer contexto de sesión en Supabase
  await supabase.rpc("set_session_user", { user_id: result.user.id });

  const session: Session = {
    user: {
      id: result.user.id,
      group_id: result.user.group_id,
      username: result.user.username,
      whatsapp_number: result.user.whatsapp_number,
      created_at: result.user.created_at,
    },
    group: {
      id: result.group.id,
      name: result.group.name,
      code: result.group.code,
      user1_id: result.user.id,
      user2_id: null,
      created_at: result.group.created_at,
    },
    partnerUsername: null,
  };

  saveSession(session);
  return { session, action: "created" };
}

// ─────────────────────────────────────────────
// UNIRSE / LOGIN CON CÓDIGO
// ─────────────────────────────────────────────

export async function loginWithCode(
  input: LoginWithCodeInput
): Promise<AuthResult> {
  const { data, error } = await supabase.rpc("login_with_code", {
    p_code: input.code.trim().toUpperCase(),
    p_username: input.username.trim(),
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Respuesta inválida del servidor");

  const result = data as {
    user: {
      id: string;
      group_id: string;
      username: string;
      whatsapp_number: string | null;
      slot: 1 | 2;
      created_at: string;
    };
    group: {
      id: string;
      name: string;
      code: string;
      created_at: string;
    };
    action: "login" | "register";
  };

  // Establecer contexto de sesión en Supabase
  await supabase.rpc("set_session_user", { user_id: result.user.id });

  // Obtener pareja
  const { data: partnerData } = await supabase.rpc("get_partner", {
    p_user_id: result.user.id,
  });

  const partner = partnerData as { id: string; username: string; slot: number } | null;

  const session: Session = {
    user: {
      id: result.user.id,
      group_id: result.user.group_id,
      username: result.user.username,
      whatsapp_number: result.user.whatsapp_number,
      created_at: result.user.created_at,
    },
    group: {
      id: result.group.id,
      name: result.group.name,
      code: result.group.code,
      user1_id: result.user.slot === 1 ? result.user.id : (partner?.id ?? null),
      user2_id: result.user.slot === 2 ? result.user.id : (partner?.id ?? null),
      created_at: result.group.created_at,
    },
    partnerUsername: partner?.username ?? null,
  };

  saveSession(session);
  return { session, action: result.action };
}

// ─────────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────────

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ─────────────────────────────────────────────
// SESIÓN LOCAL (localStorage)
// ─────────────────────────────────────────────

export function saveSession(session: Session): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR NÚMERO WHATSAPP
// ─────────────────────────────────────────────

export async function updateWhatsAppNumber(
  userId: string,
  whatsappNumber: string
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ whatsapp_number: whatsappNumber })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  // Actualizar sesión local
  const session = loadSession();
  if (session) {
    session.user.whatsapp_number = whatsappNumber;
    saveSession(session);
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR USERNAME
// ─────────────────────────────────────────────

export async function updateUsername(
  userId: string,
  newUsername: string
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ username: newUsername.trim() })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  const session = loadSession();
  if (session) {
    session.user.username = newUsername.trim();
    saveSession(session);
  }
}
