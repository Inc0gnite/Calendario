"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  emoji = "📭",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      <span className="text-4xl mb-4">{emoji}</span>
      <h3 className="text-sm font-semibold text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted max-w-[200px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SKELETON — placeholder de carga
// ─────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const roundedMap = {
    sm: "rounded-md",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "bg-surface-2 animate-pulse",
        roundedMap[rounded],
        className
      )}
    />
  );
}

// ─────────────────────────────────────────────
// SKELETON DE EVENTO
// ─────────────────────────────────────────────

export function EventSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-default p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-14" rounded="full" />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// ─────────────────────────────────────────────
// FULL PAGE LOADER
// ─────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-10 h-10 rounded-2xl bg-[var(--blue)] flex items-center justify-center">
          <span className="text-xl">📅</span>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-[var(--blue)] border-t-transparent animate-spin" />
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("h-px bg-border", className)} />
  );
}
