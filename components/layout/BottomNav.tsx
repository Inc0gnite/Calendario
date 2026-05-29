"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onCreateEvent?: () => void;
}

export function BottomNav({ onCreateEvent }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 safe-bottom">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-gray-200" />
      <div className="relative flex items-center justify-around px-6 py-2">
        <NavItem
          href="/home"
          icon={<CalendarDays size={22} />}
          label="Inicio"
          isActive={pathname === "/home" || pathname.startsWith("/home")}
        />
        <motion.button
          onClick={onCreateEvent}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg -mt-6"
          aria-label="Crear evento"
        >
          <span className="text-2xl font-light">+</span>
        </motion.button>
        <NavItem
          href="/settings"
          icon={<Settings size={22} />}
          label="Ajustes"
          isActive={pathname.startsWith("/settings")}
        />
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 min-w-[56px] py-1">
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
          isActive ? "bg-blue-50 text-blue-500" : "text-gray-400"
        )}
      >
        {icon}
      </motion.div>
      <span className={cn("text-[10px] font-medium", isActive ? "text-blue-500" : "text-gray-400")}>
        {label}
      </span>
    </Link>
  );
}
