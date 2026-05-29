"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: "/home",
    icon: CalendarDays,
    label: "Inicio",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Ajustes",
  },
];

interface BottomNavProps {
  onCreateEvent?: () => void;
}

export function BottomNav({ onCreateEvent }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-bottom">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-md border-t border-default" />

      <div className="relative flex items-center justify-around px-6 py-2">
        {/* Home */}
        <NavItem
          href={NAV_ITEMS[0].href}
          icon={<NAV_ITEMS[0].icon size={22} />}
          label={NAV_ITEMS[0].label}
          isActive={pathname === NAV_ITEMS[0].href || pathname.startsWith("/home")}
        />

        {/* FAB — Crear evento */}
        <motion.button
          onClick={onCreateEvent}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "w-14 h-14 rounded-2xl bg-[var(--blue)] text-white",
            "flex items-center justify-center shadow-float",
            "-mt-6"
          )}
          aria-label="Crear evento"
        >
          <Plus size={26} strokeWidth={2.5} />
        </motion.button>

        {/* Settings */}
        <NavItem
          href={NAV_ITEMS[1].href}
          icon={<NAV_ITEMS[1].icon size={22} />}
          label={NAV_ITEMS[1].label}
          isActive={pathname.startsWith("/settings")}
        />
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// NAV ITEM
// ─────────────────────────────────────────────

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 min-w-[56px] py-1"
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
          isActive
            ? "bg-[var(--blue)]/10 text-[var(--blue)]"
            : "text-muted"
        )}
      >
        {icon}
      </motion.div>
      <span
        className={cn(
          "text-[10px] font-medium transition-colors",
          isActive ? "text-[var(--blue)]" : "text-muted"
        )}
      >
        {label}
      </span>
    </Link>
  );
}
