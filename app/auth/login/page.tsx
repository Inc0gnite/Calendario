"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createGroup, loginWithCode } from "@/lib/supabase/auth";
import { useAuth } from "@/components/layout/AuthProvider";
import { generateGroupCode } from "@/lib/utils/helpers";

type Tab = "join" | "create";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("join");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setSession } = useAuth();

  // ── Formulario Unirse ──
  const [joinCode, setJoinCode] = useState("");
  const [joinUsername, setJoinUsername] = useState("");

  // ── Formulario Crear ──
  const [groupName, setGroupName] = useState("");
  const [createUsername, setCreateUsername] = useState("");

  // ─────────────────────────────────────────────
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim() || !joinUsername.trim()) return;

    setIsLoading(true);
    try {
      const { session } = await loginWithCode({
        code: joinCode.trim(),
        username: joinUsername.trim(),
      });
      setSession(session);

      // Guardar cookie para middleware
      document.cookie = `agenda_session=1; path=/; max-age=${60 * 60 * 24 * 30}`;

      toast.success(`¡Bienvenido, ${session.user.username}!`);
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setIsLoading(false);
    }
  }

  // ─────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim() || !createUsername.trim()) return;

    setIsLoading(true);
    try {
      const { session } = await createGroup({
        groupName: groupName.trim(),
        username: createUsername.trim(),
      });
      setSession(session);

      document.cookie = `agenda_session=1; path=/; max-age=${60 * 60 * 24 * 30}`;

      toast.success(`Grupo creado. Código: ${session.group.code}`);
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear grupo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-5">
      {/* Logo / título */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--blue)] flex items-center justify-center mx-auto mb-4 shadow-card">
          <span className="text-2xl">📅</span>
        </div>
        <h1 className="text-2xl font-semibold text-primary tracking-tight">
          Agenda
        </h1>
        <p className="text-sm text-secondary mt-1">Tu agenda compartida</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm bg-surface rounded-2xl shadow-card overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-default">
          {(["join", "create"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "text-[var(--blue)] border-b-2 border-[var(--blue)]"
                  : "text-secondary"
              }`}
            >
              {t === "join" ? "Unirse" : "Crear grupo"}
            </button>
          ))}
        </div>

        {/* Formularios */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {tab === "join" ? (
              <motion.form
                key="join"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleJoin}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-secondary uppercase tracking-wide block mb-1.5">
                    Código de grupo
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                    }
                    placeholder="AB3K9Z"
                    maxLength={6}
                    autoCapitalize="characters"
                    className="w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted border border-default focus:outline-none focus:border-[var(--blue)] transition-colors font-mono tracking-widest"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary uppercase tracking-wide block mb-1.5">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={joinUsername}
                    onChange={(e) => setJoinUsername(e.target.value.slice(0, 20))}
                    placeholder="ej: Ana"
                    className="w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted border border-default focus:outline-none focus:border-[var(--blue)] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !joinCode || !joinUsername}
                  className="w-full bg-[var(--blue)] text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="create"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleCreate}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-secondary uppercase tracking-wide block mb-1.5">
                    Nombre del grupo
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value.slice(0, 30))}
                    placeholder="ej: Nico y Ana"
                    className="w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted border border-default focus:outline-none focus:border-[var(--blue)] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary uppercase tracking-wide block mb-1.5">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) =>
                      setCreateUsername(e.target.value.slice(0, 20))
                    }
                    placeholder="ej: Nico"
                    className="w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted border border-default focus:outline-none focus:border-[var(--blue)] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !groupName || !createUsername}
                  className="w-full bg-[var(--green)] text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isLoading ? "Creando..." : "Crear grupo"}
                </button>

                <p className="text-xs text-center text-muted">
                  Se generará un código para que tu pareja se una
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <p className="mt-6 text-xs text-muted text-center">
        Sin contraseñas. Solo un código compartido.
      </p>
    </div>
  );
}
