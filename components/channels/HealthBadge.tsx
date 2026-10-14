import type { Channel } from "@/types";
import { HEALTH_LABELS } from "@/lib/health";

/** Small flag for probe-flagged channels (dead/blocked/unsupported) or unstable ones (timeout). Renders nothing for OK/unknown. */
export function HealthBadge({ channel }: { channel: Channel }) {
  if (!channel.flagged && !channel.unstable) return null;
  const title = `Last probe (2026-10-14): ${channel.health}${channel.probe?.httpStatus ? ` · HTTP ${channel.probe.httpStatus}` : ""}${channel.probe?.note ? ` · ${channel.probe.note}` : ""}. You can still try to play it.`;
  return (
    <span className={`health health--${channel.flagged ? "flag" : "warn"}`} title={title}>
      <i aria-hidden="true" />
      {channel.flagged ? `${HEALTH_LABELS[channel.health]} · flagged` : "Unstable"}
    </span>
  );
}
