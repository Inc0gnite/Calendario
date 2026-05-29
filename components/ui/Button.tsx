"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--blue)] text-white hover:bg-[#4a7de0] active:bg-[#3d70d3] shadow-soft",
  secondary:
    "bg-surface-2 text-primary border border-default hover:bg-[var(--border)] active:scale-95",
  ghost:
    "bg-transparent text-secondary hover:bg-surface-2 hover:text-primary active:bg-surface-2",
  danger:
    "bg-[var(--red)] text-white hover:bg-[#e85f5f] active:bg-[#d45050] shadow-soft",
  success:
    "bg-[var(--green)] text-white hover:bg-[#4db891] active:bg-[#3da882] shadow-soft",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-11 px-4 text-sm rounded-xl gap-2",
  lg: "h-13 px-6 text-base rounded-xl gap-2",
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={!isDisabled ? { scale: 0.96 } : undefined}
        transition={{ duration: 0.1 }}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <>
            <Spinner size={size} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children && <span>{children}</span>}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

// ─────────────────────────────────────────────
// SPINNER INLINE
// ─────────────────────────────────────────────

function Spinner({ size }: { size: Size }) {
  const s = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <span
      className={cn(
        s,
        "rounded-full border-2 border-white/30 border-t-white animate-spin"
      )}
    />
  );
}
