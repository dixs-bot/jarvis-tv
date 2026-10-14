export const SITE = {
  name: "JARVIS TV",
  tagline: "YOUR WORLD. YOUR ENTERTAINMENT.",
  description:
    "JARVIS TV — a black & neon-blue Android TV style live streaming experience built with Next.js.",
} as const;

/** Default public playlist. Override with NEXT_PUBLIC_PLAYLIST_URL. */
export const DEFAULT_PLAYLIST_URL = "https://iptv-org.github.io/iptv/countries/id.m3u";

export const PLAYLIST_URL: string = process.env.NEXT_PUBLIC_PLAYLIST_URL || DEFAULT_PLAYLIST_URL;

/** Storage keys (all namespaced, all client-only). */
export const STORAGE = {
  favorites: "jarvistv.favorites.v1",
  history: "jarvistv.history.v1",
  settings: "jarvistv.settings.v1",
  volume: "jarvistv.volume.v1",
  lastChannel: "jarvistv.lastChannel.v1",
} as const;

export const MAX_HISTORY = 20;
