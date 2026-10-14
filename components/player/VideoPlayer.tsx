"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AnimatePresence, motion } from "framer-motion";
import type { Channel } from "@/types";
import { useApp } from "@/context/AppContext";
import { setStatus } from "@/services/streamCheck";
import { readJSON, writeJSON } from "@/lib/storage";
import { STORAGE } from "@/config/site";
import { FullscreenIcon, GridIcon, PauseIcon, PlayIcon, RetryIcon, VolumeIcon, AlertIcon } from "@/components/ui/Icons";
import { dur, ease } from "@/lib/motion";
import { ChannelLogo } from "@/components/channels/ChannelLogo";

type PState = "idle" | "loading" | "playing" | "paused" | "error";

function describeError(kind: string): string {
  switch (kind) {
    case "network":
      return "Network or CORS error — the stream server did not respond or blocks browser playback.";
    case "media":
      return "This stream's format or codec is not supported by your browser.";
    case "unsupported":
      return "Your browser cannot play HLS streams.";
    case "autoplay":
      return "Playback was blocked by the browser. Press play to start.";
    default:
      return "This channel is currently unavailable. The link may be dead or offline.";
  }
}

export function VideoPlayer({ channel }: { channel: Channel }) {
  const { settings, playNonce, openChannelCenter, toast } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PState>("idle");
  const [errMsg, setErrMsg] = useState("");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [qualities, setQualities] = useState<Array<{ index: number; height: number }>>([]);
  const lastNonce = useRef(playNonce);
  const toastedFor = useRef<string>("");

  // Restore volume once on mount.
  useEffect(() => {
    const v = readJSON<{ volume: number; muted: boolean }>(STORAGE.volume, { volume: 1, muted: false });
    setVolume(v.volume);
    setMuted(v.muted);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted]);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // (Re)load the stream whenever the channel changes or retry is pressed.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const explicitPlay = lastNonce.current !== playNonce;
    lastNonce.current = playNonce;
    const shouldPlay = settings.autoplay || explicitPlay || retryKey > 0;

    destroyHls();
    setQualities([]);
    setErrMsg("");
    video.removeAttribute("src");
    video.load();

    let disposed = false;
    const fail = (kind: string) => {
      if (disposed) return;
      destroyHls();
      setStatus(channel.streamUrl, "error");
      setErrMsg(describeError(kind));
      setState("error");
      if (toastedFor.current !== channel.streamUrl + retryKey) {
        toastedFor.current = channel.streamUrl + retryKey;
        toast("error", `Could not play ${channel.name}`);
      }
    };

    const tryPlay = () => {
      if (!shouldPlay) {
        setState("paused");
        return;
      }
      video.play().catch(() => {
        if (disposed) return;
        setState("paused"); // autoplay policy — user can press play
      });
    };

    setState("loading");
    const url = channel.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false, manifestLoadingMaxRetry: 2, levelLoadingMaxRetry: 2, fragLoadingMaxRetry: 3 });
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const q = data.levels.map((l, index) => ({ index, height: l.height })).filter((l) => l.height > 0);
        setQualities(q);
        setStatus(url, "ok");
        tryPlay();
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          // One recovery attempt, then give up.
          if (!(hls as unknown as { __rec?: boolean }).__rec) {
            (hls as unknown as { __rec?: boolean }).__rec = true;
            hls.recoverMediaError();
            return;
          }
          fail("media");
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          fail("network");
        } else {
          fail("other");
        }
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const onMeta = () => {
        setStatus(url, "ok");
        tryPlay();
      };
      const onErr = () => fail("network");
      video.addEventListener("loadedmetadata", onMeta, { once: true });
      video.addEventListener("error", onErr, { once: true });
      video.src = url;
      video.load();
      return () => {
        disposed = true;
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("error", onErr);
        video.removeAttribute("src");
        video.load();
      };
    } else {
      fail("unsupported");
    }

    return () => {
      disposed = true;
      destroyHls();
      video.removeAttribute("src");
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.streamUrl, retryKey, playNonce, destroyHls]);

  // Quality cap (only when HLS.js exposes levels).
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls || qualities.length === 0) return;
    if (settings.qualityCap === "auto") {
      hls.autoLevelCapping = -1;
      return;
    }
    const cap = settings.qualityCap;
    let idx = -1;
    qualities.forEach((q) => {
      if (q.height <= cap && (idx === -1 || q.height > (qualities.find((x) => x.index === idx)?.height ?? 0))) idx = q.index;
    });
    hls.autoLevelCapping = idx === -1 ? 0 : idx;
  }, [settings.qualityCap, qualities]);

  // Reflect real <video> events.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlaying = () => setState("playing");
    const onPause = () => setState((s) => (s === "error" || s === "loading" ? s : "paused"));
    const onWaiting = () => setState((s) => (s === "playing" ? "loading" : s));
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v || state === "error") return;
    if (v.paused) v.play().catch(() => setState("paused"));
    else v.pause();
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => toast("error", "Fullscreen is not available"));
  };

  const persistVol = (vol: number, m: boolean) => writeJSON(STORAGE.volume, { volume: vol, muted: m });

  return (
    <section className="player" aria-label="Live TV player">
      <div className="player__bar">
        <div className="player__now">
          <ChannelLogo name={channel.name} logo={channel.logo} size="sm" />
          <div>
            <p className="eyebrow">NOW PLAYING</p>
            <h2 className="player__name">{channel.name}</h2>
          </div>
          <span className="badge badge--live"><i /> LIVE</span>
        </div>
        <button type="button" className="btn btn--primary" data-focusable onClick={openChannelCenter} aria-label="Change channel">
          <GridIcon width={18} height={18} /> CHANNELS
        </button>
      </div>

      <div className="player__frame" ref={wrapRef}>
        <video
          ref={videoRef}
          className="player__video"
          playsInline
          preload="none"
          aria-label={`${channel.name} live stream`}
          onClick={toggle}
        />
        <AnimatePresence>
          {state === "loading" && (
            <motion.div className="player__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.base, ease }} role="status">
              <span className="spinner" aria-hidden="true" />
              <span>Loading {channel.name}…</span>
            </motion.div>
          )}
          {state === "error" && (
            <motion.div className="player__overlay player__overlay--error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.base, ease }} role="alert">
              <AlertIcon width={34} height={34} />
              <strong>Channel unavailable</strong>
              <p>{errMsg}</p>
              <div className="row">
                <button type="button" className="btn btn--primary" data-focusable onClick={() => setRetryKey((k) => k + 1)}>
                  <RetryIcon width={18} height={18} /> RETRY
                </button>
                {channel.name.toLowerCase().includes("rcti") && (
                  <a
                    className="btn btn--ghost"
                    data-focusable
                    href="https://www.rctiplus.com/tv/rcti"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WATCH ON RCTI+
                  </a>
                )}
                <button type="button" className="btn btn--ghost" data-focusable onClick={openChannelCenter}>
                  CHOOSE ANOTHER
                </button>
              </div>
            </motion.div>
          )}
          {state === "paused" && (
            <motion.button
              type="button"
              className="player__bigplay"
              data-focusable
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur.base, ease }}
              onClick={toggle}
              aria-label="Play"
            >
              <PlayIcon width={34} height={34} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Controls live below the video so ads/overlays can never cover them. */}
      <div className="player__controls" role="group" aria-label="Player controls">
        <button type="button" className="icon-btn icon-btn--lg" data-focusable onClick={toggle} aria-label={state === "playing" ? "Pause" : "Play"} disabled={state === "error"}>
          {state === "playing" ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className="icon-btn"
          data-focusable
          onClick={() => {
            setMuted((m) => {
              persistVol(volume, !m);
              return !m;
            });
          }}
          aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
          aria-pressed={muted}
        >
          <VolumeIcon muted={muted || volume === 0} />
        </button>
        <input
          type="range"
          className="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          aria-label="Volume"
          data-focusable
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            setMuted(v === 0);
            persistVol(v, v === 0);
          }}
        />
        <span className="player__meta">
          {channel.quality ? `${channel.quality} · ` : ""}
          {qualities.length > 0 ? `${qualities.length} quality level${qualities.length > 1 ? "s" : ""}` : "Live stream"}
        </span>
        <button type="button" className="icon-btn" data-focusable onClick={fullscreen} aria-label="Toggle fullscreen">
          <FullscreenIcon />
        </button>
      </div>
    </section>
  );
}
