import type { AdConfig } from "@/types";

/**
 * ADSTERRA CONFIGURATION
 * ----------------------
 * Paste the snippet Adsterra gives you into the matching `code` string below
 * (use a template literal so multi-line snippets work). Leave it empty and the
 * slot renders a fixed-size placeholder (or nothing if showPlaceholders=false).
 *
 * No ad code, keys or publisher ids are shipped with this project.
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
    code: ``, // <- paste Adsterra 728x90 banner snippet here
    width: 728,
    height: 90,
  },
  bottom: {
    enabled: true,
    code: ``, // <- paste Adsterra 728x90 banner snippet here
    width: 728,
    height: 90,
  },
  sidebar: {
    enabled: true,
    code: ``, // <- paste Adsterra 300x250 banner snippet here
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
