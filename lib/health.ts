import type { Channel, HealthStatus, ProbeData } from "@/types";

/** Normalises a channel name so playlist names match probe names (strips [labels], (720p), punctuation). */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  ok: "Stream OK",
  unknown: "Not probed",
  timeout: "Unstable",
  dead: "Offline",
  blocked: "Blocked",
  unsupported: "Unsupported",
};

/** 0 = OK first, 1 = unknown/timeout, 2 = dead/blocked/unsupported last. */
export function healthRank(h: HealthStatus): number {
  if (h === "ok") return 0;
  if (h === "unknown" || h === "timeout") return 1;
  return 2;
}

/** Merges probe results onto channels: by stream URL first, then normalised name. Never removes channels. */
export function mergeProbe(channels: Channel[], probe: ProbeData | null | undefined): Channel[] {
  if (!probe) return channels;
  const byName = new Map<string, ProbeData["results"][string]>();
  for (const e of Object.values(probe.results)) {
    const k = normalizeName(e.channel);
    if (k && !byName.has(k)) byName.set(k, e);
  }
  return channels.map((c) => {
    const e = probe.results[c.streamUrl] ?? byName.get(normalizeName(c.name));
    if (!e) return c;
    return {
      ...c,
      health: e.status,
      flagged: e.status === "dead" || e.status === "blocked" || e.status === "unsupported",
      unstable: e.status === "timeout",
      probe: {
        httpStatus: e.httpStatus,
        contentType: e.contentType,
        responseTimeMs: e.responseTimeMs,
        note: e.note,
        corsFlag: e.corsFlag,
      },
    };
  });
}

/** Stable sort by health group, preserving the original order within each group. */
export function sortByHealth(channels: Channel[]): Channel[] {
  return channels
    .map((c, i) => ({ c, i }))
    .sort((a, b) => healthRank(a.c.health) - healthRank(b.c.health) || a.i - b.i)
    .map(({ c }, i) => ({ ...c, order: i }));
}
