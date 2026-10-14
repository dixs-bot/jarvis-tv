"use client";

import { useCallback } from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useRemoteNav } from "@/hooks/useRemoteNav";
import { useMotionOff } from "@/hooks/useReducedMotion";
import { Header } from "@/components/layout/Header";
import { HomeView } from "@/components/views/HomeView";
import { LiveView } from "@/components/views/LiveView";
import { CatalogView } from "@/components/views/CatalogView";
import { SettingsView } from "@/components/views/SettingsView";
import { ChannelCenter } from "@/components/channels/ChannelCenter";
import { Toasts } from "@/components/ui/Toasts";
import { MonetagDirectLink } from "@/components/ads/MonetagLoader";
import { SITE } from "@/config/site";
import { dur, ease } from "@/lib/motion";

function Views() {
  const { view } = useApp();
  switch (view) {
    case "live":
      return <LiveView />;
    case "movies":
      return <CatalogView mode="movies" />;
    case "favorites":
      return <CatalogView mode="favorites" />;
    case "search":
      return <CatalogView mode="search" />;
    case "settings":
      return <SettingsView />;
    default:
      return <HomeView />;
  }
}

function Shell() {
  const { view, setView, channelCenterOpen } = useApp();
  const off = useMotionOff();
  const onBack = useCallback(() => {
    if (!channelCenterOpen && view !== "home") setView("home");
  }, [channelCenterOpen, view, setView]);
  useRemoteNav({ onBack });

  return (
    <MotionConfig reducedMotion={off ? "always" : "never"}>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <MonetagDirectLink />
      <main id="main" className="main" tabIndex={-1}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: dur.base, ease }}>
            <Views />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="footer">
        <span>{SITE.name}</span>
        <span>{SITE.tagline}</span>
      </footer>
      <ChannelCenter />
      <Toasts />
    </MotionConfig>
  );
}

export function AppShell() {
  return <Shell />;
}
