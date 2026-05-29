"use client";

import { useState, useEffect } from "react";
import type { Holiday } from "@/types";
import { fetchHolidays } from "@/lib/utils/holidays";

export function useHolidays(year: number) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchHolidays(year).then((data) => {
      if (!cancelled) {
        setHolidays(data);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [year]);

  // Al cambiar de año, pre-cargar el siguiente
  useEffect(() => {
    fetchHolidays(year + 1).catch(() => {});
  }, [year]);

  function isHoliday(dateStr: string): Holiday | undefined {
    return holidays.find((h) => h.date === dateStr);
  }

  return { holidays, isLoading, isHoliday };
}
