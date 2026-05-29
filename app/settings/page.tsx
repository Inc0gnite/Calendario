"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Copy, Check, Phone, User, Users } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppHeader } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, Section } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useSession } from "@/hooks/useSession";
import { updateWhatsAppNumber, updateUsername } from "@/lib/supabase/auth";
import { formatWhatsAppNumber, isValidPhoneNumber } from "@/lib/utils/helpers";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user, group, username, partnerUsername, groupCode, logout } = useSession();
  const router = useRouter();

  const [newUsername, setNewUsername] = useState(username ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp_number ?? "");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ── Copiar código ──────────────────────────
  async function handleCopyCode() {
    if (!groupCode) return;
    await navigator.clipboard.writeText(groupCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success("Código copiado");
  }

  // ── Guardar username ───────────────────────
  async function handleSaveUsername() {
    if (!user?.id || !newUsername.trim() || newUsername.trim() === username) return;
    setIsSavingUsername(true);
    try {
      await updateUsername(user.id, newUsername.trim());
      toast.success("Nombre actualizado");
    } catch {
      toast.error("Error al actualizar el nombre");
    } finally {
      setIsSavingUsername(false);
    }
  }

  // ── Guardar WhatsApp ───────────────────────
  async function handleSaveWhatsapp() {
    if (!user?.id || !whatsapp.trim()) return;
    if (!isValidPhoneNumber(whatsapp)) {
      toast.error("Número inválido. Incluye el código de país (ej: +56912345678)");
      return;
    }
    setIsSavingWhatsapp(true);
    try {
      await updateWhatsAppNumber(user.id, formatWhatsAppNumber(whatsapp));
      toast.success("WhatsApp guardado");
    } catch {
      toast.error("Error al guardar el número");
    } finally {
      setIsSavingWhatsapp(false);
    }
  }

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="min-h-screen bg-app pb-28">
      <AppHeader title="Ajustes" />

      <main className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >

          {/* ── Perfil ── */}
          <motion.div variants={itemVariants}>
            <Section title="Tu perfil">
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-default">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--blue)]/10 flex items-center justify-center">
                      <User size={22} className="text-[var(--blue)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{username}</p>
                      <p className="text-xs text-muted">
                        {partnerUsername
                          ? `Con ${partnerUsername}`
                          : "Sin pareja conectada aún"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="Tu nombre"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.slice(0, 20))}
                      placeholder="ej: Ana"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveUsername}
                      isLoading={isSavingUsername}
                      disabled={!newUsername.trim() || newUsername.trim() === username}
                    >
                      Actualizar nombre
                    </Button>
                  </div>
                </div>
              </Card>
            </Section>
          </motion.div>

          {/* ── WhatsApp ── */}
          <motion.div variants={itemVariants}>
            <Section title="WhatsApp">
              <Card>
                <div className="space-y-3">
                  <p className="text-xs text-muted">
                    Los recordatorios se enviarán a este número.
                  </p>
                  <Input
                    label="Número con código de país"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+56912345678"
                    type="tel"
                    icon={<Phone size={15} />}
                    hint="Formato: +56 9 XXXX XXXX (Chile)"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveWhatsapp}
                    isLoading={isSavingWhatsapp}
                    disabled={!whatsapp.trim()}
                  >
                    Guardar número
                  </Button>
                </div>
              </Card>
            </Section>
          </motion.div>

          {/* ── Grupo ── */}
          <motion.div variants={itemVariants}>
            <Section title="Tu grupo">
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--purple)]/10 flex items-center justify-center">
                      <Users size={18} className="text-[var(--purple)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{group?.name}</p>
                      <p className="text-xs text-muted">
                        {partnerUsername
                          ? `Tú y ${partnerUsername}`
                          : "Esperando al segundo miembro"}
                      </p>
                    </div>
                  </div>

                  {/* Código */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                      Código del grupo
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-surface-2 rounded-xl px-4 py-3 border border-default">
                        <span className="font-mono font-bold text-lg tracking-widest text-[var(--purple)]">
                          {groupCode}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="w-12 h-12 rounded-xl bg-[var(--purple)]/10 flex items-center justify-center text-[var(--purple)] transition-colors hover:bg-[var(--purple)]/20"
                      >
                        {codeCopied
                          ? <Check size={18} />
                          : <Copy size={18} />}
                      </button>
                    </div>
                    {!partnerUsername && (
                      <p className="text-xs text-muted">
                        Comparte este código con tu pareja para que se una.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Section>
          </motion.div>

          {/* ── Cerrar sesión ── */}
          <motion.div variants={itemVariants}>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowLogoutConfirm(true)}
              icon={<LogOut size={16} />}
              className="text-[var(--red)] hover:bg-[var(--red)]/8"
            >
              Cerrar sesión
            </Button>
          </motion.div>

        </motion.div>
      </main>

      <BottomNav />

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="¿Cerrar sesión?"
        description="Podrás volver a entrar con el código de tu grupo."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
