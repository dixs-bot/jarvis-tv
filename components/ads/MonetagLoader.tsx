"use client";

import { useEffect } from "react";

const MONETAG_SCRIPTS = [
  { zone: "12032855", src: "https://al5sm.com/tag.min.js" },
  { zone: "12032858", src: "https://nap5k.com/tag.min.js" },
  { zone: "12032860", src: "https://n6wxm.com/vignette.min.js" },
] as const;

/**
 * Loads the Monetag tags once per page document.
 * These are publisher-provided third-party scripts; they may use their own
 * ad formats and display timing. Do not duplicate these tags elsewhere.
 */
export function MonetagLoader() {
  useEffect(() => {
    for (const ad of MONETAG_SCRIPTS) {
      const selector = `script[data-jarvis-monetag-zone="${ad.zone}"]`;
      if (document.querySelector(selector)) continue;

      const script = document.createElement("script");
      script.dataset.zone = ad.zone;
      script.dataset.jarvisMonetagZone = ad.zone;
      script.src = ad.src;
      script.async = true;
      script.referrerPolicy = "strict-origin-when-cross-origin";
      document.body.appendChild(script);
    }
  }, []);

  return null;
}

export function MonetagDirectLink() {
  return (
    <aside className="monetag-direct-link" aria-label="Sponsored link">
      <span className="monetag-direct-link__label">SPONSORED</span>
      <a
        href="https://uplcm.com/4/12032864"
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        Buka penawaran sponsor
        <span aria-hidden="true"> ↗</span>
      </a>
    </aside>
  );
}
