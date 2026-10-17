"use client";

import { useApp } from "@/context/AppContext";
import { useClock } from "@/hooks/useClock";
import { useOnline } from "@/hooks/useOnline";
import type { ViewId } from "@/types";
import { BrandLogo } from "@/components/ui/Logo";
import { FilmIcon, GearIcon, GridIcon, HeartIcon, HomeIcon, SearchIcon, TvIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function Header() {
  const { view, setView, catalog, settings, openChannelCenter } = useApp();
  const clock = useClock(settings.showClock);
  const online = useOnline();
  const hasMovies = !!catalog?.channels.some((c) => c.category === "movies");

  const items: Array<{ id: ViewId; label: string; icon: React.ReactNode; show: boolean }> = [
    { id: "home", label: "Home", icon: <HomeIcon width={18} height={18} />, show: true },
    { id: "live", label: "Live TV", icon: <TvIcon width={18} height={18} />, show: true },
    { id: "movies", label: "Movies", icon: <FilmIcon width={18} height={18} />, show: hasMovies },
    { id: "favorites", label: "Favorites", icon: <HeartIcon width={18} height={18} />, show: true },
    { id: "search", label: "Search", icon: <SearchIcon width={18} height={18} />, show: true },
    { id: "settings", label: "Settings", icon: <GearIcon width={18} height={18} />, show: true },
  ];

  return (
    <header className="header">
      <button type="button" className="header__brand" data-focusable onClick={() => setView("home")} aria-label="JARVIS TV home">
        <BrandLogo />
      </button>
      <nav className="nav" aria-label="Main navigation">
        {items
          .filter((i) => i.show)
          .map((i) => (
            <button
              key={i.id}
              type="button"
              data-focusable
              className={cn("nav__item", view === i.id && "is-active")}
              aria-current={view === i.id ? "page" : undefined}
              onClick={() => setView(i.id)}
            >
              {i.icon}
              <span>{i.label}</span>
            </button>
          ))}
        <a href="/mirror" className="nav__item" data-focusable aria-label="Open phone mirroring">
          <span aria-hidden="true">▣</span>
          <span>Phone Mirror</span>
        </a>
        <button type="button" className="nav__item nav__item--cta" data-focusable onClick={openChannelCenter} aria-haspopup="dialog">
          <GridIcon width={18} height={18} />
          <span>All Channels</span>
        </button>
      </nav>
      <div className="header__status">
        {settings.showConnection && online !== null && (
          <span className={cn("conn", online ? "conn--on" : "conn--off")} title={online ? "Online" : "Offline"}>
            <i /> {online ? "ONLINE" : "OFFLINE"}
          </span>
        )}
        {settings.showClock && clock && <time className="clock" suppressHydrationWarning>{clock}</time>}
      </div>
    </header>
  );
}
