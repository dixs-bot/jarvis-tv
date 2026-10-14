"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import type { CategoryId } from "@/types";
import { CategoryFilters } from "@/components/channels/CategoryFilters";
import { ChannelGrid, EmptyState } from "@/components/channels/ChannelGrid";
import { SearchBox } from "@/components/channels/SearchBox";
import { AdBannerTop } from "@/components/ads/AdSlot";

type Mode = "movies" | "favorites" | "search";

const TITLES: Record<Mode, { title: string; sub: string }> = {
  movies: { title: "Movies", sub: "Movie channels from the playlist" },
  favorites: { title: "Favorites", sub: "Saved on this device" },
  search: { title: "Search", sub: "Find a channel by name" },
};

export function CatalogView({ mode }: { mode: Mode }) {
  const { catalog, favorites, search, setSearch, setView, loading } = useApp();
  const [cat, setCat] = useState<CategoryId | "all">("all");

  const base = useMemo(() => {
    const all = catalog?.channels ?? [];
    if (mode === "movies") return all.filter((c) => c.category === "movies");
    if (mode === "favorites") return favorites.map((id) => all.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
    return all;
  }, [catalog, favorites, mode]);

  const list = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return base.filter((c) => (cat === "all" || c.category === cat) && (!needle || c.name.toLowerCase().includes(needle)));
  }, [base, cat, search]);

  const cats = useMemo(() => {
    const present = new Set(base.map((c) => c.category));
    return (catalog?.categories ?? []).filter((c) => present.has(c.id));
  }, [base, catalog]);

  const t = TITLES[mode];
  return (
    <>
      <AdBannerTop />
      <div className="page-head">
        <h1 className="page-title">{t.title}</h1>
        <p className="muted">{t.sub}</p>
      </div>
      <SearchBox value={search} onChange={setSearch} label={`Search ${t.title.toLowerCase()}`} autoFocus={mode === "search"} />
      <CategoryFilters categories={cats} value={cat} onChange={setCat} />
      {loading ? null : (
        <ChannelGrid
          channels={list}
          groupKey={`${mode}|${cat}|${search}`}
          empty={
            mode === "favorites" && favorites.length === 0 ? (
              <EmptyState
                title="No favorites yet"
                hint="Tap the heart on any channel to save it here."
                action={<button type="button" className="btn btn--primary" data-focusable onClick={() => setView("home")}>BROWSE CHANNELS</button>}
              />
            ) : (
              <EmptyState
                title="No channels found"
                hint={search ? `Nothing matches “${search}”.` : "Nothing here yet."}
                action={search || cat !== "all" ? <button type="button" className="btn btn--ghost" data-focusable onClick={() => { setSearch(""); setCat("all"); }}>Clear filters</button> : undefined}
              />
            )
          }
        />
      )}
    </>
  );
}
