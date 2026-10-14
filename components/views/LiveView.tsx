"use client";

import { useApp } from "@/context/AppContext";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { ChannelRail } from "@/components/channels/ChannelRail";
import { AdBannerTop, AdBannerBottom, AdSidebar, AdOverlay } from "@/components/ads/AdSlot";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/channels/ChannelGrid";

export function LiveView() {
  const { catalog, current, loading, error, reload } = useApp();
  if (error)
    return (
      <EmptyState title="Could not load channels" hint={error} action={<button type="button" className="btn btn--primary" data-focusable onClick={reload}>RETRY</button>} />
    );
  if (loading || !catalog || !current) return <CardSkeleton />;
  const related = catalog.channels.filter((c) => c.category === current.category && c.id !== current.id).slice(0, 30);
  return (
    <>
      <AdBannerTop />
      <div className="live">
        <div className="live__main">
          <VideoPlayer channel={current} />
        </div>
        <aside className="live__side" aria-label="Sidebar">
          <AdSidebar />
        </aside>
      </div>
      <ChannelRail id="related" title={`More in ${current.group.split(";")[0]}`} channels={related} />
      <AdBannerBottom />
      <AdOverlay />
    </>
  );
}
