 "use client";

import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Radio, Search, Tv2, Play, Signal, ShieldCheck, ExternalLink } from "lucide-react";

type Channel = { name: string; url: string; group: string; logo?: string };

const PLAYLIST_URL = "https://iptv-org.github.io/iptv/countries/id.m3u";

function parseM3U(text: string): Channel[] {
  const lines = text.split(/\r?\n/);
  const result: Channel[] = [];
  let pending: Omit<Channel, "url"> | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const name = line.split(",").slice(1).join(",").trim() || "Channel";
      const group = line.match(/group-title="([^"]*)"/i)?.[1] || "Indonesia";
      const logo = line.match(/tvg-logo="([^"]*)"/i)?.[1];
      pending = { name, group, logo };
    } else if (!line.startsWith("#") && /^https?:\/\//i.test(line)) {
      if (pending) result.push({ ...pending, url: line });
      pending = null;
    }
  }
  return result;
}

function initials(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/);
  return cleaned.slice(0, 2).map((s) => s[0] || "").join("").toUpperCase() || "TV";
}

function AdSlot({ label }: { label: string }) {
  return (
    <div className="ad-slot" aria-label={`Slot iklan ${label}`}>
      <div><small>RUANG IKLAN · {label}</small>Tempat iklan JARVIS TV<br /><span style={{ opacity: .7 }}>Pasang kode unit Adsterra di komponen AdSlot</span></div>
    </div>
  );
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [playlistError, setPlaylistError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch(PLAYLIST_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`Playlist tidak bisa dimuat (HTTP ${response.status}).`);
        const parsed = parseM3U(await response.text());
        if (!parsed.length) throw new Error("Playlist terbuka tetapi tidak berisi channel yang bisa dibaca.");
        if (!cancelled) {
          setChannels(parsed);
          setSelected(parsed[0]);
          setPlaylistError("");
        }
      } catch (error) {
        if (!cancelled) setPlaylistError(error instanceof Error ? error.message : "Gagal memuat playlist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selected?.url) return;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    video.pause();
    video.removeAttribute("src");
    video.load();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = selected.url;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, backBufferLength: 30 });
      hlsRef.current = hls;
      hls.loadSource(selected.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else {
      setPlaylistError("Browser ini tidak mendukung pemutaran HLS. Coba Chrome versi terbaru.");
    }
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [selected]);

  const groups = useMemo(() => ["Semua", ...Array.from(new Set(channels.map((c) => c.group))).sort((a, b) => a.localeCompare(b))], [channels]);
  const visibleChannels = useMemo(() => channels.filter((c) =>
    (group === "Semua" || c.group === group) && c.name.toLowerCase().includes(query.toLowerCase())
  ), [channels, group, query]);

  return (
    <>
      <header className="topbar">
        <div className="shell nav">
          <a className="brand" href="#" aria-label="JARVIS TV beranda">
            <span className="brand-mark"><Tv2 size={23} strokeWidth={2.4} /></span>
            <span>JARVIS TV<small>LIVE STREAMING INDONESIA</small></span>
          </a>
          <span className="nav-tag"><Radio size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /> IPTV PUBLIC PLAYLIST</span>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <div>
            <span className="eyebrow"><i className="live-dot" /> Streaming pilihan Indonesia</span>
            <h1>Hiburan Indonesia,<br /><span>dalam satu layar.</span></h1>
            <p>Jelajahi channel TV Indonesia dari playlist publik. Pilih channel di daftar, lalu tonton langsung dari pemutar JARVIS TV.</p>
            <div className="hero-stats">
              <div className="stat"><strong>{channels.length || "—"}</strong> channel terdaftar</div>
              <div className="stat"><ShieldCheck size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} /> Playlist publik</div>
              <div className="stat"><Signal size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} /> HLS / M3U8</div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-title">JARVIS TV · YOUR STREAMING HUB</div>
            <h2>Satu tempat untuk<br />menemukan siaran.</h2>
            <p>Channel bisa berubah sesuai ketersediaan sumber streaming.</p>
            <span className="pill">● LIVE CHANNEL DIRECTORY</span>
          </div>
        </section>

        <AdSlot label="BANNER ATAS" />

        <section>
          <div className="section-head">
            <div><h2>TV Live Indonesia</h2><p>Pilih channel untuk mulai menonton.</p></div>
            <span className="count">{loading ? "Memuat playlist…" : `${channels.length} channel tersedia`}</span>
          </div>

          {playlistError && <div className="notice" role="status">{playlistError} Pastikan koneksi internet aktif. Playlist juga bisa dibuka langsung: <a href={PLAYLIST_URL} target="_blank" rel="noreferrer"><u>lihat file M3U</u></a>.</div>}

          <div className="content-grid">
            <div className="player-card">
              <div className="player-head">
                <div className="channel-info">
                  <div className="channel-logo">{selected ? initials(selected.name) : <Tv2 size={20} />}</div>
                  <div style={{ minWidth: 0 }}>
                    <h3>{selected?.name || "Pilih channel TV"}</h3>
                    <p>{selected?.group || "JARVIS TV Player"}</p>
                  </div>
                </div>
                <span className="live-label"><i className="live-dot" style={{ display: "inline-block", width: 6, height: 6, marginRight: 5 }} /> LIVE</span>
              </div>
              <div className="video-wrap">
                <video ref={videoRef} controls playsInline preload="none" aria-label="Pemutar siaran TV" />
                {!selected && <div className="video-empty"><div className="play-big"><Play size={24} fill="currentColor" /></div><strong>{loading ? "Memuat daftar channel…" : "Channel belum dipilih"}</strong><span>Pilih channel yang tersedia di daftar sebelah kanan.</span></div>}
              </div>
              <div className="player-foot">
                <span className="status"><i /> Pemutar HLS aktif</span>
                <span>Jika gagal diputar, coba channel lain.</span>
              </div>
            </div>

            <aside className="side-card">
              <h3>Daftar Channel</h3>
              <p>Playlist negara Indonesia · diperbarui dari sumber publik.</p>
              <label className="search">
                <Search size={16} color="#7f9ab8" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama channel…" aria-label="Cari channel" />
              </label>
              <div className="filters">
                {groups.slice(0, 5).map((g) => <button key={g} className={`filter ${group === g ? "active" : ""}`} onClick={() => setGroup(g)}>{g === "Semua" ? "Semua" : g.length > 16 ? `${g.slice(0, 16)}…` : g}</button>)}
                {groups.length > 5 && <select aria-label="Pilih kategori" value={group} onChange={(e) => setGroup(e.target.value)} style={{ maxWidth: "100%", background: "#0d1b2b", color: "#b8cbe0", border: "1px solid #2b4057", borderRadius: 999, padding: "7px 9px", fontSize: 11 }}><option value="Semua">Kategori lainnya…</option>{groups.slice(5).map((g) => <option key={g} value={g}>{g}</option>)}</select>}
              </div>
              <div className="channel-list">
                {loading && <div className="empty">Sedang mengambil playlist M3U…</div>}
                {!loading && visibleChannels.slice(0, 150).map((channel, index) => (
                  <button key={`${channel.url}-${index}`} className={`channel-item ${selected?.url === channel.url ? "selected" : ""}`} onClick={() => { setSelected(channel); setPlaylistError(""); }}>
                    <span className="mini-logo">{initials(channel.name)}</span>
                    <span className="channel-text"><strong>{channel.name}</strong><span>{channel.group}</span></span>
                    <span className="arrow">›</span>
                  </button>
                ))}
                {!loading && !visibleChannels.length && <div className="empty">Channel tidak ditemukan.</div>}
              </div>
              <div className="notice">Sumber streaming dikelola pihak ketiga. Ketersediaan, hak siar, dan kualitas tiap channel bisa berbeda. <a href={PLAYLIST_URL} target="_blank" rel="noreferrer"><u>Sumber playlist <ExternalLink size={10} style={{ display: "inline", verticalAlign: "-1px" }} /></u></a></div>
            </aside>
          </div>
        </section>

        <AdSlot label="BANNER BAWAH" />

        <footer className="footer">
          <div className="footer-inner">
            <div><strong style={{ color: "#c7d9ed" }}>JARVIS TV</strong><br />Direktori streaming TV Indonesia.</div>
            <div>JARVIS TV tidak meng-host siaran. Link berasal dari playlist publik pihak ketiga.<br />Pastikan penggunaan dan penayangan sesuai hak siar serta ketentuan sumber.</div>
          </div>
        </footer>
      </main>
    </>
  );
}
