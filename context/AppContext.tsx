"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Channel, ChannelCatalog, HistoryEntry, ToastItem, ToastKind, UserSettings, ViewId } from "@/types";
import { loadCatalog } from "@/services/channelService";
import { readJSON, writeJSON } from "@/lib/storage";
import { MAX_HISTORY, STORAGE } from "@/config/site";

export const DEFAULT_SETTINGS: UserSettings = {
  autoplay: true,
  motion: "system",
  showClock: true,
  showConnection: true,
  compactCards: false,
  qualityCap: "auto",
};

interface AppState {
  catalog: ChannelCatalog | null;
  loading: boolean;
  error: string | null;
  reload: () => void;

  view: ViewId;
  setView: (v: ViewId) => void;

  current: Channel | null;
  playChannel: (c: Channel, opts?: { goLive?: boolean; silent?: boolean }) => void;
  /** Bumped every time the user explicitly asks to play (so autoplay-off still starts on click). */
  playNonce: number;

  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (c: Channel) => void;

  history: HistoryEntry[];

  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;

  channelCenterOpen: boolean;
  openChannelCenter: () => void;
  closeChannelCenter: () => void;

  search: string;
  setSearch: (s: string) => void;

  toasts: ToastItem[];
  toast: (kind: ToastKind, message: string) => void;
  dismissToast: (id: number) => void;

  hydrated: boolean;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<ChannelCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [view, setView] = useState<ViewId>("home");
  const [current, setCurrent] = useState<Channel | null>(null);
  const [playNonce, setPlayNonce] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [channelCenterOpen, setCenterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const toastId = useRef(0);
  const toastTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Hydrate client-only state after mount (avoids hydration mismatches).
  useEffect(() => {
    setFavorites(readJSON<string[]>(STORAGE.favorites, []));
    setHistory(readJSON<HistoryEntry[]>(STORAGE.history, []));
    setSettings({ ...DEFAULT_SETTINGS, ...readJSON<Partial<UserSettings>>(STORAGE.settings, {}) });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON(STORAGE.favorites, favorites);
  }, [favorites, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(STORAGE.history, history);
  }, [history, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(STORAGE.settings, settings);
  }, [settings, hydrated]);

  // Load catalog.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loadCatalog()
      .then((c) => {
        if (!alive) return;
        setCatalog(c);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load channels");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  // Restore last channel (without autoplay side effects on its own).
  useEffect(() => {
    if (!catalog || current) return;
    const lastId = readJSON<string | null>(STORAGE.lastChannel, null);
    const found = lastId ? catalog.channels.find((c) => c.id === lastId) : undefined;
    setCurrent(found ?? catalog.featured[0] ?? catalog.channels[0] ?? null);
  }, [catalog, current]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const t = toastTimers.current.get(id);
    if (t) clearTimeout(t);
    toastTimers.current.delete(id);
  }, []);

  const toast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-2), { id, kind, message }]);
      toastTimers.current.set(
        id,
        setTimeout(() => dismissToast(id), 3200),
      );
    },
    [dismissToast],
  );

  const playChannel = useCallback(
    (c: Channel, opts?: { goLive?: boolean; silent?: boolean }) => {
      setCurrent(c);
      setPlayNonce((n) => n + 1);
      writeJSON(STORAGE.lastChannel, c.id);
      setHistory((h) => {
        const prev = h.find((x) => x.channelId === c.id);
        const entry: HistoryEntry = { channelId: c.id, lastWatched: Date.now(), plays: (prev?.plays ?? 0) + 1 };
        return [entry, ...h.filter((x) => x.channelId !== c.id)].slice(0, MAX_HISTORY);
      });
      if (opts?.goLive !== false) setView("live");
      if (!opts?.silent) toast("success", `Now playing: ${c.name}`);
    },
    [toast],
  );

  const toggleFavorite = useCallback(
    (c: Channel) => {
      setFavorites((f) => {
        const has = f.includes(c.id);
        // toast outside of the reducer's purity concerns
        queueMicrotask(() => toast("info", has ? `Removed ${c.name} from favorites` : `Added ${c.name} to favorites`));
        return has ? f.filter((x) => x !== c.id) : [c.id, ...f];
      });
    },
    [toast],
  );

  const value = useMemo<AppState>(
    () => ({
      catalog,
      loading,
      error,
      reload: () => setReloadKey((k) => k + 1),
      view,
      setView,
      current,
      playChannel,
      playNonce,
      favorites,
      isFavorite: (id: string) => favorites.includes(id),
      toggleFavorite,
      history,
      settings,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      channelCenterOpen,
      openChannelCenter: () => setCenterOpen(true),
      closeChannelCenter: () => setCenterOpen(false),
      search,
      setSearch,
      toasts,
      toast,
      dismissToast,
      hydrated,
    }),
    [catalog, loading, error, view, current, playChannel, playNonce, favorites, toggleFavorite, history, settings, channelCenterOpen, search, toasts, toast, dismissToast, hydrated],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
