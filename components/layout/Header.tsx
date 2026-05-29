"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// APP HEADER
// ─────────────────────────────────────────────

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
  className,
  transparent = false,
}: AppHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 safe-top",
        !transparent && "bg-app/80 backdrop-blur-md border-b border-default",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 min-h-[60px]">
        {/* Izquierda: back o espacio */}
        <div className="w-10">
          {showBack && (
            <motion.button
              onClick={handleBack}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-2 text-secondary"
            >
              <ChevronLeft size={18} />
            </motion.button>
          )}
        </div>

        {/* Centro: título */}
        {(title || subtitle) && (
          <div className="text-center flex-1 mx-3">
            {title && (
              <h1 className="text-sm font-semibold text-primary leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        )}

        {/* Derecha: acción */}
        <div className="w-10 flex justify-end">
          {right}
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// HOME HEADER — header especial para la pantalla principal
// ─────────────────────────────────────────────

interface HomeHeaderProps {
  username: string;
  groupName: string;
  partnerUsername?: string | null;
  right?: React.ReactNode;
}

export function HomeHeader({
  username,
  groupName,
  partnerUsername,
  right,
}: HomeHeaderProps) {
  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-20 safe-top bg-app/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-4">
        {/* Saludo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-muted">{greeting}</p>
          <h1 className="text-lg font-semibold text-primary leading-tight mt-0.5">
            {username}
            {partnerUsername && (
              <span className="text-[var(--purple)] ml-1">
                & {partnerUsername}
              </span>
            )}
          </h1>
        </motion.div>

        {/* Avatar grupo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          {right}
          <div className="w-9 h-9 rounded-xl bg-[var(--purple)]/10 flex items-center justify-center">
            <span className="text-base">👫</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días ☀️";
  if (h < 19) return "Buenas tardes 🌤️";
  return "Buenas noches 🌙";
}
