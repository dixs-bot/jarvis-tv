"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/lib/utils";

/** Returns "" until mounted to avoid hydration mismatch. */
export function useClock(enabled: boolean): string {
  const [t, setT] = useState("");
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setT(formatClock(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [enabled]);
  return t;
}
