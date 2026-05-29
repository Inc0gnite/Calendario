"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import type { Session, User, Group } from "@/types";

// ─────────────────────────────────────────────
// Hook principal de sesión
// ─────────────────────────────────────────────

export function useSession() {
  const { session, isLoading, isAuthenticated, logout, refreshPartner } =
    useAuth();

  return {
    session,
    user: session?.user ?? null,
    group: session?.group ?? null,
    partnerUsername: session?.partnerUsername ?? null,
    isLoading,
    isAuthenticated,
    logout,
    refreshPartner,

    // Helpers convenientes
    userId: session?.user.id ?? null,
    groupId: session?.group.id ?? null,
    groupCode: session?.group.code ?? null,
    username: session?.user.username ?? null,
    whatsappNumber: session?.user.whatsapp_number ?? null,
    hasPartner: !!session?.partnerUsername,
  };
}

// ─────────────────────────────────────────────
// Hook para requerir sesión (redirige si no hay)
// ─────────────────────────────────────────────

export function useRequireSession(): {
  session: Session;
  user: User;
  group: Group;
} {
  const { session, isLoading } = useAuth();

  if (!isLoading && !session) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  return {
    session: session!,
    user: session!.user,
    group: session!.group,
  };
}
