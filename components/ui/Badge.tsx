import { cn } from "@/lib/utils";
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  ASSIGNED_TO_LABELS,
} from "@/lib/utils/constants";
import type { Priority, EventCategory, AssignedTo } from "@/types";

// ─────────────────────────────────────────────
// BADGE BASE
// ─────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  color?: string; // hex
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  color,
  className,
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={
        color
          ? {
              backgroundColor: `${color}18`,
              color: color,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// BADGE DE PRIORIDAD
// ─────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color = PRIORITY_COLORS[priority];
  const label = PRIORITY_LABELS[priority];

  return (
    <Badge color={color}>
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// BADGE DE CATEGORÍA
// ─────────────────────────────────────────────

export function CategoryBadge({
  category,
}: {
  category: NonNullable<EventCategory>;
}) {
  const label = CATEGORY_LABELS[category];
  const emoji = CATEGORY_EMOJIS[category];

  return (
    <Badge className="bg-surface-2 text-secondary">
      <span>{emoji}</span>
      {label}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// BADGE DE ASIGNADO
// ─────────────────────────────────────────────

interface AssignedBadgeProps {
  assignedTo: AssignedTo;
  username?: string;
  partnerUsername?: string;
}

export function AssignedBadge({
  assignedTo,
  username,
  partnerUsername,
}: AssignedBadgeProps) {
  const colorMap: Record<AssignedTo, string> = {
    user1: "#5B8DEF",
    user2: "#A78BFA",
    both: "#5EC7A1",
  };

  const labelMap: Record<AssignedTo, string> = {
    user1: username ?? "Tú",
    user2: partnerUsername ?? "Tu pareja",
    both: "Ambos",
  };

  return (
    <Badge color={colorMap[assignedTo]}>{labelMap[assignedTo]}</Badge>
  );
}

// ─────────────────────────────────────────────
// DOT DE PRIORIDAD (para el calendario)
// ─────────────────────────────────────────────

export function PriorityDot({ priority }: { priority: Priority }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: PRIORITY_COLORS[priority] }}
    />
  );
}
