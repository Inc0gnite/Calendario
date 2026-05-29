"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types";

// ─────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────

interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string>({
  options,
  value,
  onChange,
  label,
  placeholder = "Seleccionar...",
  error,
  disabled = false,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleSelect(val: T) {
    onChange(val);
    setIsOpen(false);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={ref}>
      {label && (
        <label className="text-xs font-medium text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between",
            "bg-surface-2 rounded-xl px-4 py-3 text-sm",
            "border border-default transition-colors",
            "focus:outline-none focus:border-[var(--blue)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isOpen && "border-[var(--blue)]",
            error && "border-[var(--red)]"
          )}
        >
          <span className={selected ? "text-primary" : "text-muted"}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-muted transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={cn(
                "absolute left-0 right-0 top-full mt-1 z-50",
                "bg-surface border border-default rounded-xl shadow-float",
                "overflow-hidden"
              )}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-sm text-left",
                    "hover:bg-surface-2 transition-colors",
                    value === opt.value
                      ? "text-[var(--blue)] font-medium"
                      : "text-primary"
                  )}
                >
                  {opt.label}
                  {value === opt.value && (
                    <Check size={14} className="text-[var(--blue)]" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-[var(--red)]">⚠ {error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// SEGMENTED CONTROL — selector visual tipo tabs
// ─────────────────────────────────────────────

interface SegmentedOption<T> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  color?: string;
}

interface SegmentedControlProps<T> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="flex gap-2 bg-surface-2 rounded-xl p-1">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <motion.button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg",
                "text-xs font-medium transition-colors",
                isActive
                  ? "bg-surface text-primary shadow-soft"
                  : "text-muted hover:text-secondary"
              )}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.1 }}
              style={
                isActive && opt.color
                  ? { color: opt.color }
                  : undefined
              }
            >
              {opt.icon && <span>{opt.icon}</span>}
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
