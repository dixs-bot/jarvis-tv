"use client";

import { useApp } from "@/context/AppContext";
import type { MotionPreference, QualityCap } from "@/types";
import { adConfig } from "@/config/ads";
import { SITE } from "@/config/site";

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="setting">
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" className="switch" data-focusable checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function SettingsView() {
  const { settings, updateSettings, catalog, favorites, history, toast } = useApp();
  const ads = (["top", "bottom", "sidebar", "overlay"] as const).filter((s) => adConfig.enabled && adConfig[s].enabled);
  const adsWithCode = ads.filter((s) => adConfig[s].code.trim()).length;

  return (
    <div className="settings">
      <div className="page-head">
        <h1 className="page-title">Settings</h1>
        <p className="muted">Stored on this device only (localStorage).</p>
      </div>

      <section className="panel" aria-labelledby="s-playback">
        <h2 id="s-playback" className="panel__title">Playback</h2>
        <Toggle label="Autoplay" hint="Start streams automatically when a channel is selected" checked={settings.autoplay} onChange={(v) => updateSettings({ autoplay: v })} />
        <label className="setting">
          <span>
            <strong>Maximum quality</strong>
            <small>Caps HLS quality when the stream offers multiple levels</small>
          </span>
          <select
            className="select"
            data-focusable
            value={String(settings.qualityCap)}
            onChange={(e) => updateSettings({ qualityCap: (e.target.value === "auto" ? "auto" : Number(e.target.value)) as QualityCap })}
          >
            <option value="auto">Auto</option>
            <option value="1080">1080p</option>
            <option value="720">720p</option>
            <option value="480">480p</option>
            <option value="360">360p</option>
          </select>
        </label>
      </section>

      <section className="panel" aria-labelledby="s-display">
        <h2 id="s-display" className="panel__title">Display &amp; motion</h2>
        <label className="setting">
          <span>
            <strong>Animations</strong>
            <small>“System” follows your OS reduced-motion setting</small>
          </span>
          <select className="select" data-focusable value={settings.motion} onChange={(e) => updateSettings({ motion: e.target.value as MotionPreference })}>
            <option value="system">System</option>
            <option value="full">Always on</option>
            <option value="reduced">Reduced</option>
          </select>
        </label>
        <Toggle label="Show clock" checked={settings.showClock} onChange={(v) => updateSettings({ showClock: v })} />
        <Toggle label="Show connection status" checked={settings.showConnection} onChange={(v) => updateSettings({ showConnection: v })} />
        <Toggle label="Compact cards" hint="Smaller channel cards in rails and grids" checked={settings.compactCards} onChange={(v) => updateSettings({ compactCards: v })} />
      </section>

      <section className="panel" aria-labelledby="s-source">
        <h2 id="s-source" className="panel__title">Playlist source</h2>
        <dl className="kv">
          <dt>URL</dt><dd className="break">{catalog?.playlistUrl ?? "—"}</dd>
          <dt>Channels loaded</dt><dd>{catalog?.channels.length ?? 0}</dd>
          <dt>Playlist loaded from</dt><dd>{catalog?.playlistSource === "snapshot" ? "Saved snapshot (live fetch failed)" : catalog?.playlistSource === "direct" ? "Direct browser fetch" : "Live source"}</dd>
          <dt>Stream probe</dt><dd>{catalog?.probedAt ? `${catalog.probedAt} (${catalog.channels.filter((c) => c.flagged).length} flagged, ${catalog.channels.filter((c) => c.unstable).length} unstable)` : "—"}</dd>
          <dt>Last fetched</dt><dd suppressHydrationWarning>{catalog ? new Date(catalog.fetchedAt).toLocaleString() : "—"}</dd>
          <dt>Config source</dt><dd>{catalog?.configSource === "static-defaults" ? "Static defaults (no server persistence)" : catalog?.configSource ?? "—"}</dd>
          <dt>Ad slots enabled</dt><dd>{ads.length} ({adsWithCode} with code)</dd>
        </dl>
        <p className="muted small">Configure public playlists with NEXT_PUBLIC_PLAYLIST_URL, or use server-only PLAYLIST_URL and PLAYLIST_TOKEN for a Bearer-authenticated M3U endpoint. Restart the server after changes. {SITE.name} does not store your token.</p>
      </section>

      <section className="panel" aria-labelledby="s-data">
        <h2 id="s-data" className="panel__title">Local data</h2>
        <p className="muted small">{favorites.length} favorite(s) · {history.length} recently watched</p>
        <div className="row">
          <button type="button" className="btn btn--ghost" data-focusable onClick={() => { localStorage.removeItem("jarvistv.history.v1"); location.reload(); }}>
            Clear watch history
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            data-focusable
            onClick={() => { updateSettings({ autoplay: true, motion: "system", showClock: true, showConnection: true, compactCards: false, qualityCap: "auto" }); toast("info", "Settings reset"); }}
          >
            Reset settings
          </button>
        </div>
      </section>
    </div>
  );
}
