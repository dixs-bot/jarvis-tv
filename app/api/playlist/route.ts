import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_PLAYLIST_URL, PLAYLIST_URL } from "@/config/site";
import probeData from "@/data/stream-probe-results.json";
import type { PlaylistSource, ProbeData } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Same-origin proxy for the configured playlist (avoids CORS surprises).
 * Only the configured URL can be fetched — no user-supplied URLs (no SSRF).
 * Primary source = live URL; the saved snapshot (data/playlist-id.m3u) is used ONLY if the live fetch fails.
 * `?format=json` returns { source, playlist, probe } for the app; default is raw M3U text.
 * Stream segments themselves are NOT proxied; the browser plays them directly.
 */
async function getPlaylist(): Promise<{ text: string; source: PlaylistSource } | null> {
  const url = PLAYLIST_URL || DEFAULT_PLAYLIST_URL;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const text = await res.text();
      if (text.includes("#EXTINF")) return { text, source: "live" };
    }
  } catch {
    /* fall through to snapshot */
  }
  try {
    const text = await readFile(path.join(process.cwd(), "data", "playlist-id.m3u"), "utf8");
    if (text.includes("#EXTINF")) return { text, source: "snapshot" };
  } catch {
    /* no snapshot available */
  }
  return null;
}

export async function GET(req: Request) {
  const pl = await getPlaylist();
  if (!pl) return new Response("Could not reach playlist source and no snapshot is available", { status: 502 });
  const asJson = new URL(req.url).searchParams.get("format") === "json";
  const cache = "public, max-age=300, s-maxage=1800";
  if (asJson) {
    return Response.json(
      { source: pl.source, playlist: pl.text, probe: probeData as unknown as ProbeData },
      { headers: { "cache-control": cache, "x-playlist-source": pl.source } },
    );
  }
  return new Response(pl.text, {
    status: 200,
    headers: { "content-type": "audio/x-mpegurl; charset=utf-8", "cache-control": cache, "x-playlist-source": pl.source },
  });
}
