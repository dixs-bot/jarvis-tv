"use client";

import { useReducedMotion as useFramerReduced } from "framer-motion";
import { useApp } from "@/context/AppContext";

/** true when the user (or the OS, unless overridden in Settings) wants no motion. */
export function useMotionOff(): boolean {
  const system = useFramerReduced();
  const { settings } = useApp();
  if (settings.motion === "reduced") return true;
  if (settings.motion === "full") return false;
  return !!system;
}
