"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/types";
import {
  loadSession,
  clearSession,
  logout as authLogout,
} from "@/lib/supabase/auth";
import { supabase } from "@/lib/supabase/client";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  logout: () => void;
  refreshPartner: () => Promise<void>;
}

// ─────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      setSessionState(stored);
      // Re-establecer contexto Supabase
      supabase.rpc("set_session_user", { user_id: stored.user.id }).then();
    }
    setIsLoading(false);
  }, []);

  const setSession = useCallback((newSession: Session | null) => {
    setSessionState(newSession);
    if (!newSession) clearSession();
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setSessionState(null);
    router.push("/auth/login");
  }, [router]);

  // Refresca datos de la pareja (por si se une después)
  const refreshPartner = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await supabase.rpc("get_partner", {
        p_user_id: session.user.id,
      });
      const partner = data as { username: string } | null;
      if (partner) {
        const updated: Session = {
          ...session,
          partnerUsername: partner.username,
        };
        setSessionState(updated);
        // Guardar actualización en localStorage
        const { saveSession } = await import("@/lib/supabase/auth");
        saveSession(updated);
      }
    } catch {
      // Silencioso — no crítico
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        setSession,
        logout,
        refreshPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
