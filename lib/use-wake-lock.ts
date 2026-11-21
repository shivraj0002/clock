"use client";
import { useEffect } from "react";

const GESTURES = ["pointerdown", "touchend", "click", "keydown"] as const;

/**
 * Keeps the screen awake while enabled.
 * 1. Native Screen Wake Lock (re-acquired when the tab becomes visible).
 * 2. Fallback for browsers without it or where it is blocked (iOS Safari < 16.4,
 *    iOS home-screen apps < 18.4): a hidden looping muted video, which iOS treats as media playback.
 *    Needs a user gesture, so it starts on the first tap if autoplay is refused.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    let nativeOk = false;
    let video: HTMLVideoElement | null = null;
    let armed = false;

    const playVideo = () => {
      if (!video) {
        video = document.createElement("video");
        video.setAttribute("playsinline", "");
        video.setAttribute("muted", "");
        video.muted = true;
        video.loop = true;
        video.src = "/nosleep.mp4";
        video.setAttribute("aria-hidden", "true");
        video.style.cssText = "position:fixed;width:1px;height:1px;opacity:0.01;pointer-events:none;left:0;top:0";
        document.body.appendChild(video);
      }
      return video.play();
    };

    const onGesture = () => {
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture));
      armed = false;
      if (!cancelled && !nativeOk) playVideo().catch(() => {});
    };

    const armFallback = () => {
      if (armed || cancelled) return;
      playVideo().catch(() => {
        // Autoplay refused: wait for the next user gesture.
        armed = true;
        GESTURES.forEach((g) => window.addEventListener(g, onGesture, { passive: true }));
      });
    };

    const acquire = async () => {
      nativeOk = false;
      if ("wakeLock" in navigator) {
        try {
          const l = await navigator.wakeLock.request("screen");
          if (cancelled) {
            void l.release();
            return;
          }
          lock = l;
          nativeOk = true;
          video?.pause();
          return;
        } catch {
          /* blocked or unsupported: use fallback */
        }
      }
      armFallback();
    };

    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      void acquire();
      if (!nativeOk && video) video.play().catch(() => {});
    };

    void acquire();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture));
      void lock?.release();
      video?.pause();
      video?.remove();
    };
  }, [enabled]);
}
