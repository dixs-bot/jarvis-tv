"use client";

import { useEffect, useState } from "react";
import type { StreamStatus } from "@/types";
import { checkStream, getCachedStatus } from "@/services/streamCheck";

/** Checks a stream's manifest once `enabled` (e.g. card in view/focused). Returns "unknown" until checked. */
export function useStreamStatus(url: string, enabled: boolean): StreamStatus {
  const [status, setStatus] = useState<StreamStatus>("unknown");
  useEffect(() => {
    const cached = getCachedStatus(url);
    if (cached !== "unknown") {
      setStatus(cached);
      return;
    }
    if (!enabled) return;
    let alive = true;
    checkStream(url).then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, [url, enabled]);
  return status;
}
