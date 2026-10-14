"use client";

import { useMemo, useState } from "react";
import type { AdSlotId } from "@/types";
import { adConfig } from "@/config/ads";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/Icons";

interface Props {
  slot: AdSlotId;
  className?: string;
}

/**
 * Generic, config-driven ad slot.
 * - Fixed-size box (width/height from config.ts) => no layout shift.
 * - No code configured => labelled placeholder (or nothing when showPlaceholders=false).
 * - Code configured => rendered inside a sandboxed iframe (scripts + popups on user click only).
 *   The iframe isolates ad scripts from the app and the video player; we never auto-click.
 * - Never rendered inside/over the player; overlay variant is a small dismissible corner card.
 */
export function AdSlot({ slot, className }: Props) {
  const cfg = adConfig[slot];
  const [dismissed, setDismissed] = useState(false);
  const code = cfg.code.trim();

  const srcDoc = useMemo(
    () =>
      code
        ? `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body>${code}</body></html>`
        : "",
    [code],
  );

  if (!adConfig.enabled || !cfg.enabled) return null;
  if (!code && !adConfig.showPlaceholders) return null;
  if (slot === "overlay" && dismissed) return null;

  const box = (
    <div
      className={cn("ad", `ad--${slot}`, className)}
      style={{ ["--ad-w" as string]: `${cfg.width}px`, ["--ad-h" as string]: `${cfg.height}px` }}
      role="complementary"
      aria-label="Advertisement"
    >
      <span className="ad__label">Advertisement</span>
      <div className="ad__box">
        {code ? (
          <iframe
            title={`Advertisement ${slot}`}
            srcDoc={srcDoc}
            width={cfg.width}
            height={cfg.height}
            loading="lazy"
            scrolling="no"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="ad__placeholder">
            <strong>Ad slot: {slot}</strong>
            <span>
              {cfg.width}×{cfg.height} · add Adsterra code in config/ads.ts
            </span>
          </div>
        )}
      </div>
      {slot === "overlay" && (
        <button type="button" className="ad__close" data-focusable onClick={() => setDismissed(true)} aria-label="Close advertisement">
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
  return box;
}

export const AdBannerTop = ({ className }: { className?: string }) => <AdSlot slot="top" className={className} />;
export const AdBannerBottom = ({ className }: { className?: string }) => <AdSlot slot="bottom" className={className} />;
export const AdSidebar = ({ className }: { className?: string }) => <AdSlot slot="sidebar" className={className} />;
export const AdOverlay = ({ className }: { className?: string }) => <AdSlot slot="overlay" className={className} />;
