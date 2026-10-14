"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMotionOff } from "@/hooks/useReducedMotion";
import type { CategoryId } from "@/types";
import { SearchBox } from "@/components/channels/SearchBox";
import { CategoryFilters } from "@/components/channels/CategoryFilters";
import { ChannelGrid, EmptyState } from "@/components/channels/ChannelGrid";
import { CloseIcon } from "@/components/ui/Icons";
import { dur, ease, spring } from "@/lib/motion";

/** JARVIS CHANNEL CENTER — full channel picker modal. */
export function ChannelCenter() {
  const { channelCenterOpen, closeChannelCenter, catalog, playChannel } = useApp();
  const reduce = useMotionOff();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(channelCenterOpen);

  useEffect(() => {
    if (!channelCenterOpen) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    setQ("");
    setCat("all");
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-focusable]")?.focus({ preventScroll: true }), 60);
    return () => {
      clearTimeout(t);
      prevFocus.current?.focus?.({ preventScroll: true });
    };
  }, [channelCenterOpen]);

  useEffect(() => {
    if (!channelCenterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeChannelCenter();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [channelCenterOpen, closeChannelCenter]);

  const list = useMemo(() => {
    const all = catalog?.channels ?? [];
    const needle = q.trim().toLowerCase();
    return all.filter((c) => (cat === "all" || c.category === cat) && (!needle || c.name.toLowerCase().includes(needle)));
  }, [catalog, q, cat]);

  const d = reduce ? 0 : undefined;

  return (
    <AnimatePresence>
      {channelCenterOpen && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: d ?? dur.base, ease }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeChannelCenter();
          }}
        >
          <motion.div
            ref={panelRef}
            className="modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-title"
            data-focus-scope
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={reduce ? { duration: 0 } : spring}
          >
            <div className="modal__head">
              <div>
                <p className="eyebrow">JARVIS CHANNEL CENTER</p>
                <h2 id="cc-title" className="modal__title">SELECT YOUR CHANNEL</h2>
              </div>
              <button type="button" className="btn btn--ghost" data-focusable onClick={closeChannelCenter} aria-label="Close channel center">
                <CloseIcon width={18} height={18} /> CLOSE
              </button>
            </div>
            <SearchBox ref={searchRef} value={q} onChange={setQ} label="Search channels in channel center" />
            <CategoryFilters categories={catalog?.categories ?? []} value={cat} onChange={setCat} />
            <div className="modal__body">
              <ChannelGrid
                channels={list}
                groupKey={`${cat}|${q}`}
                showFavorite={false}
                onSelect={(c) => {
                  playChannel(c);
                  closeChannelCenter();
                }}
                empty={
                  <EmptyState
                    title="No channels found"
                    hint={q ? `Nothing matches “${q}”${cat !== "all" ? " in this category" : ""}.` : "No channels in this category."}
                    action={
                      <button type="button" className="btn btn--ghost" data-focusable onClick={() => { setQ(""); setCat("all"); }}>
                        Reset filters
                      </button>
                    }
                  />
                }
              />
            </div>
            <p className="modal__foot">{list.length} channel{list.length === 1 ? "" : "s"} · Esc to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
