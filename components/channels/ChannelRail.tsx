"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Channel } from "@/types";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { ChevronIcon } from "@/components/ui/Icons";
import { fadeUp } from "@/lib/motion";

export function ChannelRail({ id, title, channels }: { id: string; title: string; channels: Channel[] }) {
  const ref = useRef<HTMLUListElement>(null);
  if (channels.length === 0) return null;
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <motion.section className="rail" aria-labelledby={`rail-${id}`} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
      <div className="rail__head">
        <h2 id={`rail-${id}`} className="rail__title">{title}</h2>
        <div className="rail__arrows">
          <button type="button" className="icon-btn" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>
            <ChevronIcon dir="left" />
          </button>
          <button type="button" className="icon-btn" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>
            <ChevronIcon />
          </button>
        </div>
      </div>
      <ul className="rail__track" ref={ref}>
        {channels.map((c) => (
          <li key={c.id} className="rail__item">
            <ChannelCard channel={c} />
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
