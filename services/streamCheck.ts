import type { StreamStatus } from "@/types";

/**
 * Real availability check: fetch the stream manifest in the browser.
 * Result is only `ok` if the manifest was readable and looks like HLS.
 * CORS-blocked or failing manifests are reported as `error` — we don't
 * claim a channel is dead unless the check actually failed. Results are cached per session.
 */
const cache = new Map<string, StreamStatus>();
const inflight = new Map<string, Promise<StreamStatus>>();

export function getCachedStatus(url: string): StreamStatus {
  return cache.get(url) ?? "unknown";
}

export function setStatus(url: string, status: StreamStatus): void {
  cache.set(url, status);
}

export function checkStream(url: string, timeoutMs = 7000): Promise<StreamStatus> {
  const cached = cache.get(url);
  if (cached) return Promise.resolve(cached);
  const existing = inflight.get(url);
  if (existing) return existing;
  const p = (async (): Promise<StreamStatus> => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      if (!res.ok) return "error";
      const head = (await res.text()).slice(0, 64);
      return head.includes("#EXTM3U") ? "ok" : "error";
    } catch {
      return "error";
    } finally {
      clearTimeout(t);
    }
  })().then((s) => {
    cache.set(url, s);
    inflight.delete(url);
    return s;
  });
  inflight.set(url, p);
  return p;
}
