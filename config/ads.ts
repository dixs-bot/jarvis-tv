import type { AdConfig } from "@/types";

/**
 * ADSTERRA DISPLAY SLOT CONFIGURATION
 * -----------------------------------
 * Adsterra display banner snippets can be configured in the matching `code`
 * strings below. Monetag tags are loaded separately by MonetagLoader.tsx.
 * Keep both integrations separate; do not duplicate Monetag tags in these slots.
 *
 * Empty code strings render a placeholder (or nothing if showPlaceholders=false).
 *
 * Banner sizes must match the size you chose in Adsterra:
 *   top / bottom: 728x90 (collapses to a scaled slot on small screens)
 *   sidebar:      300x250
 *   overlay:      300x250 (small dismissible card in the page corner, off by default)
 *
 * Env switches (optional):
 *   NEXT_PUBLIC_ADS_ENABLED=true|false          master switch (default: true)
 *   NEXT_PUBLIC_ADS_PLACEHOLDERS=true|false     show placeholders when no code (default: true)
 */
const flag = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === "" ? fallback : v.toLowerCase() === "true";

export const adConfig: AdConfig = {
  enabled: flag(process.env.NEXT_PUBLIC_ADS_ENABLED, true),
  showPlaceholders: flag(process.env.NEXT_PUBLIC_ADS_PLACEHOLDERS, true),
  top: {
    enabled: true,
    code: ``, // <- optional Adsterra 728x90 snippet
    width: 728,
    height: 90,
  },
  bottom: {
    enabled: true,
    code: ``, // <- optional Adsterra 728x90 snippet
    width: 728,
    height: 90,
  },
  sidebar: {
    enabled: true,
    code: ``, // <- optional Adsterra 300x250 snippet
    width: 300,
    height: 250,
  },
  overlay: {
    enabled: false, // only enable if your Adsterra account/policies permit overlay formats
    code: ``,
    width: 300,
    height: 250,
  },
};
