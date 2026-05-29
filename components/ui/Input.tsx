"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = "left",
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-secondary uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-primary",
              "placeholder:text-muted border border-default",
              "focus:outline-none focus:border-[var(--blue)] transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[var(--red)] focus:border-[var(--red)]",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              className
            )}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--red)] flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-secondary uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn(
            "w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-primary",
            "placeholder:text-muted border border-default resize-none",
            "focus:outline-none focus:border-[var(--blue)] transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--red)]",
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-[var(--red)]">⚠ {error}</p>
        )}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
