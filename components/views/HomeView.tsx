"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Hero } from "@/components/home/Hero";
import { ChannelRail } from "@/components/channels/ChannelRail";
import { HeroSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { AdBannerTop, AdBannerBottom } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/channels/ChannelGrid";
import type { Channel, CategoryId } from "@/types";

export function HomeView() {
  const { catalog, loading, error, reload, history, favorites } = useApp();

  const rails = useMemo(() => {
    if (!catalog) return null;
    const byId = new Map(catalog.channels.map((c) => [c.id, c] as const));
    const cont = history.map((h) => byId.get(h.channelId)).filter((c): c is Channel => !!c);
    const favs = favorites.map((id) => byId.get(id)).filter((c): c is Channel => !!c);
    // Popular = most-played locally first, then channels that have a logo (real data only).
    const plays = new Map(history.map((h) => [h.channelId, h.plays] as const));
    const popular = catalog.channels
      .filter((c) => c.logo)
      .slice()
      .sort((a, b) => (plays.get(b.id) ?? 0) - (plays.get(a.id) ?? 0) || a.order - b.order)
      .slice(0, 20);
    const cat = (id: CategoryId) => catalog.channels.filter((c) => c.category === id);
    return { cont, popular, favs, news: cat("news"), ent: cat("entertainment"), sports: cat("sports") };
  }, [catalog, history, favorites]);

  if (error)
    return (
      <EmptyState
        title="Could not load channels"
        hint={error}
        action={
          <button type="button" className="btn btn--primary" data-focusable onClick={reload}>
            RETRY
          </button>
        }
      />
    );

  if (loading || !catalog || !rails)
    return (
      <>
        <HeroSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    );

  return (
    <>
      <AdBannerTop />
      <Hero featured={catalog.featured} />
      <ChannelRail id="continue" title="Continue Watching" channels={rails.cont} />
      <ChannelRail id="popular" title="Popular" channels={rails.popular} />
      <ChannelRail id="indonesian" title="Indonesian" channels={catalog.channels.filter((c) => !c.country || c.country === "ID").slice(0, 40)} />
      <ChannelRail id="news" title="News" channels={rails.news} />
      <ChannelRail id="entertainment" title="Entertainment" channels={rails.ent} />
      <ChannelRail id="sports" title="Sports" channels={rails.sports} />
      <ChannelRail id="favorites" title="Favorites" channels={rails.favs} />
      <AdBannerBottom />
    </>
  );
}
