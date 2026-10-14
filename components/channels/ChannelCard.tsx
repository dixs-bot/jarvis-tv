"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Channel } from "@/types";
import { useApp } from "@/context/AppContext";
import { useStreamStatus } from "@/hooks/useStreamStatus";
import { CATEGORY_LABELS } from "@/lib/categories";
import { HealthBadge } from "@/components/channels/HealthBadge";
import { ChannelLogo } from "@/components/channels/ChannelLogo";
import { HeartIcon, PlayIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { dur, ease } from "@/lib/motion";

const STATUS_TEXT = { unknown: "Not checked", ok: "Stream reachable", error: "Check failed" } as const;

interface Props {
  channel: Channel;
  variant?: "rail" | "grid";
  onSelect?: (c: Channel) => void;
  /** Hide the favorite button (used inside the modal). */
  showFavorite?: boolean;
}

export function ChannelCard({ channel, variant = "rail", onSelect, showFavorite = true }: Props) {
  const { current, playChannel, isFavorite, toggleFavorite, settings } = useApp();
  const [active, setActive] = useState(false);
  const status = useStreamStatus(channel.streamUrl, active);
  const fav = isFavorite(channel.id);
  const playing = current?.id === channel.id;

  const select = () => (onSelect ? onSelect(channel) : playChannel(channel));

  return (
    <motion.article
      className={cn("card", `card--${variant}`, playing && "card--playing", channel.flagged && "card--flagged", settings.compactCards && "card--compact")}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: dur.base, ease }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={() => setActive(false)}
    >
      <button
        type="button"
        className="card__main"
        data-focusable
        onClick={select}
        aria-label={`Play ${channel.name}, ${CATEGORY_LABELS[channel.category]}${playing ? ", now playing" : ""}${channel.flagged ? ", flagged as likely unavailable" : channel.unstable ? ", may be unstable" : ""}`}
      >
        <span className="card__logo">
          <ChannelLogo name={channel.name} logo={channel.logo} size="lg" />
        </span>
        <span className="card__name">{channel.name}</span>
        <span className="card__cat">{CATEGORY_LABELS[channel.category]}</span>
        <HealthBadge channel={channel} />
        <span className="card__reveal" aria-hidden="true">
          <span className={cn("dot", `dot--${status}`)} />
          {STATUS_TEXT[status]}
          {channel.quality ? ` · ${channel.quality}` : ""}
          {channel.labels[0] ? ` · ${channel.labels[0]}` : ""}
        </span>
        <span className="card__play" aria-hidden="true">
          {playing ? <span className="eq"><i /><i /><i /></span> : <PlayIcon width={16} height={16} />}
        </span>
      </button>
      {showFavorite && (
        <button
          type="button"
          className={cn("card__fav", fav && "is-on")}
          data-focusable
          onClick={() => toggleFavorite(channel)}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
        >
          <motion.span key={String(fav)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <HeartIcon width={16} height={16} filled={fav} />
          </motion.span>
        </button>
      )}
    </motion.article>
  );
}
