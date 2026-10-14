import type { AdminConfig, Channel, ChannelCatalog, PlaylistSource, ProbeData } from "@/types";
import { mergeProbe, sortByHealth } from "@/lib/health";
import { parseM3U } from "@/lib/m3u";
import { buildCategories } from "@/lib/categories";
import { getAdminService } from "@/services/adminService";

/** Applies admin rules (disable, ordering, featured) to raw playlist channels. */
export function applyAdminConfig(raw: Channel[], cfg: AdminConfig): Channel[] {
  const disabledIds = new Set(cfg.disabledChannelIds);
  const disabledCats = new Set(cfg.disabledCategories);
  const rank = new Map(cfg.channelOrder.map((id, i) => [id, i] as const));
  const kept = raw.filter((c) => !disabledIds.has(c.id) && !disabledCats.has(c.category));
  return kept
    .slice()
    .sort((a, b) => {
      const ra = rank.get(a.id);
      const rb = rank.get(b.id);
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      return a.order - b.order;
    })
    .map((c, i) => ({ ...c, order: i }));
}

interface PlaylistPayload {
  text: string;
  source: PlaylistSource;
  probe: ProbeData | null;
}

async function fetchPlaylist(playlistUrl: string, defaultUrl: string): Promise<PlaylistPayload> {
  // Prefer the same-origin proxy (live first, saved snapshot fallback, probe data attached).
  if (playlistUrl === defaultUrl) {
    try {
      const res = await fetch("/api/playlist?format=json", { cache: "no-store" });
      if (res.ok) {
        const j = (await res.json()) as { source: PlaylistSource; playlist: string; probe: ProbeData | null };
        return { text: j.playlist, source: j.source, probe: j.probe };
      }
    } catch {
      /* fall through to direct */
    }
  }
  const res = await fetch(playlistUrl);
  if (!res.ok) throw new Error(`Playlist request failed (${res.status})`);
  return { text: await res.text(), source: "direct", probe: null };
}

export async function loadCatalog(): Promise<ChannelCatalog> {
  const admin = getAdminService();
  const cfg = await admin.getConfig();
  const { text, source, probe } = await fetchPlaylist(cfg.playlistUrl, cfg.playlistUrl);
  const parsed = parseM3U(text);
  if (parsed.length === 0) throw new Error("The playlist contains no playable channels.");
  // Merge probe health, then sort OK first / unknown+timeout / dead+blocked+unsupported last (nothing removed).
  const channels = sortByHealth(applyAdminConfig(mergeProbe(parsed, probe), cfg));
  const present = new Set(channels.map((c) => c.category));
  const categories = buildCategories(present, cfg.categoryOrder, cfg.disabledCategories);

  const featured: Channel[] = [];
  for (const id of cfg.featuredChannelIds) {
    const c = channels.find((x) => x.id === id);
    if (c) featured.push(c);
  }
  if (featured.length === 0) {
    // Default: channels that have a logo, newsy/entertainment first, max 5.
    const withLogo = channels.filter((c) => c.logo);
    featured.push(...withLogo.slice(0, 5));
    if (featured.length === 0) featured.push(...channels.slice(0, 3));
  }

  return {
    channels,
    categories,
    featured,
    playlistUrl: cfg.playlistUrl,
    playlistSource: source,
    probedAt: probe?.probedAt,
    fetchedAt: Date.now(),
    configSource: admin.source,
  };
}
