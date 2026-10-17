"use client";

import { useState } from "react";

type DisplayMode = "page" | "mjpeg";

function validateUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export default function PhoneMirrorPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [mode, setMode] = useState<DisplayMode>("page");
  const [message, setMessage] = useState("");

  function connect() {
    const clean = inputUrl.trim();
    const valid = validateUrl(clean);
    if (!valid) {
      setMessage("URL tidak valid. Masukkan alamat HTTP/HTTPS yang ditampilkan aplikasi di HP.");
      setStreamUrl("");
      return;
    }
    setMessage("");
    setStreamUrl(valid);
  }

  function disconnect() {
    setStreamUrl("");
    setMessage("");
  }

  return (
    <main className="mirror-page">
      <div className="mirror-wrap">
        <a className="mirror-back" href="/">← Kembali ke JARVIS TV</a>
        <header className="mirror-heading">
          <p className="eyebrow">JARVIS TV · WIRELESS TOOLS</p>
          <h1>Phone Mirror</h1>
          <p className="muted">
            Tampilkan layar Android 9 melalui Wi-Fi. HP dan laptop harus terhubung ke jaringan yang sama.
          </p>
        </header>

        <section className="mirror-panel" aria-label="Pengaturan koneksi mirroring">
          <label className="mirror-label" htmlFor="phone-stream-url">URL streaming dari HP</label>
          <div className="mirror-connect-row">
            <input
              id="phone-stream-url"
              className="mirror-input"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="http://192.168.1.20:8080"
              value={inputUrl}
              onChange={(event) => setInputUrl(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") connect(); }}
              aria-describedby="mirror-url-help"
            />
            <button className="btn btn--primary" type="button" onClick={connect}>HUBUNGKAN</button>
            <button className="btn btn--ghost" type="button" onClick={disconnect}>PUTUSKAN</button>
          </div>
          <p id="mirror-url-help" className="mirror-help">
            Gunakan alamat yang muncul setelah kamu menekan Start/Start Streaming di aplikasi pengirim layar.
          </p>
          {message && <p className="mirror-error" role="alert">{message}</p>}

          <div className="mirror-mode-row" role="group" aria-label="Mode tampilan">
            <span className="mirror-label">Mode tampilan</span>
            <button type="button" className={`btn ${mode === "page" ? "btn--primary" : "btn--ghost"}`} aria-pressed={mode === "page"} onClick={() => setMode("page")}>HALAMAN APLIKASI</button>
            <button type="button" className={`btn ${mode === "mjpeg" ? "btn--primary" : "btn--ghost"}`} aria-pressed={mode === "mjpeg"} onClick={() => setMode("mjpeg")}>MJPEG LANGSUNG</button>
          </div>
          <p className="mirror-help">
            Pilih Halaman Aplikasi untuk URL utama ScreenStream. Pilih MJPEG Langsung hanya jika alamat yang kamu punya memang URL gambar-stream MJPEG, bukan halaman web biasa.
          </p>
        </section>

        <section className="mirror-screen" aria-label="Pratinjau layar HP">
          <div className="mirror-screen-bar">
            <strong>LIVE SCREEN</strong>
            <span className={streamUrl ? "mirror-status mirror-status--on" : "mirror-status"}>
              {streamUrl ? "URL TERPASANG" : "MENUNGGU KONEKSI"}
            </span>
          </div>
          <div className="mirror-screen-content">
            {!streamUrl ? (
              <div className="mirror-empty">
                <span className="mirror-phone-icon" aria-hidden="true">▯</span>
                <h2>Belum terhubung</h2>
                <p>Mulai streaming di HP, lalu masukkan URL lokalnya di kolom atas.</p>
              </div>
            ) : mode === "page" ? (
              <iframe
                key={streamUrl}
                src={streamUrl}
                title="Layar HP Android"
                allow="autoplay; fullscreen"
                referrerPolicy="no-referrer"
                className="mirror-frame"
              />
            ) : (
              // A raw MJPEG endpoint can be rendered by an img element in modern browsers.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={streamUrl} className="mirror-mjpeg" src={streamUrl} alt="Live screen Android" />
            )}
          </div>
          {streamUrl && (
            <div className="mirror-open-source">
              <a href={streamUrl} target="_blank" rel="noopener noreferrer">Buka sumber streaming di tab baru ↗</a>
            </div>
          )}
        </section>

        <section className="mirror-guide">
          <h2>Cara menghubungkan Android 9</h2>
          <ol>
            <li>Install <a href="https://github.com/dkrivoruchko/ScreenStream" target="_blank" rel="noopener noreferrer">ScreenStream</a> di HP.</li>
            <li>Sambungkan HP dan laptop ke Wi-Fi yang sama.</li>
            <li>Di ScreenStream, pilih <strong>Local mode (MJPEG)</strong>, mulai streaming, lalu izinkan perekaman layar.</li>
            <li>Salin URL lokal yang ditampilkan aplikasi ke kolom di atas, kemudian tekan <strong>Hubungkan</strong>.</li>
            <li>Jika preview tidak tampil, buka URL sumber di tab baru untuk memastikan HP dapat dijangkau dari laptop.</li>
          </ol>
          <p className="mirror-warning">
            Keamanan: Local mode dapat diakses perangkat lain di jaringan dan tidak mengenkripsi video. Aktifkan PIN bila tersedia, gunakan jaringan tepercaya, dan hentikan streaming setelah selesai. Audio tidak tersedia di mode MJPEG.
          </p>
          <p className="mirror-warning">
            Untuk penggunaan lokal, buka JARVIS TV dari alamat HTTP laptop (misalnya http://IP-LAPTOP:5173/mirror). Browser dapat memblokir URL HTTP lokal jika halaman JARVIS TV dibuka melalui HTTPS/Vercel.
          </p>
        </section>
      </div>
    </main>
  );
}
