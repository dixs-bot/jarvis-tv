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
  // PLAYLIST_URL is server-only and takes precedence for private/authenticated sources.
  // NEXT_PUBLIC_PLAYLIST_URL remains supported for public playlists.
  const url = process.env.PLAYLIST_URL || PLAYLIST_URL || DEFAULT_PLAYLIST_URL;
  const token = process.env.PLAYLIST_TOKEN;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Playlist URL must use HTTP or HTTPS");
    }

    const headers = new Headers({ Accept: "audio/x-mpegurl, application/vnd.apple.mpegurl, text/plain, */*" });
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(url, {
      headers,
      ...(token ? { cache: "no-store" as const } : { next: { revalidate: 1800 } }),
      signal: AbortSignal.timeout(10000),
    });
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
  // Never publicly cache a playlist fetched with a secret token.
  const cache = process.env.PLAYLIST_TOKEN
    ? "private, no-store"
    : "public, max-age=300, s-maxage=1800";
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
