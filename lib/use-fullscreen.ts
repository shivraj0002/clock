"use client";
import { useEffect, useState } from "react";
import { fullscreenSupported } from "./platform";

type FsDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

const current = () => {
  const d = document as FsDoc;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
};

/** Returns false when the browser has no fullscreen API (iPhone Safari). */
export function toggleFullscreen(): boolean {
  if (!fullscreenSupported()) return false;
  const d = document as FsDoc;
  if (current()) {
    void (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.());
  } else {
    const e = document.documentElement as FsEl;
    const r = e.requestFullscreen?.() ?? e.webkitRequestFullscreen?.();
    if (r instanceof Promise) r.catch(() => {});
  }
  return true;
}

export function useFullscreen() {
  const [isFullscreen, setIs] = useState(false);
  useEffect(() => {
    const on = () => setIs(!!current());
    document.addEventListener("fullscreenchange", on);
    document.addEventListener("webkitfullscreenchange", on);
    return () => {
      document.removeEventListener("fullscreenchange", on);
      document.removeEventListener("webkitfullscreenchange", on);
    };
  }, []);
  return { isFullscreen, toggle: toggleFullscreen };
}
