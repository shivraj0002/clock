"use client";
import { useSyncExternalStore } from "react";

type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

export const fullscreenSupported = () => {
  const e = document.documentElement as FsEl;
  return !!(e.requestFullscreen || e.webkitRequestFullscreen);
};

export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const snap = () => `${fullscreenSupported() ? 1 : 0}${isStandalone() ? 1 : 0}${isIOS() ? 1 : 0}`;

/** fsSupported: page fullscreen API usable. standalone: running as installed app (already fullscreen). */
export function usePlatform() {
  const s = useSyncExternalStore(
    () => () => {},
    snap,
    () => "100",
  );
  return { fsSupported: s[0] === "1", standalone: s[1] === "1", ios: s[2] === "1" };
}
