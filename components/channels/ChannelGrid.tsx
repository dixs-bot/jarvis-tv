"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Channel } from "@/types";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { dur, ease, stagger, fadeUp } from "@/lib/motion";

interface Props {
  channels: Channel[];
  /** Changing this key triggers the category transition. */
  groupKey: string;
  empty?: React.ReactNode;
  onSelect?: (c: Channel) => void;
  showFavorite?: boolean;
}

export function ChannelGrid({ channels, groupKey, empty, onSelect, showFavorite }: Props) {
  if (channels.length === 0) return <>{empty}</>;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.ul
        key={groupKey}
        className="grid"
        variants={stagger}
        initial="hidden"
        animate="show"
        exit={{ opacity: 0, transition: { duration: dur.fast, ease } }}
      >
        {channels.slice(0, 240).map((c) => (
          <motion.li key={c.id} variants={fadeUp} className="grid__item">
            <ChannelCard channel={c} variant="grid" onSelect={onSelect} showFavorite={showFavorite} />
          </motion.li>
        ))}
      </motion.ul>
    </AnimatePresence>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="empty" role="status">
      <div className="empty__icon" aria-hidden="true">◌</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}
