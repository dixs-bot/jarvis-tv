"use client";

import { initials } from "@/lib/utils";

/**
 * Deliberately render a local initials badge instead of remote playlist logos.
 * Third-party logo hosts frequently return 404/connection-refused and create
 * console noise; the app should remain stable when a logo host is unavailable.
 */
export function ChannelLogo({ name, size = "md" }: { name: string; logo?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`logo logo--${size}`} aria-label={`Logo ${name}`} title={name}>
      <span className="logo__fallback" aria-hidden="true">{initials(name)}</span>
    </span>
  );
}
