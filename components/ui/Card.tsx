"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  pressable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  className,
  onClick,
  pressable = false,
  padding = "md",
}: CardProps) {
  const base = cn(
    "bg-surface rounded-2xl border border-default shadow-soft",
    paddingStyles[padding],
    (pressable || onClick) && "cursor-pointer",
    className
  );

  if (pressable || onClick) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base}>{children}</div>;
}

// ─────────────────────────────────────────────
// SECTION — card con título opcional
// ─────────────────────────────────────────────

interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, action, children, className }: SectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-1">
          {title && (
            <h2 className="text-sm font-semibold text-primary">{title}</h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
