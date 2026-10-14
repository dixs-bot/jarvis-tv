"use client";

import { useState } from "react";
import { initials } from "@/lib/utils";

export function ChannelLogo({ name, logo, size = "md" }: { name: string; logo?: string; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`logo logo--${size}`}>
      {logo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote playlist logos, arbitrary hosts
        <img src={logo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        <span className="logo__fallback" aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
