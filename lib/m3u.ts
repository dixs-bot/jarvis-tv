import type { Channel } from "@/types";
import { mapGroupToCategory } from "@/lib/categories";
import { slugify } from "@/lib/utils";

/** Parses attributes like key="value" from an #EXTINF line. */
function parseAttrs(line: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w-]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) attrs[m[1].toLowerCase()] = m[2];
  return attrs;
}

/** Pure M3U parser — no network, no DOM. Returns channels in playlist order. */
export function parseM3U(text: string): Channel[] {
  const lines = text.split(/\r?\n/);
  const out: Channel[] = [];
  const seen = new Map<string, number>();
  let pending: { attrs: Record<string, string>; name: string } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const comma = line.indexOf(",", line.lastIndexOf('"') >= 0 ? line.lastIndexOf('"') : 0);
      const name = comma >= 0 ? line.slice(comma + 1).trim() : "";
      pending = { attrs: parseAttrs(line), name };
      continue;
    }
    if (line.startsWith("#")) continue; // #EXTVLCOPT, #EXTM3U, comments
    if (!pending) continue;
    if (!/^https?:\/\//i.test(line)) {
      pending = null;
      continue;
    }

    const labels: string[] = [];
    let name = pending.name;
    let quality: string | undefined;
    name = name.replace(/\[([^\]]+)\]/g, (_m, l: string) => {
      labels.push(l.trim());
      return "";
    });
    name = name.replace(/\((\d{3,4}[pi])\)/gi, (_m, q: string) => {
      quality = q.toLowerCase();
      return "";
    });
    name = name.replace(/\s{2,}/g, " ").trim() || pending.attrs["tvg-name"] || "Unnamed channel";

    const tvgId = pending.attrs["tvg-id"] || undefined;
    const base = slugify(tvgId || name) || "channel";
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    const group = pending.attrs["group-title"] || "Undefined";
    const countryMatch = tvgId?.match(/\.([a-z]{2})(?:@|$)/i);

    out.push({
      id,
      name,
      logo: pending.attrs["tvg-logo"] || undefined,
      group,
      category: mapGroupToCategory(group),
      streamUrl: line,
      tvgId,
      country: countryMatch ? countryMatch[1].toUpperCase() : undefined,
      quality,
      labels,
      order: out.length,
      health: "unknown",
      flagged: false,
      unstable: false,
    });
    pending = null;
  }
  return out;
}
