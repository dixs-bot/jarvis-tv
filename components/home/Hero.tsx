"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Channel } from "@/types";
import { useApp } from "@/context/AppContext";
import { CATEGORY_LABELS } from "@/lib/categories";
import { ChannelLogo } from "@/components/channels/ChannelLogo";
import { HeartIcon, PlayIcon } from "@/components/ui/Icons";
import { SITE } from "@/config/site";
import { dur, ease, stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Hero({ featured }: { featured: Channel[] }) {
  const { playChannel, isFavorite, toggleFavorite } = useApp();
  const [idx, setIdx] = useState(0);
  const ch = featured[idx % Math.max(featured.length, 1)];

  useEffect(() => {
    if (featured.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % featured.length), 9000);
    return () => clearInterval(id);
  }, [featured.length]);

  if (!ch) return null;
  const fav = isFavorite(ch.id);

  return (
    <section className="hero" aria-label="Featured channel">
      <div className="hero__glow" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.div key={ch.id} className="hero__inner" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: dur.fast, ease } }}>
          <div className="hero__copy">
            <motion.p variants={fadeUp} className="eyebrow">{SITE.tagline}</motion.p>
            <motion.div variants={fadeUp} className="hero__badges">
              <span className="badge badge--live"><i /> LIVE</span>
              <span className="badge">{CATEGORY_LABELS[ch.category]}</span>
              {ch.quality && <span className="badge">{ch.quality}</span>}
            </motion.div>
            <motion.h1 variants={fadeUp} className="hero__title">{ch.name}</motion.h1>
            <motion.p variants={fadeUp} className="hero__sub">
              Featured channel · {ch.group.split(";").join(" · ")}
            </motion.p>
            <motion.div variants={fadeUp} className="hero__actions">
              <motion.button
                type="button"
                className="btn btn--primary btn--lg"
                data-focusable
                whileTap={{ scale: 0.96 }}
                onClick={() => playChannel(ch)}
              >
                <PlayIcon width={20} height={20} /> WATCH NOW
              </motion.button>
              <motion.button
                type="button"
                className={cn("btn btn--glow btn--lg", fav && "is-on")}
                data-focusable
                whileTap={{ scale: 0.96 }}
                aria-pressed={fav}
                onClick={() => toggleFavorite(ch)}
              >
                <HeartIcon width={20} height={20} filled={fav} /> {fav ? "IN FAVORITES" : "ADD TO FAVORITES"}
              </motion.button>
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="hero__art" aria-hidden="true">
            <div className="hero__logo"><ChannelLogo name={ch.name} logo={ch.logo} size="lg" /></div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {featured.length > 1 && (
        <div className="hero__dots" role="group" aria-label="Featured channels">
          {featured.map((f, i) => (
            <button key={f.id} type="button" data-focusable className={cn("dot-btn", i === idx % featured.length && "is-active")} onClick={() => setIdx(i)} aria-label={`Show featured channel ${f.name}`} />
          ))}
        </div>
      )}
    </section>
  );
}
