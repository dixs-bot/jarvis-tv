/** Shared domain types for JARVIS TV. Kept free of React so they can be reused by a future admin/Supabase layer. */

export type CategoryId =
  | "news"
  | "entertainment"
  | "sports"
  | "movies"
  | "kids"
  | "music"
  | "religious"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface Channel {
  /** Stable, unique id derived from tvg-id / name. */
  id: string;
  name: string;
  /** Logo URL from the playlist (may be absent). */
  logo?: string;
  /** Raw `group-title` from the playlist. */
  group: string;
  category: CategoryId;
  streamUrl: string;
  tvgId?: string;
  /** ISO-ish country code derived from tvg-id suffix, if present. */
  country?: string;
  /** Quality tag parsed from the name, e.g. "720p". */
  quality?: string;
  /** Bracket labels from the name, e.g. "Geo-blocked", "Not 24/7". */
  labels: string[];
  /** Position in the (admin-ordered) list. */
  order: number;
  /** Health from the saved probe snapshot ("unknown" when not probed). */
  health: HealthStatus;
  /** true for dead / blocked / unsupported streams (shown with a flag, never removed). */
  flagged: boolean;
  /** true for probe timeouts: may work, but likely unstable (warning). */
  unstable: boolean;
  /** Probe details when available. */
  probe?: ProbeInfo;
}

export type HealthStatus = "ok" | "dead" | "timeout" | "blocked" | "unsupported" | "unknown";

export interface ProbeInfo {
  httpStatus: number | null;
  contentType: string | null;
  responseTimeMs: number;
  note: string | null;
  corsFlag: string;
}

export interface ProbeEntry extends ProbeInfo {
  channel: string;
  status: HealthStatus;
}

export interface ProbeData {
  probedAt: string;
  total: number;
  summary: Record<Exclude<HealthStatus, "unknown">, number>;
  results: Record<string, ProbeEntry>;
}

export type PlaylistSource = "live" | "snapshot" | "direct";

export type StreamStatus = "unknown" | "ok" | "error";

export type MotionPreference = "system" | "reduced" | "full";
export type QualityCap = "auto" | 1080 | 720 | 480 | 360;

export interface UserSettings {
  autoplay: boolean;
  motion: MotionPreference;
  showClock: boolean;
  showConnection: boolean;
  compactCards: boolean;
  qualityCap: QualityCap;
}

export interface HistoryEntry {
  channelId: string;
  lastWatched: number;
  plays: number;
}

/** Ad slot ids available to the UI. */
export type AdSlotId = "top" | "bottom" | "sidebar" | "overlay";

export interface AdSlotConfig {
  enabled: boolean;
  /** Raw Adsterra snippet pasted by the site owner. Empty = placeholder. */
  code: string;
  width: number;
  height: number;
}

export type AdConfig = Record<AdSlotId, AdSlotConfig> & {
  /** Master switch. */
  enabled: boolean;
  /** Show a dashed placeholder where an enabled slot has no code. */
  showPlaceholders: boolean;
};

/**
 * Everything an admin panel will eventually control.
 * Today it is served from static defaults (config/admin.ts) — NOT persisted server-side.
 */
export interface AdminConfig {
  playlistUrl: string;
  /** Channel ids to feature in the hero (first existing one wins). */
  featuredChannelIds: string[];
  /** Channel ids hidden from the app. */
  disabledChannelIds: string[];
  /** Explicit ordering; unlisted channels follow in playlist order. */
  channelOrder: string[];
  /** Category display order; unlisted follow. */
  categoryOrder: CategoryId[];
  /** Per-category enable flags. Missing = enabled. */
  disabledCategories: CategoryId[];
  ads: AdConfig;
}

export type AdminConfigSource = "static-defaults" | "remote";

export interface ChannelCatalog {
  channels: Channel[];
  categories: Category[];
  featured: Channel[];
  playlistUrl: string;
  /** Where the playlist text came from (live iptv-org, saved snapshot, or direct browser fetch). */
  playlistSource?: PlaylistSource;
  /** Date of the saved stream probe, if merged. */
  probedAt?: string;
  fetchedAt: number;
  configSource: AdminConfigSource;
}

export type ViewId = "home" | "live" | "movies" | "favorites" | "search" | "settings";

export type ToastKind = "success" | "error" | "info";
export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}
