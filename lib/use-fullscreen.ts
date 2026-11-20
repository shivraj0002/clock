"use client";
import { useEffect, useState } from "react";

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen().catch(() => {});
}

export function useFullscreen() {
  const [isFullscreen, setIs] = useState(false);
  useEffect(() => {
    const on = () => setIs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  return { isFullscreen, toggle: toggleFullscreen };
}
